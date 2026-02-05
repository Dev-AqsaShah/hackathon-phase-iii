import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || 'default-user';
const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL || 'user@taskflow.app';

async function createToken(userId: string | number, email?: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || '');

  const token = await new jose.SignJWT({
    sub: String(userId),
    email: email || undefined,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  return token;
}

export async function GET(request: NextRequest) {
  try {
    const userId = DEFAULT_USER_ID;
    const email = DEFAULT_USER_EMAIL;
    const token = await createToken(userId, email);

    const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = DEFAULT_USER_ID;
    const email = DEFAULT_USER_EMAIL;
    const token = await createToken(userId, email);
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { detail: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
