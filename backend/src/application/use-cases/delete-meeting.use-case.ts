import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';

@Injectable()
export class DeleteMeetingUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
  ) {}

  async execute(id: string): Promise<{ ok: true }> {
    const session = await this.sessions.findById(id);
    if (!session) {
      throw new NotFoundException('Reunião não encontrada');
    }
    if (!session.canModify()) {
      throw new BadRequestException(
        'Só é possível excluir agendas que ainda não iniciaram. Reuniões ao vivo ou concluídas são somente leitura.',
      );
    }
    await this.sessions.deleteById(id);
    return { ok: true };
  }
}
