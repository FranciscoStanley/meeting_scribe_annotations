import { Module } from '@nestjs/common';
import { ProcessMeetingAlertsUseCase } from '../application/use-cases/process-meeting-alerts.use-case';
import { EventsController } from '../presentation/http/events.controller';
import { MeetingDetectionScheduler } from '../infrastructure/scheduling/meeting-detection.scheduler';
import { MeetingsModule } from './meetings.module';
import { CalendarModule } from './calendar.module';
import { TranscriptionModule } from './transcription.module';

@Module({
  imports: [MeetingsModule, CalendarModule, TranscriptionModule],
  controllers: [EventsController],
  providers: [ProcessMeetingAlertsUseCase, MeetingDetectionScheduler],
})
export class RealtimeModule {}
