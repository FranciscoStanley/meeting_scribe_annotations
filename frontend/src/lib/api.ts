import { MeetingSummaryDto } from '@meeting-scribe/shared';
import { resolveApiAccessTokenSync } from '@/lib/auth-cookies';

function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:3001'
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

function publicApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

export { resolveApiAccessTokenSync as resolveApiAccessToken };

function authHeadersFrom(token?: string): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    'X-API-Key': token,
  };
}

async function requestWithToken<T>(
  path: string,
  token: string | undefined,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeadersFrom(token),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export type AuthStatusDto = {
  openMode: boolean;
  credentialsConfigured: boolean;
  tokenConfigured: boolean;
};

export type LoginResponseDto = {
  accessToken: string | null;
  email: string;
  mode: 'open' | 'credentials' | 'token';
};

export function createApi(tokenOverride?: string | null) {
  const resolveToken = () =>
    tokenOverride === null
      ? undefined
      : (tokenOverride ?? resolveApiAccessTokenSync());

  const request = <T>(path: string, init?: RequestInit) =>
    requestWithToken<T>(path, resolveToken(), init);

  return {
    authStatus: () => request<AuthStatusDto>('/api/v1/auth/status'),
    login: (body: { email?: string; password: string }) =>
      request<LoginResponseDto>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    listMeetings: () => request<MeetingSummaryDto[]>('/api/v1/meetings'),
    getTranscript: (id: string) =>
      request<{
        session: Record<string, unknown>;
        segments: Array<{
          id: string;
          speakerLabel: string;
          text: string;
          startedAt: string;
          confidence?: number;
        }>;
      }>(`/api/v1/meetings/${id}/transcript`),
    startMeeting: (id: string) =>
      request(`/api/v1/meetings/${id}/start`, { method: 'POST' }),
    completeMeeting: (id: string) =>
      request(`/api/v1/meetings/${id}/complete`, { method: 'POST' }),
    syncCalendar: () =>
      request<{ synced: number }>('/api/v1/meetings/sync-calendar', {
        method: 'POST',
      }),
    createMeeting: (body: {
      title: string;
      scheduledStart: string;
      scheduledEnd?: string;
      joinUrl?: string;
      platform?: string;
    }) =>
      request('/api/v1/meetings', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getMeeting: (id: string) =>
      request<{
        id: string;
        title: string;
        platform: string;
        status: import('@meeting-scribe/shared').MeetingSessionStatus;
        scheduledStart: string;
        scheduledEnd?: string;
        joinUrl?: string;
        canModify: boolean;
      }>(`/api/v1/meetings/${id}`),
    updateMeeting: (
      id: string,
      body: {
        title: string;
        scheduledStart: string;
        scheduledEnd?: string;
        joinUrl: string;
        platform?: string;
      },
    ) =>
      request(`/api/v1/meetings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deleteMeeting: (id: string) =>
      request<{ ok: true }>(`/api/v1/meetings/${id}`, { method: 'DELETE' }),
    listCalendarFeeds: () =>
      request<Array<{ id: string; url: string; label: string | null }>>(
        '/api/v1/calendar/feeds',
      ),
    addCalendarFeed: (body: { url: string; label?: string }) =>
      request('/api/v1/calendar/feeds', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    removeCalendarFeed: (id: string) =>
      request(`/api/v1/calendar/feeds/${id}`, { method: 'DELETE' }),
    calendarStatus: () =>
      request<{
        googleConfigured: boolean;
        microsoftConfigured: boolean;
        accounts: Array<{
          id: string;
          provider: 'GOOGLE' | 'MICROSOFT' | 'ICS';
          email: string;
          connectedAt: string;
          updatedAt: string;
        }>;
      }>('/api/v1/calendar/status'),
    disconnectCalendarAccount: (id: string) =>
      request(`/api/v1/calendar/accounts/${id}`, { method: 'DELETE' }),
  };
}

/** Client / sync — usa cookie no browser ou env. */
export const api = createApi();

export function calendarConnectUrl(provider: 'google' | 'microsoft') {
  return `${publicApiBaseUrl()}/api/v1/calendar/${provider}/connect`;
}

export async function eventsStreamUrl() {
  const base = `${publicApiBaseUrl()}/api/v1/events/stream`;
  const token = resolveApiAccessTokenSync();
  if (!token) return base;
  const url = new URL(base);
  url.searchParams.set('apiKey', token);
  return url.toString();
}

export function transcriptionSocketUrl() {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? publicApiBaseUrl();
  return `${base}/transcription`;
}

export async function transcriptionSocketAuth(): Promise<
  { token: string } | Record<string, never>
> {
  const token = resolveApiAccessTokenSync();
  return token ? { token } : {};
}
