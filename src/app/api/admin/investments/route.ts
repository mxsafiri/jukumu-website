import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        i.id,
        i.amount,
        i.equity_percentage,
        i.investment_date,
        i.status,
        i.expected_return,
        i.actual_return,
        i.notes,
        g.name as group_name,
        g.id as group_id
      FROM investments i
      JOIN groups g ON i.group_id = g.id
      ORDER BY i.investment_date DESC
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
    const { groupId, amount, equityPercentage, expectedReturn, notes } = body;
    
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO investments (group_id, amount, equity_percentage, expected_return, notes, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `, [groupId, amount, equityPercentage, expectedReturn, notes]);
    
    // Update group total investment
    await client.query(`
      UPDATE groups 
      SET total_investment = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM investments 
        WHERE group_id = $1 AND status IN ('active', 'pending')
      )
      WHERE id = $1
    `, [groupId]);
    
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
    const { id, status, actualReturn, notes } = body;
    
    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE investments 
      SET status = $1, actual_return = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, actualReturn, notes, id]);
    
    client.release();
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
