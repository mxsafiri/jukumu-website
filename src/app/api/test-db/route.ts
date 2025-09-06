import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlLength = process.env.DATABASE_URL?.length || 0;
  
  let connectionTest = 'not_tested';
  let error = null;
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    connectionTest = 'success';
  } catch (err) {
    connectionTest = 'failed';
    error = err instanceof Error ? err.message : 'Unknown error';
  }
  
  return NextResponse.json({
    hasDbUrl,
    dbUrlLength,
    nodeEnv: process.env.NODE_ENV,
    connectionTest,
    error,
    timestamp: new Date().toISOString()
  });
}
