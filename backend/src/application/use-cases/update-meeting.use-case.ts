import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingPlatform } from '@meeting-scribe/shared';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';
import { assertMeetingSchedule } from '../../domain/services/meeting-schedule.service';

export interface UpdateMeetingInput {
  title: string;
  scheduledStart: Date;
  scheduledEnd?: Date;
  joinUrl: string;
  platform?: MeetingPlatform;
}

@Injectable()
export class UpdateMeetingUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    private readonly platformDetector: PlatformDetectorService,
  ) {}

  async execute(id: string, input: UpdateMeetingInput) {
    const session = await this.sessions.findById(id);
    if (!session) {
      throw new NotFoundException('Reunião não encontrada');
    }
    if (!session.canModify()) {
      throw new BadRequestException(
        'Só é possível editar agendas que ainda não iniciaram. Reuniões ao vivo ou concluídas são somente leitura.',
      );
    }

    try {
      assertMeetingSchedule(input.scheduledStart, input.scheduledEnd);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Horário inválido',
      );
    }

    const platform =
      input.platform ??
      this.platformDetector.detect(input.title, input.joinUrl);

    try {
      const updated = session.updateSchedule({
        title: input.title,
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd,
        joinUrl: input.joinUrl,
        platform,
      });
      return this.sessions.save(updated);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Não foi possível editar',
      );
    }
  }
}
