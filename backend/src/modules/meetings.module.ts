import { Module } from '@nestjs/common';
import { MEETING_SESSION_REPOSITORY } from '../domain/ports/meeting-session.repository.port';
import { TRANSCRIPT_REPOSITORY } from '../domain/ports/transcript.repository.port';
import { PrismaMeetingSessionRepository } from '../infrastructure/persistence/prisma-meeting-session.repository';
import { PrismaTranscriptRepository } from '../infrastructure/persistence/prisma-transcript.repository';
import { PlatformDetectorService } from '../domain/services/platform-detector.service';
import { CreateManualMeetingUseCase } from '../application/use-cases/create-manual-meeting.use-case';
import { ListMeetingsUseCase } from '../application/use-cases/list-meetings.use-case';
import { GetMeetingTranscriptUseCase } from '../application/use-cases/get-meeting-transcript.use-case';
import { StartTranscriptionSessionUseCase } from '../application/use-cases/start-transcription-session.use-case';
import { CompleteTranscriptionSessionUseCase } from '../application/use-cases/complete-transcription-session.use-case';
import { UpdateMeetingUseCase } from '../application/use-cases/update-meeting.use-case';
import { DeleteMeetingUseCase } from '../application/use-cases/delete-meeting.use-case';
import { GetMeetingUseCase } from '../application/use-cases/get-meeting.use-case';
import { MeetingsController } from '../presentation/http/meetings.controller';

@Module({
  controllers: [MeetingsController],
  providers: [
    PlatformDetectorService,
    CreateManualMeetingUseCase,
    ListMeetingsUseCase,
    GetMeetingUseCase,
    GetMeetingTranscriptUseCase,
    StartTranscriptionSessionUseCase,
    CompleteTranscriptionSessionUseCase,
    UpdateMeetingUseCase,
    DeleteMeetingUseCase,
    {
      provide: MEETING_SESSION_REPOSITORY,
      useClass: PrismaMeetingSessionRepository,
    },
    {
      provide: TRANSCRIPT_REPOSITORY,
      useClass: PrismaTranscriptRepository,
    },
  ],
  exports: [
    MEETING_SESSION_REPOSITORY,
    TRANSCRIPT_REPOSITORY,
    StartTranscriptionSessionUseCase,
    CompleteTranscriptionSessionUseCase,
  ],
})
export class MeetingsModule {}
