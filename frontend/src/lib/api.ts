import { MeetingSummaryDto } from '@meeting-scribe/shared';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
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
    joinUrl?: string;
    platform?: string;
  }) =>
    request('/api/v1/meetings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
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
};

export function calendarConnectUrl(provider: 'google' | 'microsoft') {
  return `${publicApiBaseUrl()}/api/v1/calendar/${provider}/connect`;
}

export function eventsStreamUrl() {
  return `${publicApiBaseUrl()}/api/v1/events/stream`;
}

export function transcriptionSocketUrl() {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? publicApiBaseUrl();
  return `${base}/transcription`;
}
