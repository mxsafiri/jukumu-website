import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const client = await pool.connect();
    
    let query = `
      SELECT 
        m.id,
        m.full_name,
        m.email,
        m.phone,
        m.location,
        m.business_type,
        m.business_name,
        m.gender,
        m.age,
        m.monthly_revenue,
        m.employee_count,
        m.status,
        m.created_at,
        COALESCE(
          STRING_AGG(g.name, ', ' ORDER BY g.name), 
          'Hakuna kundi'
        ) as group_names,
        COALESCE(
          STRING_AGG(gm.role, ', ' ORDER BY g.name), 
          'Hakuna nafasi'
        ) as group_roles,
        COUNT(gm.id) as group_count
      FROM members m
      LEFT JOIN group_members gm ON m.id = gm.member_id AND gm.status = 'active'
      LEFT JOIN groups g ON gm.group_id = g.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (m.full_name ILIKE $${paramCount} OR m.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (status) {
      paramCount++;
      query += ` AND m.status = $${paramCount}`;
      params.push(status);
    }
    
    query += ` 
      GROUP BY m.id, m.full_name, m.email, m.phone, m.location, m.business_type, 
               m.business_name, m.gender, m.age, m.monthly_revenue, m.employee_count, 
               m.status, m.created_at
      ORDER BY m.created_at DESC
    `;
    
    const result = await client.query(query, params);
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, groupId } = body;
    
    console.log('PUT request received:', { id, status, groupId });
    
    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Update member status
      if (status) {
        console.log('Updating member status:', { id, status });
        await client.query(
          'UPDATE members SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [status, id]
        );
      }
      
      // Add member to group
      if (groupId) {
        console.log('Adding member to group:', { memberId: id, groupId });
        
        // Verify the group exists
        const groupCheck = await client.query('SELECT id FROM groups WHERE id = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
          client.release();
          return NextResponse.json({ error: 'Kundi halipo. Chagua kundi sahihi.' }, { status: 400 });
        }
        
        // Verify the member exists
        const memberCheck = await client.query('SELECT id FROM members WHERE id = $1', [id]);
        if (memberCheck.rows.length === 0) {
          client.release();
          return NextResponse.json({ error: 'Mwanachama hapatikani.' }, { status: 400 });
        }
        
        // Check if member is already in this group
        const existingMembership = await client.query(
          'SELECT id FROM group_members WHERE group_id = $1 AND member_id = $2',
          [groupId, id]
        );
        
        if (existingMembership.rows.length > 0) {
          client.release();
          return NextResponse.json({ error: 'Mwanachama tayari yupo kwenye kundi hili.' }, { status: 400 });
        }
        
        // Insert the member into the group
        const insertResult = await client.query(`
          INSERT INTO group_members (group_id, member_id, joined_date, role, status)
          VALUES ($1, $2, CURRENT_DATE, 'member', 'active')
          RETURNING *
        `, [groupId, id]);
        
        console.log('Member added to group successfully:', insertResult.rows[0]);
        
        // Get group and member details for notification
        const groupDetails = await client.query('SELECT name FROM groups WHERE id = $1', [groupId]);
        const memberDetails = await client.query('SELECT full_name FROM members WHERE id = $1', [id]);
        
        if (groupDetails.rows.length > 0 && memberDetails.rows.length > 0) {
          // Try to create notification for the member (optional - don't fail if notifications table doesn't exist)
          try {
            await client.query(`
              SELECT create_notification($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              id, // user_id
              'Umeongezwa kwenye Kundi!', // title
              `Hongera! Umeongezwa kwenye kundi la "${groupDetails.rows[0].name}". Anza kushiriki na wanachama wengine na uongeze mchango wako.`, // message
              'success', // type
              'group', // category
              '/member-dashboard', // action_url
              'Angalia Kundi', // action_text
              JSON.stringify({ group_id: groupId, action: 'view_group' }), // metadata
              null // expires_at
            ]);
            console.log('Notification created successfully');
          } catch (notificationError) {
            console.log('Notification creation failed (optional):', notificationError);
            // Continue without failing - notifications are optional
          }
        }
      }
      
      client.release();
      
      const successMessage = groupId ? 'Mwanachama ameongezwa kwenye kundi kwa mafanikio!' : 'Mabadiliko yamehifadhiwa kwa mafanikio!';
      return NextResponse.json({ 
        success: true, 
        message: successMessage,
        data: { memberId: id, groupId, status }
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kubadilisha taarifa za mwanachama. Jaribu tena.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ 
        error: 'ID ya mwanachama ni lazima kwa kufuta mwanachama.' 
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if member exists and get details
      const memberCheck = await client.query(
        'SELECT full_name, status FROM members WHERE id = $1',
        [id]
      );
      
      if (memberCheck.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Mwanachama hakupatikana.' 
        }, { status: 404 });
      }
      
      const member = memberCheck.rows[0];
      
      // Only allow deletion of inactive members for safety
      if (member.status === 'active') {
        client.release();
        return NextResponse.json({ 
          error: `Mwanachama "${member.full_name}" bado ni hai. Badilisha hali kuwa "Haifanyi kazi" kwanza kabla ya kufuta.` 
        }, { status: 400 });
      }
      
      // Check if member is a group leader
      const leaderCheck = await client.query(
        'SELECT g.name FROM groups g WHERE g.leader_id = (SELECT user_id FROM members WHERE id = $1)',
        [id]
      );
      
      if (leaderCheck.rows.length > 0) {
        client.release();
        return NextResponse.json({ 
          error: `Mwanachama "${member.full_name}" ni kiongozi wa kundi "${leaderCheck.rows[0].name}". Badilisha kiongozi kwanza kabla ya kufuta.` 
        }, { status: 400 });
      }
      
      // Delete related records first (cascade delete)
      await client.query('DELETE FROM group_members WHERE member_id = $1', [id]);
      await client.query('DELETE FROM member_training WHERE member_id = $1', [id]);
      await client.query('DELETE FROM monthly_contributions WHERE member_id = $1', [id]);
      await client.query('DELETE FROM business_reports WHERE member_id = $1', [id]);
      await client.query('DELETE FROM join_requests WHERE member_id = $1', [id]);
      await client.query('DELETE FROM content_progress WHERE user_id = (SELECT user_id FROM members WHERE id = $1)', [id]);
      
      // Delete the member
      const result = await client.query('DELETE FROM members WHERE id = $1 RETURNING full_name', [id]);
      
      client.release();
      
      return NextResponse.json({ 
        success: true,
        message: `Mwanachama "${result.rows[0].full_name}" amefutwa kwa mafanikio!`
      });
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kufuta mwanachama. Jaribu tena.' 
    }, { status: 500 });
  }
}
