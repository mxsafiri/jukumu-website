import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, groupId, message } = body;
    
    if (!memberId || !groupId) {
      return NextResponse.json({ 
        error: 'Member ID na Group ID ni lazima.' 
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Check if member exists
      const memberCheck = await client.query(
        'SELECT id, full_name FROM members WHERE id = $1',
        [memberId]
      );
      
      if (memberCheck.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Mwanachama hapatikani.' 
        }, { status: 404 });
      }

      // Check if group exists and is active
      const groupCheck = await client.query(
        'SELECT id, name, leader_id FROM groups WHERE id = $1 AND status = $2',
        [groupId, 'active']
      );
      
      if (groupCheck.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Kundi halipatikani au halipo hai.' 
        }, { status: 404 });
      }

      // Check if member is already in this group
      const existingMembership = await client.query(
        'SELECT id FROM group_members WHERE member_id = $1 AND group_id = $2',
        [memberId, groupId]
      );
      
      if (existingMembership.rows.length > 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Tayari upo kwenye kundi hili.' 
        }, { status: 400 });
      }

      // Check if there's already a pending join request
      const existingRequest = await client.query(
        'SELECT id FROM join_requests WHERE member_id = $1 AND group_id = $2 AND status = $3',
        [memberId, groupId, 'pending']
      );
      
      if (existingRequest.rows.length > 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Tayari umetuma ombi la kujiunga na kundi hili.' 
        }, { status: 400 });
      }

      // Create join request
      const result = await client.query(`
        INSERT INTO join_requests (member_id, group_id, message, status, created_at)
        VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
        RETURNING *
      `, [memberId, groupId, message || '']);

      // Try to create notification for group leader if exists (optional)
      const groupLeaderId = groupCheck.rows[0].leader_id;
      const memberName = memberCheck.rows[0].full_name;
      const groupName = groupCheck.rows[0].name;
      
      if (groupLeaderId) {
        try {
          await client.query(`
            SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            groupLeaderId, // user_id
            'Ombi la Kujiunga na Kundi', // title
            `${memberName} ametuma ombi la kujiunga na kundi lako "${groupName}". Angalia na ukubali au ukatae ombi hili.`, // message
            'info', // type
            'group', // category
            '/dashboard', // action_url
            'Angalia Ombi', // action_text
            JSON.stringify({ 
              group_id: groupId, 
              member_id: memberId, 
              request_id: result.rows[0].id,
              action: 'review_join_request' 
            }), // metadata
            null // expires_at
          ]);
        } catch (notificationError) {
          // Log notification error but don't fail the join request
          console.warn('Failed to create notification:', notificationError);
        }
      }

      client.release();
      
      return NextResponse.json({
        success: true,
        message: 'Ombi lako la kujiunga limetumwa kwa mafanikio! Utapokea jibu hivi karibuni.',
        request: result.rows[0]
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kutuma ombi. Jaribu tena.' 
    }, { status: 500 });
  }
}

// Get join requests for a member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          jr.*,
          g.name as group_name,
          g.monthly_contribution,
          m.full_name as leader_name
        FROM join_requests jr
        JOIN groups g ON jr.group_id = g.id
        LEFT JOIN members m ON g.leader_id = m.id
        WHERE jr.member_id = $1
        ORDER BY jr.created_at DESC
      `, [memberId]);

      client.release();
      
      return NextResponse.json({
        success: true,
        requests: result.rows
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kupata maombi. Jaribu tena.' 
    }, { status: 500 });
  }
}
