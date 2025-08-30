import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Get recent admin activities across the platform
    const result = await client.query(`
      WITH recent_activities AS (
        -- New member registrations
        SELECT 
          'member_joined' as activity_type,
          m.full_name as user_name,
          'Mwanachama mpya amejiunge' as action,
          m.created_at as activity_date
        FROM members m
        WHERE m.created_at >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        -- New groups created
        SELECT 
          'group_created' as activity_type,
          g.name as user_name,
          'Kundi jipya limeanzishwa' as action,
          g.created_at as activity_date
        FROM groups g
        WHERE g.created_at >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        -- New investments
        SELECT 
          'investment_made' as activity_type,
          g.name as user_name,
          'Uwekezaji umeidhinishwa' as action,
          i.created_at as activity_date
        FROM investments i
        JOIN groups g ON i.group_id = g.id
        WHERE i.created_at >= CURRENT_DATE - INTERVAL '7 days'
        
        UNION ALL
        
        -- Training completions
        SELECT 
          'training_completed' as activity_type,
          m.full_name as user_name,
          'Amekamilisha mafunzo ya ' || tm.title as action,
          mt.completed_at as activity_date
        FROM member_training mt
        JOIN members m ON mt.member_id = m.id
        JOIN training_modules tm ON mt.training_id = tm.id
        WHERE mt.completed_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      SELECT * FROM recent_activities
      ORDER BY activity_date DESC
      LIMIT 20
    `);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
