import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';

@Injectable()
export class CompleteTranscriptionSessionUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Sessão de reunião não encontrada');
    }
    const completed = session.complete(new Date());
    return this.sessions.save(completed);
  }
}
