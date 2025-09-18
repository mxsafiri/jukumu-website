import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get all training modules for admin management
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
        tm.status,
        tm.created_at,
        COUNT(tl.id) as lesson_count
      FROM training_modules tm
      LEFT JOIN training_lessons tl ON tm.id = tl.training_module_id
      GROUP BY tm.id, tm.title, tm.description, tm.duration_hours, tm.category, tm.level, tm.status, tm.created_at
      ORDER BY tm.created_at DESC
    `);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new training module
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, duration_hours, category, level } = body;
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO training_modules (title, description, duration_hours, category, level, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `, [title, description, duration_hours || 1, category || 'General', level || 'beginner']);
    
    client.release();
    
    return NextResponse.json({
      success: true,
      module: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
