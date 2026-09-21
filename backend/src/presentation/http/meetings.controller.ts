import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateManualMeetingUseCase } from '../../application/use-cases/create-manual-meeting.use-case';
import { ListMeetingsUseCase } from '../../application/use-cases/list-meetings.use-case';
import { GetMeetingTranscriptUseCase } from '../../application/use-cases/get-meeting-transcript.use-case';
import { StartTranscriptionSessionUseCase } from '../../application/use-cases/start-transcription-session.use-case';
import { CompleteTranscriptionSessionUseCase } from '../../application/use-cases/complete-transcription-session.use-case';
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
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista reuniões e quantidade de trechos' })
  @ApiOkResponse({ description: 'Array de MeetingSummaryDto' })
  list() {
    return this.listMeetings.execute();
  }

  @Get(':id/transcript')
  @ApiOperation({
    summary: 'Transcrição salva da reunião',
    description:
      'Segmentos com speakerLabel (cores estáveis no frontend pelo nome).',
  })
  transcript(@Param('id') id: string) {
    return this.getTranscript.execute(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Agenda reunião (horário + link)',
    description:
      'Cria sessão SCHEDULED. Perto do horário o cron emite SSE meeting:starting (MEETING_ALERT_MINUTES / MEETING_ALERT_GRACE_MINUTES).',
  })
  @ApiOkResponse({ description: 'MeetingSessionProps da sessão criada' })
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
  @ApiOperation({ summary: 'Marca sessão como LIVE (início da captura)' })
  async start(@Param('id') id: string) {
    const session = await this.startSession.execute(id);
    return session.toProps();
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Encerra sessão de transcrição (COMPLETED)' })
  async complete(@Param('id') id: string) {
    const session = await this.completeSession.execute(id);
    return session.toProps();
  }
}
