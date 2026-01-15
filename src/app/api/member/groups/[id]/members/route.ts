import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthTokenPayload } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const membershipRes = await client.query(
      `
      SELECT 1
      FROM group_members gm
      JOIN members m ON m.id = gm.member_id
      WHERE m.user_id = $1
        AND gm.group_id = $2
      LIMIT 1
      `,
      [auth.userId, groupId]
    );

    if (membershipRes.rows.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await client.query(
      `
      SELECT
        m.id,
        m.full_name,
        m.email,
        m.phone,
        m.location,
        m.business_type,
        m.status AS member_status,
        gm.role,
        gm.joined_date,
        gm.status,
        gm.created_at
      FROM group_members gm
      JOIN members m ON gm.member_id = m.id
      WHERE gm.group_id = $1
      ORDER BY gm.role DESC, gm.joined_date ASC
      `,
      [groupId]
    );

    return NextResponse.json({ success: true, members: result.rows });
  } catch (error) {
    console.error('Member group members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
