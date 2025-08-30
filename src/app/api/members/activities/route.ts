import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Get member's recent activities from various sources
    const result = await client.query(`
      WITH member_activities AS (
        -- Training completions
        SELECT 
          'training_completed' as activity_type,
          tm.title as description,
          mt.completed_at as activity_date,
          'Umekamilisha mafunzo ya ' || tm.title as action_text
        FROM member_training mt
        JOIN training_modules tm ON mt.training_id = tm.id
        JOIN members m ON mt.member_id = m.id
        WHERE m.user_id = $1 AND mt.status = 'completed'
        
        UNION ALL
        
        -- Group joins
        SELECT 
          'group_joined' as activity_type,
          g.name as description,
          gm.joined_date as activity_date,
          'Umejiunge na kundi la ' || g.name as action_text
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        JOIN members m ON gm.member_id = m.id
        WHERE m.user_id = $1
        
        UNION ALL
        
        -- Member registration
        SELECT 
          'member_registered' as activity_type,
          'JUKUMU' as description,
          m.created_at as activity_date,
          'Umejiunge na JUKUMU' as action_text
        FROM members m
        WHERE m.user_id = $1
      )
      SELECT * FROM member_activities
      ORDER BY activity_date DESC
      LIMIT 10
    `, [userId]);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
