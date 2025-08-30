import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const client = await pool.connect();
    
    let query = `
      SELECT 
        m.id,
        m.full_name,
        m.email,
        m.phone,
        m.location,
        m.business_type,
        m.business_name,
        m.gender,
        m.age,
        m.monthly_revenue,
        m.employee_count,
        m.status,
        m.created_at,
        g.name as group_name,
        gm.role as group_role
      FROM members m
      LEFT JOIN group_members gm ON m.id = gm.member_id
      LEFT JOIN groups g ON gm.group_id = g.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (m.full_name ILIKE $${paramCount} OR m.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (status) {
      paramCount++;
      query += ` AND m.status = $${paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY m.created_at DESC`;
    
    const result = await client.query(query, params);
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, groupId } = body;
    
    const client = await pool.connect();
    
    // Update member status
    if (status) {
      await client.query(
        'UPDATE members SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, id]
      );
    }
    
    // Add member to group
    if (groupId) {
      await client.query(`
        INSERT INTO group_members (group_id, member_id, joined_date, role, status)
        VALUES ($1, $2, CURRENT_DATE, 'member', 'active')
        ON CONFLICT (group_id, member_id) DO NOTHING
      `, [groupId, id]);
    }
    
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    // Remove from groups first
    await client.query('DELETE FROM group_members WHERE member_id = $1', [id]);
    
    // Remove training progress
    await client.query('DELETE FROM member_training WHERE member_id = $1', [id]);
    
    // Remove member
    await client.query('DELETE FROM members WHERE id = $1', [id]);
    
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
