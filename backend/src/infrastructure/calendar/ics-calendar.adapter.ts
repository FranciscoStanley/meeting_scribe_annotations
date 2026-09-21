import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ical from 'node-ical';
import {
  CalendarMeetingEvent,
  CalendarPort,
} from '../../domain/ports/calendar.port';
import { PrismaService } from '../persistence/prisma.service';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';

@Injectable()
export class IcsCalendarAdapter implements CalendarPort {
  private readonly logger = new Logger(IcsCalendarAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly platformDetector: PlatformDetectorService,
  ) {}

  async fetchUpcoming(from: Date, to: Date): Promise<CalendarMeetingEvent[]> {
    const urls = await this.resolveFeedUrls();
    if (!urls.length) return [];

    const events: CalendarMeetingEvent[] = [];
    for (const url of urls) {
      try {
        const parsed = await ical.async.fromURL(url);
        for (const item of Object.values(parsed)) {
          if (!item || typeof item !== 'object') continue;
          if ((item as { type?: string }).type !== 'VEVENT') continue;

          const vevent = item as {
            uid?: string;
            summary?: string;
            description?: string;
            location?: string;
            url?: string;
            start?: Date;
            end?: Date;
          };

          if (!vevent.start || !(vevent.start instanceof Date)) continue;
          if (vevent.start < from || vevent.start > to) continue;

          const title = vevent.summary ?? 'Reunião';
          const haystack = [
            title,
            vevent.description ?? '',
            vevent.location ?? '',
            vevent.url ?? '',
          ].join(' ');

          const joinUrl = this.extractJoinUrl(haystack) ?? vevent.url;
          const platform = this.platformDetector.detect(haystack, joinUrl);

          if (platform === 'OTHER' && !joinUrl) continue;

          events.push({
            externalId: `ics:${vevent.uid ?? `${url}:${vevent.start.toISOString()}`}`,
            title,
            platform,
            joinUrl,
            scheduledStart: vevent.start,
            scheduledEnd:
              vevent.end instanceof Date ? vevent.end : undefined,
          });
        }
      } catch (error) {
        this.logger.warn(`Falha ao ler ICS ${url}: ${String(error)}`);
      }
    }
    return events;
  }

  private async resolveFeedUrls(): Promise<string[]> {
    const fromDb = await this.prisma.calendarFeed.findMany({
      where: { enabled: true },
      select: { url: true },
    });
    const fromEnv = (this.config.get<string>('CALENDAR_ICS_URLS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    return [...new Set([...fromDb.map((f) => f.url), ...fromEnv])];
  }

  private extractJoinUrl(text: string): string | undefined {
    const match = text.match(
      /https?:\/\/(?:meet\.google\.com\/[^\s<>"]+|teams\.microsoft\.com\/[^\s<>"]+|teams\.live\.com\/[^\s<>"]+|[\w.-]*zoom\.us\/[^\s<>"]+)/i,
    );
    return match?.[0];
  }
}
