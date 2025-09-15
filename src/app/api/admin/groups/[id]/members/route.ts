import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  
  try {
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        m.id,
        m.full_name,
        m.email,
        m.phone,
        m.location,
        m.business_type,
        m.status as member_status,
        gm.role,
        gm.joined_date,
        gm.status,
        gm.created_at
      FROM group_members gm
      JOIN members m ON gm.member_id = m.id
      WHERE gm.group_id = $1
      ORDER BY gm.role DESC, gm.joined_date ASC
    `, [groupId]);
    
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
