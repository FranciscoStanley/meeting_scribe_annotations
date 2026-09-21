import 'server-only';
import { cookies } from 'next/headers';
import { MS_TOKEN_COOKIE } from '@/lib/auth-cookies';

/** Somente Server Components / Route Handlers. */
export async function resolveServerApiAccessToken(): Promise<
  string | undefined
> {
  try {
    const jar = await cookies();
    const fromCookie = jar.get(MS_TOKEN_COOKIE)?.value?.trim();
    if (fromCookie) return fromCookie;
  } catch {
    // fora de request
  }

  return (
    process.env.API_ACCESS_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_API_ACCESS_TOKEN?.trim() ||
    undefined
  );
}
