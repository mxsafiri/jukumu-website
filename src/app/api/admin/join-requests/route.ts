import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all pending join requests for admin review
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          jr.*,
          g.name as group_name,
          g.monthly_contribution,
          g.leader_id,
          m.full_name as member_name,
          m.email as member_email,
          m.phone as member_phone,
          leader.full_name as leader_name
        FROM join_requests jr
        JOIN groups g ON jr.group_id = g.id
        JOIN members m ON jr.member_id = m.id
        LEFT JOIN members leader ON g.leader_id = leader.id
        WHERE jr.status = 'pending'
        ORDER BY jr.created_at DESC
      `);

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

// Approve or reject join request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action, reviewerId, notes } = body;
    
    if (!requestId || !action || !reviewerId) {
      return NextResponse.json({ 
        error: 'Request ID, action, na reviewer ID ni lazima.' 
      }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action lazima iwe approve au reject.' 
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get join request details
      const requestResult = await client.query(
        'SELECT * FROM join_requests WHERE id = $1 AND status = $2',
        [requestId, 'pending']
      );
      
      if (requestResult.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Ombi halipatikani au tayari limeshajibiwa.' 
        }, { status: 404 });
      }

      const joinRequest = requestResult.rows[0];

      if (action === 'approve') {
        // Check if member is already in the group
        const existingMembership = await client.query(
          'SELECT id FROM group_members WHERE group_id = $1 AND member_id = $2',
          [joinRequest.group_id, joinRequest.member_id]
        );
        
        if (existingMembership.rows.length > 0) {
          client.release();
          return NextResponse.json({ 
            error: 'Mwanachama tayari yupo kwenye kundi hili.' 
          }, { status: 400 });
        }

        // Add member to group
        await client.query(`
          INSERT INTO group_members (group_id, member_id, joined_date, role, status)
          VALUES ($1, $2, CURRENT_DATE, 'member', 'active')
        `, [joinRequest.group_id, joinRequest.member_id]);

        // Update join request status
        await client.query(`
          UPDATE join_requests 
          SET status = 'approved', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, review_notes = $2
          WHERE id = $3
        `, [reviewerId, notes, requestId]);

        // Get group and member details for notification
        const groupResult = await client.query('SELECT name FROM groups WHERE id = $1', [joinRequest.group_id]);
        const memberResult = await client.query('SELECT full_name FROM members WHERE id = $1', [joinRequest.member_id]);
        
        if (groupResult.rows.length > 0 && memberResult.rows.length > 0) {
          // Try to create notification for the member (optional)
          try {
            await client.query(`
              SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              joinRequest.member_id, // user_id
              'Ombi Lako Limekubaliwa!', // title
              `Hongera! Ombi lako la kujiunga na kundi la "${groupResult.rows[0].name}" limekubaliwa. Sasa unaweza kushiriki kikamilifu na wanachama wengine.`, // message
              'success', // type
              'group', // category
              '/member-dashboard', // action_url
              'Angalia Kundi Langu', // action_text
              JSON.stringify({ group_id: joinRequest.group_id, action: 'view_group' }), // metadata
              null // expires_at
            ]);
          } catch (notificationError) {
            console.warn('Failed to create notification:', notificationError);
          }
        }

        client.release();
        
        return NextResponse.json({
          success: true,
          message: 'Ombi limekubaliwa na mwanachama ameongezwa kwenye kundi kwa mafanikio!'
        });

      } else { // reject
        // Update join request status to rejected
        await client.query(`
          UPDATE join_requests 
          SET status = 'rejected', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, review_notes = $2
          WHERE id = $3
        `, [reviewerId, notes, requestId]);

        // Get group details for notification
        const groupResult = await client.query('SELECT name FROM groups WHERE id = $1', [joinRequest.group_id]);
        
        if (groupResult.rows.length > 0) {
          // Try to create notification for the member (optional)
          try {
            await client.query(`
              SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              joinRequest.member_id, // user_id
              'Ombi Lako Limekataliwa', // title
              `Samahani, ombi lako la kujiunga na kundi la "${groupResult.rows[0].name}" limekataliwa. ${notes ? 'Sababu: ' + notes : 'Unaweza kujaribu kundi lingine.'}`, // message
              'warning', // type
              'group', // category
              '/member-dashboard', // action_url
              'Angalia Vikundi Vingine', // action_text
              JSON.stringify({ action: 'browse_groups' }), // metadata
              null // expires_at
            ]);
          } catch (notificationError) {
            console.warn('Failed to create notification:', notificationError);
          }
        }

        client.release();
        
        return NextResponse.json({
          success: true,
          message: 'Ombi limekataliwa kwa mafanikio!'
        });
      }
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kujibu ombi. Jaribu tena.' 
    }, { status: 500 });
  }
}
