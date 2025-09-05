import { NextResponse } from 'next/server';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlLength = process.env.DATABASE_URL?.length || 0;
  
  return NextResponse.json({
    hasDbUrl,
    dbUrlLength,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
