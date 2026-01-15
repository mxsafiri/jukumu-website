import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthTokenPayload } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = getAuthTokenPayload(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const memberRes = await client.query(
      `
      SELECT id
      FROM members
      WHERE user_id = $1
      LIMIT 1
      `,
      [auth.userId]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 });
    }

    const memberId = memberRes.rows[0].id as number;

    const result = await client.query(
      `
      SELECT 
        g.id,
        g.name,
        g.founded_date,
        g.monthly_contribution,
        g.status,
        u.full_name as leader_name,
        COUNT(gm.member_id) as member_count,
        g.created_at
      FROM groups g
      LEFT JOIN users u ON g.leader_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'active'
      WHERE g.status = 'active'
        AND g.id NOT IN (
          SELECT group_id
          FROM group_members
          WHERE member_id = $1 AND status = 'active'
        )
      GROUP BY g.id, g.name, g.founded_date, g.monthly_contribution, g.status, u.full_name, g.created_at
      ORDER BY g.created_at DESC
      `,
      [memberId]
    );

    return NextResponse.json({ success: true, groups: result.rows });
  } catch (error) {
    console.error('Member available groups error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
