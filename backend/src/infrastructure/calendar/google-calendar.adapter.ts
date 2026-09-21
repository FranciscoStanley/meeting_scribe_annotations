import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CalendarMeetingEvent,
  CalendarPort,
} from '../../domain/ports/calendar.port';
import { PrismaService } from '../persistence/prisma.service';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';

@Injectable()
export class GoogleCalendarAdapter implements CalendarPort {
  private readonly logger = new Logger(GoogleCalendarAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly platformDetector: PlatformDetectorService,
  ) {}

  async fetchUpcoming(from: Date, to: Date): Promise<CalendarMeetingEvent[]> {
    const accounts = await this.prisma.calendarAccount.findMany({
      where: { provider: 'GOOGLE' },
    });
    if (!accounts.length) return [];

    const events: CalendarMeetingEvent[] = [];

    for (const account of accounts) {
      try {
        const token = await this.ensureAccessToken(account);
        const url = new URL(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        );
        url.searchParams.set('timeMin', from.toISOString());
        url.searchParams.set('timeMax', to.toISOString());
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('orderBy', 'startTime');

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          this.logger.warn(
            `Google Calendar falhou para ${account.email}: ${response.status}`,
          );
          continue;
        }

        const payload = (await response.json()) as {
          items?: Array<{
            id: string;
            summary?: string;
            start?: { dateTime?: string; date?: string };
            end?: { dateTime?: string; date?: string };
            hangoutLink?: string;
            conferenceData?: { entryPoints?: Array<{ uri?: string }> };
            location?: string;
          }>;
        };

        for (const item of payload.items ?? []) {
          const startRaw = item.start?.dateTime ?? item.start?.date;
          if (!startRaw) continue;
          const joinUrl =
            item.hangoutLink ??
            item.conferenceData?.entryPoints?.find((e) => e.uri)?.uri ??
            undefined;
          const title = item.summary ?? 'Reunião';
          const platform = this.platformDetector.detect(
            `${title} ${item.location ?? ''}`,
            joinUrl,
          );
          if (platform !== 'MEET' && platform !== 'TEAMS' && !joinUrl) {
            continue;
          }
          events.push({
            externalId: `google:${account.email}:${item.id}`,
            title,
            platform: platform === 'OTHER' ? 'MEET' : platform,
            joinUrl,
            scheduledStart: new Date(startRaw),
            scheduledEnd: item.end?.dateTime
              ? new Date(item.end.dateTime)
              : undefined,
          });
        }
      } catch (error) {
        this.logger.error(`Erro Google Calendar (${account.email})`, error);
      }
    }

    return events;
  }

  private async ensureAccessToken(account: {
    id: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
  }): Promise<string> {
    const stillValid =
      account.expiresAt &&
      account.expiresAt.getTime() > Date.now() + 60_000;
    if (stillValid) return account.accessToken;

    if (!account.refreshToken) {
      return account.accessToken;
    }

    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return account.accessToken;
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      return account.accessToken;
    }

    const tokenPayload = (await response.json()) as {
      access_token: string;
      expires_in?: number;
    };

    await this.prisma.calendarAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokenPayload.access_token,
        expiresAt: tokenPayload.expires_in
          ? new Date(Date.now() + tokenPayload.expires_in * 1000)
          : undefined,
      },
    });

    return tokenPayload.access_token;
  }
}
