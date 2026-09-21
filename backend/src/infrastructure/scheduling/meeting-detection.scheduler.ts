import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncCalendarMeetingsUseCase } from '../../application/use-cases/sync-calendar-meetings.use-case';
import { ProcessMeetingAlertsUseCase } from '../../application/use-cases/process-meeting-alerts.use-case';

@Injectable()
export class MeetingDetectionScheduler {
  private readonly logger = new Logger(MeetingDetectionScheduler.name);

  constructor(
    private readonly syncCalendar: SyncCalendarMeetingsUseCase,
    private readonly processAlerts: ProcessMeetingAlertsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async detectUpcomingMeetings() {
    const now = new Date();
    const syncTo = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    try {
      const synced = await this.syncCalendar.execute(now, syncTo);
      const alerts = await this.processAlerts.execute(now);
      if (synced || alerts) {
        this.logger.log(`Sync=${synced} alertas=${alerts}`);
      }
    } catch (error) {
      this.logger.error('Falha na detecção de reuniões', error);
    }
  }
}
