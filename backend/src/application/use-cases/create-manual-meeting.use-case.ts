import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { MeetingPlatform } from '@meeting-scribe/shared';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import { PlatformDetectorService } from '../../domain/services/platform-detector.service';
import { assertMeetingSchedule } from '../../domain/services/meeting-schedule.service';

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

    let session = MeetingSessionEntity.create({
      title: input.title,
      platform,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      joinUrl: input.joinUrl,
    });

    const now = new Date();
    if (session.shouldAutoComplete(now)) {
      session = session.complete(now);
    }

    return this.sessions.save(session);
  }
}
