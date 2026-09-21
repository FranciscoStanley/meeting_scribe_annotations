import { TranscriptSegmentEntity } from '../entities/transcript-segment.entity';

export const TRANSCRIPT_REPOSITORY = Symbol('TRANSCRIPT_REPOSITORY');

export interface TranscriptRepositoryPort {
  append(segment: TranscriptSegmentEntity): Promise<TranscriptSegmentEntity>;
  listBySession(sessionId: string): Promise<TranscriptSegmentEntity[]>;
  countBySession(sessionId: string): Promise<number>;
  upsertSpeaker(sessionId: string, label: string, displayName?: string): Promise<string>;
}
