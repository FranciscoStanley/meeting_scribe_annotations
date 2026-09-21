/** Nomes dos cookies de sessão (compartilhados client/server/middleware). */
export const MS_SESSION_COOKIE = 'ms_session';
export const MS_TOKEN_COOKIE = 'ms_access_token';
export const MS_EMAIL_COOKIE = 'ms_auth_email';

export function readBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

/** Token no browser: cookie de login → NEXT_PUBLIC (só LAN). */
export function resolveClientApiAccessToken(): string | undefined {
  const fromCookie = readBrowserCookie(MS_TOKEN_COOKIE)?.trim();
  if (fromCookie) return fromCookie;
  const fromEnv = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN?.trim();
  return fromEnv || undefined;
}

/**
 * Resolução sem next/headers (seguro em Client Components).
 * Em RSC preferir `resolveServerApiAccessToken` em `auth-token.server.ts`.
 */
export function resolveApiAccessTokenSync(): string | undefined {
  if (typeof window !== 'undefined') {
    return resolveClientApiAccessToken();
  }
  return (
    process.env.API_ACCESS_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_API_ACCESS_TOKEN?.trim() ||
    undefined
  );
}

export async function resolveApiAccessToken(): Promise<string | undefined> {
  return resolveApiAccessTokenSync();
}
