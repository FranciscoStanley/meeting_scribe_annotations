import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateManualMeetingUseCase } from '../../application/use-cases/create-manual-meeting.use-case';
import { ListMeetingsUseCase } from '../../application/use-cases/list-meetings.use-case';
import { GetMeetingTranscriptUseCase } from '../../application/use-cases/get-meeting-transcript.use-case';
import { StartTranscriptionSessionUseCase } from '../../application/use-cases/start-transcription-session.use-case';
import { CompleteTranscriptionSessionUseCase } from '../../application/use-cases/complete-transcription-session.use-case';
import { UpdateMeetingUseCase } from '../../application/use-cases/update-meeting.use-case';
import { DeleteMeetingUseCase } from '../../application/use-cases/delete-meeting.use-case';
import { GetMeetingUseCase } from '../../application/use-cases/get-meeting.use-case';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@ApiTags('meetings')
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@Controller('api/v1/meetings')
export class MeetingsController {
  constructor(
    private readonly createMeeting: CreateManualMeetingUseCase,
    private readonly listMeetings: ListMeetingsUseCase,
    private readonly getMeeting: GetMeetingUseCase,
    private readonly getTranscript: GetMeetingTranscriptUseCase,
    private readonly startSession: StartTranscriptionSessionUseCase,
    private readonly completeSession: CompleteTranscriptionSessionUseCase,
    private readonly updateMeeting: UpdateMeetingUseCase,
    private readonly deleteMeeting: DeleteMeetingUseCase,
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

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhe da agenda',
    description: 'Inclui canModify (true se SCHEDULED ou AWAITING_JOIN).',
  })
  detail(@Param('id') id: string) {
    return this.getMeeting.execute(id);
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Edita agenda ainda não iniciada',
    description:
      'Permitido apenas para status SCHEDULED ou AWAITING_JOIN. LIVE/COMPLETED são somente leitura. Reagenda limpa o alerta para notificar de novo.',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    const session = await this.updateMeeting.execute(id, {
      title: dto.title,
      scheduledStart: new Date(dto.scheduledStart),
      scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
      joinUrl: dto.joinUrl,
      platform: dto.platform,
    });
    return session.toProps();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Exclui agenda ainda não iniciada',
    description:
      'Permitido apenas para SCHEDULED ou AWAITING_JOIN. Remove a sessão e trechos em cascata.',
  })
  @ApiOkResponse({ description: '{ ok: true }' })
  remove(@Param('id') id: string) {
    return this.deleteMeeting.execute(id);
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
