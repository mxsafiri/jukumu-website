import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthTokenPayload } from '@/lib/auth';
import { parseUnits } from 'viem';

const NETWORK = 'base';
const USDC_BASE_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_DECIMALS = 6;
const MAX_PG_BIGINT = BigInt('9223372036854775807');

const LEADERSHIP_ROLES = new Set(['leader', 'mwenyekiti', 'katibu', 'mwekahazina']);

async function ensureWalletSchema(client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS group_wallets (
      id SERIAL PRIMARY KEY,
      group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      network VARCHAR(50) NOT NULL DEFAULT 'base',
      cdp_account_name VARCHAR(100) NOT NULL,
      evm_address VARCHAR(42) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id),
      UNIQUE(cdp_account_name),
      UNIQUE(evm_address)
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS group_wallet_transfers (
      id SERIAL PRIMARY KEY,
      group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      wallet_id INTEGER NOT NULL REFERENCES group_wallets(id) ON DELETE CASCADE,
      proposed_by_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      token_address VARCHAR(42) NOT NULL,
      token_symbol VARCHAR(20) NOT NULL,
      to_address VARCHAR(42) NOT NULL,
      amount_base_units BIGINT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'executed', 'rejected')),
      approvals_required INTEGER NOT NULL DEFAULT 2,
      executed_tx_hash VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS group_wallet_transfer_approvals (
      id SERIAL PRIMARY KEY,
      transfer_id INTEGER NOT NULL REFERENCES group_wallet_transfers(id) ON DELETE CASCADE,
      approved_by_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      approved_by_role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(transfer_id, approved_by_role)
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_group_wallet_transfers_group_id ON group_wallet_transfers(group_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_group_wallet_transfers_created_at ON group_wallet_transfers(created_at DESC);
  `);
}

async function getMembership(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  userId: number,
  groupId: number
) {
  const membershipRes = await client.query(
    `
      SELECT gm.member_id, gm.role, gm.status
      FROM group_members gm
      JOIN members m ON m.id = gm.member_id
      WHERE m.user_id = $1
        AND gm.group_id = $2
      LIMIT 1
    `,
    [userId, groupId]
  );

  if (membershipRes.rows.length === 0) return null;
  return membershipRes.rows[0] as { member_id: number; role: string; status: string };
}

function asEvmAddress(value: string): `0x${string}` | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(v)) return null;
  return v as `0x${string}`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthTokenPayload(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const groupId = Number.parseInt(id, 10);
  if (!Number.isFinite(groupId)) {
    return NextResponse.json({ error: 'Invalid group id' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await ensureWalletSchema(client);

    const membership = await getMembership(client, auth.userId, groupId);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transfersRes = await client.query(
      `
        SELECT
          t.id,
          t.to_address,
          t.amount_base_units,
          t.status,
          t.approvals_required,
          t.executed_tx_hash,
          t.created_at,
          t.updated_at,
          COALESCE(a.approval_count, 0) AS approval_count
        FROM group_wallet_transfers t
        LEFT JOIN (
          SELECT transfer_id, COUNT(*)::int AS approval_count
          FROM group_wallet_transfer_approvals
          GROUP BY transfer_id
        ) a ON a.transfer_id = t.id
        WHERE t.group_id = $1
        ORDER BY t.created_at DESC, t.id DESC
        LIMIT 100
      `,
      [groupId]
    );

    return NextResponse.json({ success: true, membership, transfers: transfersRes.rows });
  } catch (error) {
    console.error('Member group wallet transfers GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthTokenPayload(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const groupId = Number.parseInt(id, 10);
  if (!Number.isFinite(groupId)) {
    return NextResponse.json({ error: 'Invalid group id' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const toAddressRaw = typeof body?.toAddress === 'string' ? body.toAddress.trim() : '';
  const amountRaw = typeof body?.amount === 'string' ? body.amount.trim() : '';

  const toAddress = asEvmAddress(toAddressRaw);
  if (!toAddress) {
    return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
  }

  let amountBaseUnits: bigint;
  try {
    amountBaseUnits = parseUnits(amountRaw, USDC_DECIMALS);
  } catch {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  if (amountBaseUnits <= BigInt(0)) {
    return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
  }

  if (amountBaseUnits > MAX_PG_BIGINT) {
    return NextResponse.json({ error: 'Amount too large' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await ensureWalletSchema(client);

    const membership = await getMembership(client, auth.userId, groupId);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!LEADERSHIP_ROLES.has(membership.role)) {
      return NextResponse.json({ error: 'You do not have permission to propose transfers' }, { status: 403 });
    }

    const walletRes = await client.query(
      `
        SELECT id, network
        FROM group_wallets
        WHERE group_id = $1
        LIMIT 1
      `,
      [groupId]
    );

    if (walletRes.rows.length === 0) {
      return NextResponse.json({ error: 'Group wallet not found. Create wallet first.' }, { status: 400 });
    }

    const wallet = walletRes.rows[0] as { id: number; network: string };
    if (wallet.network !== NETWORK) {
      return NextResponse.json({ error: 'Unsupported wallet network' }, { status: 400 });
    }

    const insertRes = await client.query(
      `
        INSERT INTO group_wallet_transfers (
          group_id,
          wallet_id,
          proposed_by_member_id,
          token_address,
          token_symbol,
          to_address,
          amount_base_units
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        groupId,
        wallet.id,
        membership.member_id,
        USDC_BASE_CONTRACT,
        'USDC',
        toAddress,
        amountBaseUnits.toString()
      ]
    );

    const transferId = (insertRes.rows[0] as { id: number }).id;

    const transferRes = await client.query(
      `
        SELECT
          t.id,
          t.to_address,
          t.amount_base_units,
          t.status,
          t.approvals_required,
          t.executed_tx_hash,
          t.created_at,
          t.updated_at
        FROM group_wallet_transfers t
        WHERE t.id = $1
        LIMIT 1
      `,
      [transferId]
    );

    return NextResponse.json({ success: true, membership, transfer: transferRes.rows[0] || null });
  } catch (error) {
    console.error('Member group wallet transfers POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
