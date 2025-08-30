import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasDatabase: !!process.env.DATABASE_URL,
    hasJWT: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) + '...',
    jwtSecretStart: process.env.JWT_SECRET?.substring(0, 10) + '...'
  });
}
