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
        jr.*,
        g.name as group_name,
        g.monthly_contribution,
        u.full_name as leader_name
      FROM join_requests jr
      JOIN groups g ON jr.group_id = g.id
      LEFT JOIN users u ON g.leader_id = u.id
      WHERE jr.member_id = $1
      ORDER BY jr.created_at DESC
      `,
      [memberId]
    );

    return NextResponse.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('Member join requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuthTokenPayload(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const groupId = body?.groupId;
  const message = typeof body?.message === 'string' ? body.message : '';

  if (!groupId || (typeof groupId !== 'number' && typeof groupId !== 'string')) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  const numericGroupId = typeof groupId === 'number' ? groupId : Number.parseInt(groupId, 10);
  if (!Number.isFinite(numericGroupId)) {
    return NextResponse.json({ error: 'Invalid group id' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const memberRes = await client.query(
      `
      SELECT id, full_name
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

    const groupCheck = await client.query(
      'SELECT id, name, leader_id, status FROM groups WHERE id = $1',
      [numericGroupId]
    );

    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Kundi halipatikani.' }, { status: 404 });
    }

    if (groupCheck.rows[0].status !== 'active') {
      return NextResponse.json({ error: 'Kundi halipo hai.' }, { status: 400 });
    }

    const existingMembership = await client.query(
      'SELECT id FROM group_members WHERE member_id = $1 AND group_id = $2',
      [memberId, numericGroupId]
    );

    if (existingMembership.rows.length > 0) {
      return NextResponse.json({ error: 'Tayari upo kwenye kundi hili.' }, { status: 400 });
    }

    const existingRequest = await client.query(
      'SELECT id FROM join_requests WHERE member_id = $1 AND group_id = $2 AND status = $3',
      [memberId, numericGroupId, 'pending']
    );

    if (existingRequest.rows.length > 0) {
      return NextResponse.json({ error: 'Tayari umetuma ombi la kujiunga na kundi hili.' }, { status: 400 });
    }

    const result = await client.query(
      `
      INSERT INTO join_requests (member_id, group_id, message, status, created_at)
      VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [memberId, numericGroupId, message]
    );

    const leaderId = groupCheck.rows[0].leader_id as number | null;
    const memberName = memberRes.rows[0].full_name as string;
    const groupName = groupCheck.rows[0].name as string;

    if (leaderId) {
      try {
        await client.query(
          `
          SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `,
          [
            leaderId,
            'Ombi la Kujiunga na Kundi',
            `${memberName} ametuma ombi la kujiunga na kundi lako "${groupName}".`,
            'info',
            'group',
            '/dashboard',
            'Angalia Ombi',
            JSON.stringify({ group_id: numericGroupId, member_id: memberId, request_id: result.rows[0].id }),
            null
          ]
        );
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ombi lako la kujiunga limetumwa kwa mafanikio! Utapokea jibu hivi karibuni.',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Member join request create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
