import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthTokenPayload } from '@/lib/auth';
import { CdpClient } from '@coinbase/cdp-sdk';
import { encodeFunctionData } from 'viem';

const NETWORK = 'base';
const USDC_BASE_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const APPROVER_ROLES = new Set(['mwenyekiti', 'katibu', 'mwekahazina']);

const USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: 'success', type: 'bool' }]
  }
] as const;

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

function asEvmAddress(value: string): `0x${string}` | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(v)) return null;
  return v as `0x${string}`;
}

function getEnvConfigError(): string | null {
  if (!process.env.CDP_API_KEY_ID) return 'CDP_API_KEY_ID is not set';
  if (!process.env.CDP_API_KEY_SECRET) return 'CDP_API_KEY_SECRET is not set';
  if (!process.env.CDP_WALLET_SECRET) return 'CDP_WALLET_SECRET is not set';
  return null;
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

  const envError = getEnvConfigError();
  if (envError) {
    return NextResponse.json(
      { error: 'Server wallet configuration error', details: envError },
      { status: 500 }
    );
  }

  const client = await pool.connect();
  try {
    await ensureWalletSchema(client);

    const membership = await getMembership(client, auth.userId, groupId);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!APPROVER_ROLES.has(membership.role)) {
      return NextResponse.json({ error: 'You do not have permission to execute transfers' }, { status: 403 });
    }

    const transferRes = await client.query(
      `
        SELECT
          t.id,
          t.group_id,
          t.status,
          t.approvals_required,
          t.to_address,
          t.amount_base_units,
          t.executed_tx_hash,
          w.cdp_account_name,
          w.network
        FROM group_wallet_transfers t
        JOIN group_wallets w ON w.id = t.wallet_id
        WHERE t.id = $1
          AND t.group_id = $2
        LIMIT 1
      `,
      [transferPk, groupId]
    );

    if (transferRes.rows.length === 0) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    const transfer = transferRes.rows[0] as {
      id: number;
      group_id: number;
      status: string;
      approvals_required: number;
      to_address: string;
      amount_base_units: string | number;
      executed_tx_hash: string | null;
      cdp_account_name: string;
      network: string;
    };

    if (transfer.network !== NETWORK) {
      return NextResponse.json({ error: 'Unsupported wallet network' }, { status: 400 });
    }

    if (transfer.status === 'executed') {
      return NextResponse.json({ success: true, txHash: transfer.executed_tx_hash, transfer });
    }

    const approvalsRes = await client.query(
      `
        SELECT COUNT(*)::int AS approval_count
        FROM group_wallet_transfer_approvals
        WHERE transfer_id = $1
      `,
      [transferPk]
    );

    const approvalCount = (approvalsRes.rows[0] as { approval_count: number }).approval_count;
    if (approvalCount < transfer.approvals_required) {
      return NextResponse.json({ error: 'Not enough approvals to execute transfer' }, { status: 400 });
    }

    const usdcContract = asEvmAddress(USDC_BASE_CONTRACT);
    if (!usdcContract) {
      return NextResponse.json({ error: 'Invalid USDC contract address' }, { status: 500 });
    }

    const toAddress = asEvmAddress(transfer.to_address);
    if (!toAddress) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
    }

    const amountBaseUnits =
      typeof transfer.amount_base_units === 'number'
        ? BigInt(transfer.amount_base_units)
        : BigInt(transfer.amount_base_units);

    const data = encodeFunctionData({
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [toAddress, amountBaseUnits]
    });

    const cdp = new CdpClient();
    const account = await cdp.evm.getOrCreateAccount({ name: transfer.cdp_account_name });
    const baseAccount = await (account as unknown as { useNetwork: (n: string) => Promise<any> }).useNetwork(NETWORK);

    const tx = await (baseAccount as { sendTransaction: (args: unknown) => Promise<unknown> }).sendTransaction({
      transaction: {
        to: usdcContract,
        data,
        value: BigInt(0)
      }
    });

    const receipt = await (baseAccount as { waitForTransactionReceipt: (tx: unknown) => Promise<unknown> }).waitForTransactionReceipt(tx);
    const txHash =
      (receipt as { transactionHash?: string }).transactionHash ||
      (tx as { transactionHash?: string }).transactionHash ||
      (tx as { hash?: string }).hash ||
      null;

    await client.query(
      `
        UPDATE group_wallet_transfers
        SET status = 'executed', executed_tx_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [txHash, transferPk]
    );

    return NextResponse.json({ success: true, txHash, transfer: { ...transfer, status: 'executed', executed_tx_hash: txHash } });
  } catch (error) {
    console.error('Execute transfer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
