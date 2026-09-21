import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CalendarMeetingEvent,
  CalendarPort,
} from '../../domain/ports/calendar.port';
import { PrismaService } from '../persistence/prisma.service';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';

@Injectable()
export class MicrosoftCalendarAdapter implements CalendarPort {
  private readonly logger = new Logger(MicrosoftCalendarAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly platformDetector: PlatformDetectorService,
  ) {}

  async fetchUpcoming(from: Date, to: Date): Promise<CalendarMeetingEvent[]> {
    const accounts = await this.prisma.calendarAccount.findMany({
      where: { provider: 'MICROSOFT' },
    });
    if (!accounts.length) return [];

    const events: CalendarMeetingEvent[] = [];

    for (const account of accounts) {
      try {
        const token = await this.ensureAccessToken(account);
        const url = new URL('https://graph.microsoft.com/v1.0/me/calendarView');
        url.searchParams.set('startDateTime', from.toISOString());
        url.searchParams.set('endDateTime', to.toISOString());
        url.searchParams.set('$select', 'subject,start,end,onlineMeeting,location,webLink');

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          this.logger.warn(
            `Microsoft Graph falhou para ${account.email}: ${response.status}`,
          );
          continue;
        }

        const payload = (await response.json()) as {
          value?: Array<{
            id: string;
            subject?: string;
            start?: { dateTime: string; timeZone: string };
            end?: { dateTime: string; timeZone: string };
            onlineMeeting?: { joinUrl?: string };
            webLink?: string;
            location?: { displayName?: string };
          }>;
        };

        for (const item of payload.value ?? []) {
          if (!item.start?.dateTime) continue;
          const joinUrl = item.onlineMeeting?.joinUrl ?? item.webLink;
          const title = item.subject ?? 'Reunião Teams';
          const platform = this.platformDetector.detect(
            `${title} ${item.location?.displayName ?? ''}`,
            joinUrl,
          );
          events.push({
            externalId: `microsoft:${account.email}:${item.id}`,
            title,
            platform: platform === 'OTHER' ? 'TEAMS' : platform,
            joinUrl,
            scheduledStart: new Date(item.start.dateTime),
            scheduledEnd: item.end?.dateTime
              ? new Date(item.end.dateTime)
              : undefined,
          });
        }
      } catch (error) {
        this.logger.error(`Erro Microsoft Graph (${account.email})`, error);
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

    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID');
    const clientSecret = this.config.get<string>('MICROSOFT_CLIENT_SECRET');
    const tenant = this.config.get<string>('MICROSOFT_TENANT') ?? 'common';
    if (!clientId || !clientSecret) {
      return account.accessToken;
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
      scope: 'offline_access Calendars.Read User.Read',
    });

    const response = await fetch(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    );

    if (!response.ok) {
      return account.accessToken;
    }

    const tokenPayload = (await response.json()) as {
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
    };

    await this.prisma.calendarAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token ?? account.refreshToken,
        expiresAt: tokenPayload.expires_in
          ? new Date(Date.now() + tokenPayload.expires_in * 1000)
          : undefined,
      },
    });

    return tokenPayload.access_token;
  }
}
