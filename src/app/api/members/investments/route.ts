import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Get member's investments through their group memberships
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
        g.total_investment as group_total_investment
      FROM investments i
      JOIN groups g ON i.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id
      JOIN members m ON gm.member_id = m.id
      WHERE m.user_id = $1
      ORDER BY i.investment_date DESC
    `, [userId]);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
