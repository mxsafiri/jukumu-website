import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const client = await pool.connect();
    
    try {
      console.log('Adding id_type and id_number columns to members table...');
      
      // Add id_type column if it doesn't exist
      await client.query(`
        ALTER TABLE members 
        ADD COLUMN IF NOT EXISTS id_type VARCHAR(50);
      `);
      
      // Add id_number column if it doesn't exist
      await client.query(`
        ALTER TABLE members 
        ADD COLUMN IF NOT EXISTS id_number VARCHAR(100);
      `);
      
      // Verify the columns were added
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'members' 
        AND column_name IN ('id_type', 'id_number')
        ORDER BY column_name;
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Successfully added missing columns to members table',
        columns: result.rows
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Schema update error:', error);
    return NextResponse.json(
      { error: 'Failed to update schema', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
