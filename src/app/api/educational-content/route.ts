import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT ec.*, u.full_name as author_name,
             COUNT(cp.id) as enrolled_count
      FROM educational_content ec
      LEFT JOIN users u ON ec.author_id = u.id
      LEFT JOIN content_progress cp ON ec.id = cp.content_id
      WHERE ec.is_published = true
      GROUP BY ec.id, u.full_name
      ORDER BY ec.created_at DESC
    `);
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content, category, duration, difficulty_level, image_url, author_id, is_published } = body;
    
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO educational_content (title, description, content, category, duration, difficulty_level, image_url, author_id, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, description, content, category, duration, difficulty_level, image_url, author_id, is_published]);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
