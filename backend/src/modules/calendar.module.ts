import { Module } from '@nestjs/common';
import { CALENDAR_PORT } from '../domain/ports/calendar.port';
import {
  CALENDAR_ADAPTERS,
  CompositeCalendarAdapter,
} from '../infrastructure/calendar/composite-calendar.adapter';
import { GoogleCalendarAdapter } from '../infrastructure/calendar/google-calendar.adapter';
import { MicrosoftCalendarAdapter } from '../infrastructure/calendar/microsoft-calendar.adapter';
import { PlatformDetectorService } from '../domain/services/platform-detector.service';
import { SyncCalendarMeetingsUseCase } from '../application/use-cases/sync-calendar-meetings.use-case';
import { CalendarOAuthController } from '../presentation/http/calendar-oauth.controller';
import { MeetingsModule } from './meetings.module';

@Module({
  imports: [MeetingsModule],
  controllers: [CalendarOAuthController],
  providers: [
    PlatformDetectorService,
    GoogleCalendarAdapter,
    MicrosoftCalendarAdapter,
    {
      provide: CALENDAR_ADAPTERS,
      useFactory: (
        google: GoogleCalendarAdapter,
        microsoft: MicrosoftCalendarAdapter,
      ) => [google, microsoft],
      inject: [GoogleCalendarAdapter, MicrosoftCalendarAdapter],
    },
    CompositeCalendarAdapter,
    {
      provide: CALENDAR_PORT,
      useExisting: CompositeCalendarAdapter,
    },
    SyncCalendarMeetingsUseCase,
  ],
  exports: [CALENDAR_PORT, SyncCalendarMeetingsUseCase],
})
export class CalendarModule {}
