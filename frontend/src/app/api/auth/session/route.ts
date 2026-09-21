import { NextResponse } from 'next/server';
import {
  MS_EMAIL_COOKIE,
  MS_SESSION_COOKIE,
  MS_TOKEN_COOKIE,
} from '@/lib/auth-cookies';

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

/** Grava sessão após login bem-sucedido no backend. */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    accessToken?: string | null;
    email?: string;
  };

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MS_SESSION_COOKIE, '1', {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 12,
  });
  if (body.email) {
    res.cookies.set(MS_EMAIL_COOKIE, body.email, {
      ...COOKIE_BASE,
      httpOnly: false,
      maxAge: 60 * 60 * 12,
    });
  }
  if (body.accessToken) {
    res.cookies.set(MS_TOKEN_COOKIE, body.accessToken, {
      ...COOKIE_BASE,
      // Precisa ser legível no browser (SSE ?apiKey= e Socket.IO auth cross-origin)
      httpOnly: false,
      maxAge: 60 * 60 * 12,
    });
  } else {
    res.cookies.delete(MS_TOKEN_COOKIE);
  }
  return res;
}

/** Logout — limpa cookies de sessão. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(MS_SESSION_COOKIE);
  res.cookies.delete(MS_TOKEN_COOKIE);
  res.cookies.delete(MS_EMAIL_COOKIE);
  return res;
}
