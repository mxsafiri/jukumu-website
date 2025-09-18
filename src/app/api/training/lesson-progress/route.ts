import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, lessonId, completed } = body;
    
    if (!userId || !lessonId || completed === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get member ID from user ID
      const memberResult = await client.query('SELECT id FROM members WHERE user_id = $1', [userId]);
      if (memberResult.rows.length === 0) {
        client.release();
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      
      const memberId = memberResult.rows[0].id;
      
      if (completed) {
        // Mark lesson as completed
        await client.query(`
          INSERT INTO lesson_progress (member_id, lesson_id, completed, completed_at)
          VALUES ($1, $2, true, CURRENT_TIMESTAMP)
          ON CONFLICT (member_id, lesson_id) 
          DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
        `, [memberId, lessonId]);
        
        // Check if all lessons in the module are completed
        const moduleResult = await client.query(`
          SELECT tm.id as module_id, COUNT(tl.id) as total_lessons
          FROM training_modules tm
          JOIN training_lessons tl ON tm.id = tl.training_module_id
          WHERE tl.id = $1
          GROUP BY tm.id
        `, [lessonId]);
        
        if (moduleResult.rows.length > 0) {
          const moduleId = moduleResult.rows[0].module_id;
          const totalLessons = moduleResult.rows[0].total_lessons;
          
          const completedResult = await client.query(`
            SELECT COUNT(*) as completed_count
            FROM lesson_progress lp
            JOIN training_lessons tl ON lp.lesson_id = tl.id
            WHERE lp.member_id = $1 AND tl.training_module_id = $2 AND lp.completed = true
          `, [memberId, moduleId]);
          
          const completedCount = parseInt(completedResult.rows[0].completed_count);
          const progressPercentage = Math.round((completedCount / totalLessons) * 100);
          
          // Update module progress
          if (completedCount === totalLessons) {
            // Module completed
            await client.query(`
              INSERT INTO member_training (member_id, training_id, status, progress_percentage, completed_at)
              VALUES ($1, $2, 'completed', 100, CURRENT_TIMESTAMP)
              ON CONFLICT (member_id, training_id) 
              DO UPDATE SET status = 'completed', progress_percentage = 100, completed_at = CURRENT_TIMESTAMP
            `, [memberId, moduleId]);
          } else {
            // Module in progress
            await client.query(`
              INSERT INTO member_training (member_id, training_id, status, progress_percentage, started_at)
              VALUES ($1, $2, 'in_progress', $3, CURRENT_TIMESTAMP)
              ON CONFLICT (member_id, training_id) 
              DO UPDATE SET status = 'in_progress', progress_percentage = $3
            `, [memberId, moduleId, progressPercentage]);
          }
        }
      } else {
        // Mark lesson as not completed
        await client.query(`
          UPDATE lesson_progress 
          SET completed = false, completed_at = NULL
          WHERE member_id = $1 AND lesson_id = $2
        `, [memberId, lessonId]);
      }
      
      client.release();
      
      return NextResponse.json({ success: true });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
