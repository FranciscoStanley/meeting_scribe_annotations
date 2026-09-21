import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';

@Injectable()
export class StartTranscriptionSessionUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Sessão de reunião não encontrada');
    }
    const live = session.startLive(new Date());
    return this.sessions.save(live);
  }
}
