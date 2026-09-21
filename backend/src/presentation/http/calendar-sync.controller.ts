import { Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { SyncCalendarMeetingsUseCase } from '../../application/use-cases/sync-calendar-meetings.use-case';

@ApiTags('meetings')
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@Controller('api/v1/meetings')
export class CalendarSyncController {
  constructor(private readonly syncCalendar: SyncCalendarMeetingsUseCase) {}

  @Post('sync-calendar')
  @ApiOperation({
    summary: 'Sincroniza calendários (ICS / Google / Microsoft)',
  })
  @ApiOkResponse({ description: '{ synced: number }' })
  async sync() {
    const now = new Date();
    const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const synced = await this.syncCalendar.execute(now, to);
    return { synced };
  }
}
