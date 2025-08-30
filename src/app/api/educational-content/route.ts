import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    
    const client = await pool.connect();
    const result = await client.query(`
      SELECT ec.*, u.full_name as author_name
      FROM educational_content ec
      LEFT JOIN users u ON ec.author_id = u.id
      ${includeUnpublished ? '' : 'WHERE ec.is_published = true'}
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, content, category, duration, difficulty_level, image_url, is_published } = body;
    
    const client = await pool.connect();
    const result = await client.query(`
      UPDATE educational_content 
      SET title = $1, description = $2, content = $3, category = $4, duration = $5, 
          difficulty_level = $6, image_url = $7, is_published = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [title, description, content, category, duration, difficulty_level, image_url, is_published, id]);
    client.release();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
