import { Injectable } from '@nestjs/common';
import { TranscriptSegmentEntity } from '../../domain/entities/transcript-segment.entity';
import { TranscriptRepositoryPort } from '../../domain/ports/transcript.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTranscriptRepository implements TranscriptRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async append(
    segment: TranscriptSegmentEntity,
  ): Promise<TranscriptSegmentEntity> {
    const props = segment.toProps();
    const row = await this.prisma.transcriptSegment.create({
      data: {
        id: props.id,
        sessionId: props.sessionId,
        speakerId: props.speakerId,
        speakerLabel: props.speakerLabel,
        text: props.text,
        confidence: props.confidence,
        startedAt: props.startedAt,
        endedAt: props.endedAt,
      },
    });
    return TranscriptSegmentEntity.rehydrate({
      id: row.id,
      sessionId: row.sessionId,
      speakerId: row.speakerId ?? undefined,
      speakerLabel: row.speakerLabel,
      text: row.text,
      confidence: row.confidence ?? undefined,
      startedAt: row.startedAt,
      endedAt: row.endedAt ?? undefined,
    });
  }

  async listBySession(sessionId: string): Promise<TranscriptSegmentEntity[]> {
    const rows = await this.prisma.transcriptSegment.findMany({
      where: { sessionId },
      orderBy: { startedAt: 'asc' },
    });
    return rows.map((row) =>
      TranscriptSegmentEntity.rehydrate({
        id: row.id,
        sessionId: row.sessionId,
        speakerId: row.speakerId ?? undefined,
        speakerLabel: row.speakerLabel,
        text: row.text,
        confidence: row.confidence ?? undefined,
        startedAt: row.startedAt,
        endedAt: row.endedAt ?? undefined,
      }),
    );
  }

  async countBySession(sessionId: string): Promise<number> {
    return this.prisma.transcriptSegment.count({ where: { sessionId } });
  }

  async upsertSpeaker(
    sessionId: string,
    label: string,
    displayName?: string,
  ): Promise<string> {
    const speaker = await this.prisma.speakerProfile.upsert({
      where: { sessionId_label: { sessionId, label } },
      create: { sessionId, label, displayName },
      update: { displayName },
    });
    return speaker.id;
  }
}
