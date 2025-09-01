import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT ec.*, u.full_name as author_name
      FROM educational_content ec
      LEFT JOIN users u ON ec.author_id = u.id
      WHERE ec.id = $1
    `, [params.id]);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, description, content, category, duration, difficulty_level, image_url, is_published } = body;
    
    const client = await pool.connect();
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (content !== undefined) {
      updateFields.push(`content = $${paramCount}`);
      values.push(content);
      paramCount++;
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    if (duration !== undefined) {
      updateFields.push(`duration = $${paramCount}`);
      values.push(duration);
      paramCount++;
    }
    if (difficulty_level !== undefined) {
      updateFields.push(`difficulty_level = $${paramCount}`);
      values.push(difficulty_level);
      paramCount++;
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount}`);
      values.push(image_url);
      paramCount++;
    }
    if (is_published !== undefined) {
      updateFields.push(`is_published = $${paramCount}`);
      values.push(is_published);
      paramCount++;
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the ID parameter at the end
    values.push(params.id);
    
    const query = `
      UPDATE educational_content 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await client.query(query, values);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      DELETE FROM educational_content 
      WHERE id = $1
      RETURNING *
    `, [params.id]);
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
