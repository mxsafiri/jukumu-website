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
    
    // Get member's training progress
    const result = await client.query(`
      SELECT 
        tm.id,
        tm.title,
        tm.description,
        tm.duration_hours,
        tm.category,
        tm.level,
        mt.status as progress_status,
        mt.progress_percentage,
        mt.started_at,
        mt.completed_at
      FROM training_modules tm
      LEFT JOIN member_training mt ON tm.id = mt.training_id 
        AND mt.member_id = (SELECT id FROM members WHERE user_id = $1)
      WHERE tm.status = 'active'
      ORDER BY tm.created_at DESC
    `, [userId]);
    
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
    const { userId, trainingId, action } = body;
    
    if (!userId || !trainingId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    
    // Get member ID from user ID
    const memberResult = await client.query('SELECT id FROM members WHERE user_id = $1', [userId]);
    if (memberResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    const memberId = memberResult.rows[0].id;
    
    if (action === 'start') {
      // Start training
      await client.query(`
        INSERT INTO member_training (member_id, training_id, status, started_at)
        VALUES ($1, $2, 'in_progress', CURRENT_TIMESTAMP)
        ON CONFLICT (member_id, training_id) 
        DO UPDATE SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
      `, [memberId, trainingId]);
    } else if (action === 'complete') {
      // Complete training
      await client.query(`
        UPDATE member_training 
        SET status = 'completed', progress_percentage = 100, completed_at = CURRENT_TIMESTAMP
        WHERE member_id = $1 AND training_id = $2
      `, [memberId, trainingId]);
    }
    
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
