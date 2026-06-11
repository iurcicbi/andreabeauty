import { NextResponse } from 'next/server';
import crypto from 'crypto';

function getCSRFSecret(): string {
  return process.env.CSRF_SECRET || 'default-csrf-secret-change-me';
}

export async function GET() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHmac('sha256', getCSRFSecret()).update(token).digest('hex').slice(0, 32);

  const response = NextResponse.json({ success: true, csrfToken: hash });

  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400,
  });

  return response;
}
