import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const body = await request.json();
    const { memberId } = body;
    
    if (!memberId) {
      return NextResponse.json({ 
        error: 'ID ya mwanachama ni lazima kwa kuondoa mwanachama kwenye kundi.' 
      }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if group exists
      const groupCheck = await client.query('SELECT name FROM groups WHERE id = $1', [groupId]);
      if (groupCheck.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Kundi halikupatikana.' 
        }, { status: 404 });
      }
      
      // Check if member exists in this group
      const membershipCheck = await client.query(`
        SELECT gm.id, m.full_name, gm.role 
        FROM group_members gm
        JOIN members m ON gm.member_id = m.id
        WHERE gm.group_id = $1 AND gm.member_id = $2
      `, [groupId, memberId]);
      
      if (membershipCheck.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Mwanachama hayupo kwenye kundi hili.' 
        }, { status: 404 });
      }
      
      const membership = membershipCheck.rows[0];
      
      // Check if this member is the group leader (prevent removal of leader)
      const leaderCheck = await client.query(
        'SELECT id FROM groups WHERE id = $1 AND leader_id = (SELECT user_id FROM members WHERE id = $2)',
        [groupId, memberId]
      );
      
      if (leaderCheck.rows.length > 0) {
        client.release();
        return NextResponse.json({ 
          error: `Mwanachama "${membership.full_name}" ni kiongozi wa kundi. Badilisha kiongozi kwanza kabla ya kuondoa.` 
        }, { status: 400 });
      }
      
      // Remove the member from the group
      await client.query(
        'DELETE FROM group_members WHERE group_id = $1 AND member_id = $2',
        [groupId, memberId]
      );
      
      client.release();
      
      return NextResponse.json({ 
        success: true,
        message: `Mwanachama "${membership.full_name}" ameondolewa kwenye kundi "${groupCheck.rows[0].name}" kwa mafanikio!`
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kuondoa mwanachama kwenye kundi. Jaribu tena.' 
    }, { status: 500 });
  }
}
