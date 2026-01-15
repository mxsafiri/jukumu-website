import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthTokenPayload } from '@/lib/auth';

async function ensureProposalSchema(client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS group_proposals (
      id SERIAL PRIMARY KEY,
      group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      created_by_member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_group_proposals_group_id ON group_proposals(group_id);
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_group_proposals_created_at ON group_proposals(created_at DESC);
  `);
}

async function isMemberOfGroup(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  userId: number,
  groupId: number
) {
  const membershipRes = await client.query(
    `
      SELECT 1
      FROM group_members gm
      JOIN members m ON m.id = gm.member_id
      WHERE m.user_id = $1
        AND gm.group_id = $2
      LIMIT 1
    `,
    [userId, groupId]
  );

  return membershipRes.rows.length > 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  const auth = getAuthTokenPayload(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, proposalId } = await params;
  const groupId = Number.parseInt(id, 10);
  const pid = Number.parseInt(proposalId, 10);

  if (!Number.isFinite(groupId)) {
    return NextResponse.json({ error: 'Invalid group id' }, { status: 400 });
  }

  if (!Number.isFinite(pid)) {
    return NextResponse.json({ error: 'Invalid proposal id' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await ensureProposalSchema(client);

    const allowed = await isMemberOfGroup(client, auth.userId, groupId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const res = await client.query(
      `
        SELECT
          p.id,
          p.group_id,
          p.title,
          p.description,
          p.status,
          p.created_at,
          p.updated_at,
          m.full_name AS created_by_name,
          m.id AS created_by_member_id
        FROM group_proposals p
        JOIN members m ON m.id = p.created_by_member_id
        WHERE p.group_id = $1
          AND p.id = $2
        LIMIT 1
      `,
      [groupId, pid]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, proposal: res.rows[0] });
  } catch (error) {
    console.error('Member proposal details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
