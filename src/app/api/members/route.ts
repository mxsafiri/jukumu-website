import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, full_name, email, phone, location, business_type, group_name, 
             gender, age, created_at, status 
      FROM members 
      ORDER BY created_at DESC
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
    const { fullName, email, phone, location, businessType, idType, idNumber, gender, age, status = 'pending' } = body;
    
    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO members (full_name, email, phone, location, business_type, id_type, id_number, gender, age, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [fullName, email, phone, location, businessType, idType, idNumber, gender, parseInt(age), status]);
    client.release();
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
