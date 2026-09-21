export type MeetingPlatform = 'TEAMS' | 'MEET' | 'ZOOM' | 'OTHER';

export type MeetingSessionStatus =
  | 'SCHEDULED'
  | 'AWAITING_JOIN'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type CalendarProvider = 'GOOGLE' | 'MICROSOFT';

export interface TranscriptSegmentDto {
  id: string;
  speakerLabel: string;
  text: string;
  startedAt: string;
  endedAt?: string;
  confidence?: number;
}

export interface MeetingSummaryDto {
  id: string;
  title: string;
  platform: MeetingPlatform;
  status: MeetingSessionStatus;
  scheduledStart: string;
  scheduledEnd?: string;
  joinUrl?: string;
  startedAt?: string;
  endedAt?: string;
  segmentCount: number;
}

/** Agendas ainda não iniciadas (editáveis / excluíveis). */
export function meetingCanModify(status: MeetingSessionStatus): boolean {
  return status === 'SCHEDULED' || status === 'AWAITING_JOIN';
}

export interface MeetingAlertEvent {
  type: 'meeting:starting';
  payload: {
    sessionId: string;
    title: string;
    platform: MeetingPlatform;
    joinUrl?: string;
    startsInMinutes: number;
  };
}

export interface RealtimeTranscriptEvent {
  type: 'transcript:segment';
  payload: TranscriptSegmentDto & { sessionId: string };
}

export type ServerSentEvent =
  | MeetingAlertEvent
  | RealtimeTranscriptEvent
  | { type: 'heartbeat'; payload: { at: string } };

export { toTeamsDesktopJoinUrl, isTeamsJoinUrl } from './teams-links';
export { speakerColor, SPEAKER_PALETTE } from './speaker-color';
