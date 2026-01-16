import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthTokenPayload } from '@/lib/auth';

const APPROVER_ROLES = new Set(['mwenyekiti', 'katibu', 'mwekahazina']);

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; transferId: string }> }
) {
  const auth = getAuthTokenPayload(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, transferId } = await params;
  const groupId = Number.parseInt(id, 10);
  const transferPk = Number.parseInt(transferId, 10);
  if (!Number.isFinite(groupId) || !Number.isFinite(transferPk)) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await ensureWalletSchema(client);

    const membership = await getMembership(client, auth.userId, groupId);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!APPROVER_ROLES.has(membership.role)) {
      return NextResponse.json({ error: 'You do not have permission to approve transfers' }, { status: 403 });
    }

    const transferRes = await client.query(
      `
        SELECT id, group_id, status, approvals_required
        FROM group_wallet_transfers
        WHERE id = $1
          AND group_id = $2
        LIMIT 1
      `,
      [transferPk, groupId]
    );

    if (transferRes.rows.length === 0) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    const transfer = transferRes.rows[0] as { id: number; group_id: number; status: string; approvals_required: number };

    if (transfer.status === 'executed') {
      return NextResponse.json({ error: 'Transfer already executed' }, { status: 400 });
    }

    await client.query(
      `
        INSERT INTO group_wallet_transfer_approvals (transfer_id, approved_by_member_id, approved_by_role)
        VALUES ($1, $2, $3)
        ON CONFLICT (transfer_id, approved_by_role) DO NOTHING
      `,
      [transferPk, membership.member_id, membership.role]
    );

    const approvalsRes = await client.query(
      `
        SELECT COUNT(*)::int AS approval_count
        FROM group_wallet_transfer_approvals
        WHERE transfer_id = $1
      `,
      [transferPk]
    );

    const approvalCount = (approvalsRes.rows[0] as { approval_count: number }).approval_count;

    if (approvalCount >= transfer.approvals_required && transfer.status === 'proposed') {
      await client.query(
        `
          UPDATE group_wallet_transfers
          SET status = 'approved', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [transferPk]
      );
    }

    const updatedRes = await client.query(
      `
        SELECT id, status, approvals_required
        FROM group_wallet_transfers
        WHERE id = $1
        LIMIT 1
      `,
      [transferPk]
    );

    return NextResponse.json({
      success: true,
      membership,
      transfer: updatedRes.rows[0] || null,
      approvalCount
    });
  } catch (error) {
    console.error('Approve transfer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
