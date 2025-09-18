import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get public training modules (no authentication required)
export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        tm.id,
        tm.title,
        tm.description,
        tm.duration_hours,
        tm.category,
        tm.level,
        tm.created_at,
        COUNT(tl.id) as lesson_count
      FROM training_modules tm
      LEFT JOIN training_lessons tl ON tm.id = tl.training_module_id
      WHERE tm.status = 'active'
      GROUP BY tm.id, tm.title, tm.description, tm.duration_hours, tm.category, tm.level, tm.created_at
      ORDER BY tm.created_at DESC
      LIMIT 6
    `);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
