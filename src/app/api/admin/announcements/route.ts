import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.priority,
        a.target_audience,
        a.status,
        a.created_at,
        a.expires_at,
        u.full_name as created_by_name,
        g.name as target_group_name
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      LEFT JOIN groups g ON a.target_group_id = g.id
      ORDER BY a.created_at DESC
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
    const { title, content, priority, targetAudience, targetGroupId, createdBy, expiresAt } = body;
    
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO announcements (title, content, priority, target_audience, target_group_id, created_by, expires_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING *
    `, [title, content, priority, targetAudience, targetGroupId, createdBy, expiresAt]);
    
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
