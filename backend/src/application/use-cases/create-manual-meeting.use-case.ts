import { Inject, Injectable } from '@nestjs/common';
import { MeetingPlatform } from '@meeting-scribe/shared';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';

export interface CreateManualMeetingInput {
  title: string;
  scheduledStart: Date;
  scheduledEnd?: Date;
  joinUrl?: string;
  platform?: MeetingPlatform;
}

@Injectable()
export class CreateManualMeetingUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    private readonly platformDetector: PlatformDetectorService,
  ) {}

  async execute(input: CreateManualMeetingInput) {
    const platform =
      input.platform ??
      this.platformDetector.detect(input.title, input.joinUrl);

    const session = MeetingSessionEntity.create({
      title: input.title,
      platform,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      joinUrl: input.joinUrl,
    });

    return this.sessions.save(session);
  }
}
