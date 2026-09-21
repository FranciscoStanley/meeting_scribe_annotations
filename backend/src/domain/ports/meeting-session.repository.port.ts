import { MeetingSessionEntity } from '../entities/meeting-session.entity';

export const MEETING_SESSION_REPOSITORY = Symbol('MEETING_SESSION_REPOSITORY');

export interface MeetingSessionRepositoryPort {
  save(session: MeetingSessionEntity): Promise<MeetingSessionEntity>;
  findById(id: string): Promise<MeetingSessionEntity | null>;
  findUpcoming(from: Date, to: Date): Promise<MeetingSessionEntity[]>;
  findAwaitingOrLive(): Promise<MeetingSessionEntity[]>;
  listRecent(limit: number): Promise<MeetingSessionEntity[]>;
  findByExternalId(externalId: string): Promise<MeetingSessionEntity | null>;
}
