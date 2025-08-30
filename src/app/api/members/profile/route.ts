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
    
    // Get member profile with group information
    const result = await client.query(`
      SELECT 
        m.id,
        m.full_name,
        m.email,
        m.phone,
        m.location,
        m.business_type,
        m.business_name,
        m.business_description,
        m.gender,
        m.age,
        m.monthly_revenue,
        m.employee_count,
        m.status,
        m.created_at,
        g.name as group_name,
        g.id as group_id,
        gm.role as group_role
      FROM members m
      LEFT JOIN group_members gm ON m.id = gm.member_id
      LEFT JOIN groups g ON gm.group_id = g.id
      WHERE m.user_id = $1
    `, [userId]);
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const body = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { 
      fullName, 
      phone, 
      location, 
      businessType, 
      businessName, 
      businessDescription, 
      monthlyRevenue, 
      employeeCount 
    } = body;

    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE members 
      SET 
        full_name = $1,
        phone = $2,
        location = $3,
        business_type = $4,
        business_name = $5,
        business_description = $6,
        monthly_revenue = $7,
        employee_count = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $9
      RETURNING *
    `, [fullName, phone, location, businessType, businessName, businessDescription, monthlyRevenue, employeeCount, userId]);
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
