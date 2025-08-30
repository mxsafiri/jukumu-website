import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT g.id, g.name, g.leader_id, g.founded_date, g.total_investment, 
             g.monthly_contribution, g.status, g.created_at,
             u.full_name as leader_name,
             COUNT(gm.member_id) as member_count
      FROM groups g
      LEFT JOIN users u ON g.leader_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id, u.full_name
      ORDER BY g.created_at DESC
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
    const { name, leaderId, monthlyContribution } = body;
    
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO groups (name, leader_id, monthly_contribution, status, founded_date)
      VALUES ($1, $2, $3, 'active', CURRENT_DATE)
      RETURNING *
    `, [name, leaderId, monthlyContribution]);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
