import type { MeetingAlertEvent } from '@meeting-scribe/shared';

declare global {
  interface Window {
    meetingScribeDesktop: {
      getConfig: () => Promise<{
        apiUrl: string;
        wsUrl: string;
        platform: string;
      }>;
      listTeamsSources: () => Promise<Array<{ id: string; name: string }>>;
      detectTeamsMeeting: () => Promise<{
        id: string;
        name: string;
        isLikelyInCall: boolean;
      } | null>;
      openJoinUrl: (joinUrl: string, preferDesktop?: boolean) => Promise<void>;
      setPendingCaptureSession: (sessionId: string) => Promise<void>;
      consumePendingCaptureSession: () => Promise<string | null>;
      onMeetingAlert: (
        handler: (payload: MeetingAlertEvent['payload']) => void,
      ) => () => void;
      onTeamsMeetingWindow: (
        handler: (payload: { id: string; name: string }) => void,
      ) => () => void;
    };
  }
}

export {};
