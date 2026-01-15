import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let cachedPasswordColumn: 'password_hash' | 'password' | null = null;

async function getPasswordColumn(client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: { column_name: string }[] }> }) {
  if (cachedPasswordColumn) return cachedPasswordColumn;

  const res = await client.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name IN ('password_hash', 'password')
    `
  );

  const cols = new Set(res.rows.map((r) => r.column_name));
  cachedPasswordColumn = cols.has('password_hash') ? 'password_hash' : cols.has('password') ? 'password' : null;
  return cachedPasswordColumn;
}

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '');

  if (!digits) return '';

  // Tanzania-friendly normalization
  if (digits.length === 10 && digits.startsWith('0')) return `255${digits.slice(1)}`;
  if (digits.length === 9) return `255${digits}`;

  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier: string | undefined = body.identifier ?? body.email;
    const password: string | undefined = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isEmail = identifier.includes('@');
    const normalizedPhone = isEmail ? null : normalizePhone(identifier);

    // Find user
    const client = await pool.connect();
    const passwordColumn = await getPasswordColumn(client);
    if (!passwordColumn) {
      client.release();
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const result = isEmail
      ? await client.query(
          `
          SELECT u.id, u.email, u.${passwordColumn} as password_hash, u.full_name, u.role
          FROM users u
          WHERE lower(u.email) = lower($1)
          LIMIT 1
          `,
          [identifier]
        )
      : await client.query(
          `
          SELECT u.id, u.email, u.${passwordColumn} as password_hash, u.full_name, u.role
          FROM users u
          LEFT JOIN members m ON (m.user_id = u.id OR lower(m.email) = lower(u.email))
          WHERE $1 IS NOT NULL
          AND regexp_replace(coalesce(m.phone, ''), '\\D', '', 'g') = $1
          `,
          [normalizedPhone]
        );

    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!isEmail && result.rows.length > 1) {
      client.release();
      return NextResponse.json(
        { error: 'Namba ya simu inatumika kwenye akaunti zaidi ya moja.' },
        { status: 409 }
      );
    }

    const user = result.rows[0];
    client.release();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create response with token in cookie
    const response = NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name, 
        role: user.role 
      } 
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
