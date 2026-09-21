import { Inject, Injectable } from '@nestjs/common';
import {
  MEETING_SESSION_REPOSITORY,
  MeetingSessionRepositoryPort,
} from '../../domain/ports/meeting-session.repository.port';
import {
  TRANSCRIPT_REPOSITORY,
  TranscriptRepositoryPort,
} from '../../domain/ports/transcript.repository.port';
import { MeetingSummaryDto } from '@meeting-scribe/shared';
import { ExpirePastMeetingsUseCase } from './expire-past-meetings.use-case';

@Injectable()
export class ListMeetingsUseCase {
  constructor(
    @Inject(MEETING_SESSION_REPOSITORY)
    private readonly sessions: MeetingSessionRepositoryPort,
    @Inject(TRANSCRIPT_REPOSITORY)
    private readonly transcripts: TranscriptRepositoryPort,
    private readonly expirePast: ExpirePastMeetingsUseCase,
  ) {}

  async execute(limit = 50): Promise<MeetingSummaryDto[]> {
    await this.expirePast.execute();
    const items = await this.sessions.listRecent(limit);
    return Promise.all(
      items.map(async (session) => {
        const segmentCount = await this.transcripts.countBySession(session.id);
        const props = session.toProps();
        return {
          id: props.id,
          title: props.title,
          platform: props.platform,
          status: props.status,
          scheduledStart: props.scheduledStart.toISOString(),
          scheduledEnd: props.scheduledEnd?.toISOString(),
          joinUrl: props.joinUrl,
          startedAt: props.startedAt?.toISOString(),
          endedAt: props.endedAt?.toISOString(),
          segmentCount,
        };
      }),
    );
  }
}
