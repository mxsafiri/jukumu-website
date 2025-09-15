import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get all active groups that the member is not already part of
      const result = await client.query(`
        SELECT 
          g.id,
          g.name,
          g.founded_date,
          g.monthly_contribution,
          g.status,
          m.full_name as leader_name,
          COUNT(gm.member_id) as member_count,
          g.created_at
        FROM groups g
        LEFT JOIN members m ON g.leader_id = m.id
        LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'active'
        WHERE g.status = 'active'
        AND g.id NOT IN (
          SELECT group_id 
          FROM group_members 
          WHERE member_id = $1 AND status = 'active'
        )
        GROUP BY g.id, g.name, g.founded_date, g.monthly_contribution, g.status, m.full_name, g.created_at
        ORDER BY g.created_at DESC
      `, [memberId]);

      client.release();
      
      return NextResponse.json({
        success: true,
        groups: result.rows
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kupata vikundi. Jaribu tena.' 
    }, { status: 500 });
  }
}
