import { NextResponse } from 'next/server';
import { fetcher } from '../../../lib/fetcher';

const NEXT_PUBLIC_JWT_AUTH_URL = process.env.NEXT_PUBLIC_JWT_AUTH_URL;

export async function POST(req) {
  const { username, password } = await req.json();

  const res = await fetcher(`${NEXT_PUBLIC_JWT_AUTH_URL}/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok || !data.token) {
    return NextResponse.json({ error: 'Invalid login' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set('token', data.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}