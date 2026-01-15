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
        gm.id,
        gm.role,
        m.full_name,
        m.email,
        gm.joined_date,
        gm.status
      FROM group_members gm
      JOIN members m ON gm.member_id = m.id
      WHERE gm.group_id = $1
        AND gm.role IN ('mwenyekiti', 'katibu', 'mwekahazina', 'leader')
      ORDER BY
        CASE gm.role
          WHEN 'leader' THEN 1
          WHEN 'mwenyekiti' THEN 2
          WHEN 'katibu' THEN 3
          WHEN 'mwekahazina' THEN 4
        END
      `,
      [groupId]
    );

    return NextResponse.json({ success: true, leadership: result.rows });
  } catch (error) {
    console.error('Member group leadership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
