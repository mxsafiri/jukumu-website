import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID ni lazima.' 
      }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Get user information
      const userResult = await client.query(
        'SELECT id, email, full_name, role FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        client.release();
        return NextResponse.json({ 
          error: 'Mtumiaji hapatikani.' 
        }, { status: 404 });
      }

      // Get corresponding member information
      const memberResult = await client.query(
        'SELECT id, full_name, email, phone, status FROM members WHERE user_id = $1',
        [userId]
      );

      client.release();
      
      return NextResponse.json({
        success: true,
        user: userResult.rows[0],
        member: memberResult.rows.length > 0 ? memberResult.rows[0] : null,
        hasMemberProfile: memberResult.rows.length > 0,
        message: memberResult.rows.length > 0 
          ? 'Mtumiaji na mwanachama wamepatikana' 
          : 'Mtumiaji amepatikana lakini hakuna rekodi ya mwanachama'
      });
      
    } catch (dbError) {
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Hitilafu imetokea wakati wa kutafuta taarifa za mtumiaji.' 
    }, { status: 500 });
  }
}
