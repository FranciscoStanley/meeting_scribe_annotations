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

export type MeetingRowAction = 'edit' | 'delete' | 'open';

export type MeetingOpenVariant = 'primary' | 'secondary';

/** Ações da linha na lista: quem vê Editar/Excluir e se Abrir é CTA primário. */
export function meetingRowActions(status: MeetingSessionStatus): {
  actions: MeetingRowAction[];
  openVariant: MeetingOpenVariant;
} {
  const actions: MeetingRowAction[] = meetingCanModify(status)
    ? ['edit', 'delete', 'open']
    : ['open'];
  const openVariant: MeetingOpenVariant =
    status === 'LIVE' || status === 'COMPLETED' ? 'primary' : 'secondary';
  return { actions, openVariant };
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
export {
  speakerColor,
  buildSpeakerColorMap,
  normalizeSpeakerKey,
  SPEAKER_PALETTE,
} from './speaker-color';
