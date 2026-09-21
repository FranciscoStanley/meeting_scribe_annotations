import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateManualMeetingUseCase } from '../../application/use-cases/create-manual-meeting.use-case';
import { ListMeetingsUseCase } from '../../application/use-cases/list-meetings.use-case';
import { GetMeetingTranscriptUseCase } from '../../application/use-cases/get-meeting-transcript.use-case';
import { StartTranscriptionSessionUseCase } from '../../application/use-cases/start-transcription-session.use-case';
import { CompleteTranscriptionSessionUseCase } from '../../application/use-cases/complete-transcription-session.use-case';
import { SyncCalendarMeetingsUseCase } from '../../application/use-cases/sync-calendar-meetings.use-case';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@ApiTags('meetings')
@Controller('api/v1/meetings')
export class MeetingsController {
  constructor(
    private readonly createMeeting: CreateManualMeetingUseCase,
    private readonly listMeetings: ListMeetingsUseCase,
    private readonly getTranscript: GetMeetingTranscriptUseCase,
    private readonly startSession: StartTranscriptionSessionUseCase,
    private readonly completeSession: CompleteTranscriptionSessionUseCase,
    private readonly syncCalendar: SyncCalendarMeetingsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista reuniões e transcrições salvas' })
  list() {
    return this.listMeetings.execute();
  }

  @Post('sync-calendar')
  @ApiOperation({ summary: 'Sincroniza calendários conectados (Google/Microsoft)' })
  async sync() {
    const now = new Date();
    const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const synced = await this.syncCalendar.execute(now, to);
    return { synced };
  }

  @Get(':id/transcript')
  @ApiOperation({ summary: 'Detalhe da transcrição por reunião' })
  transcript(@Param('id') id: string) {
    return this.getTranscript.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria reunião manualmente' })
  async create(@Body() dto: CreateMeetingDto) {
    const session = await this.createMeeting.execute({
      title: dto.title,
      scheduledStart: new Date(dto.scheduledStart),
      scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
      joinUrl: dto.joinUrl,
      platform: dto.platform,
    });
    return session.toProps();
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Inicia captura/transcrição da reunião' })
  async start(@Param('id') id: string) {
    const session = await this.startSession.execute(id);
    return session.toProps();
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Encerra sessão de transcrição' })
  async complete(@Param('id') id: string) {
    const session = await this.completeSession.execute(id);
    return session.toProps();
  }
}
