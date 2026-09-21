import { contextBridge, ipcRenderer } from 'electron';
import type { MeetingAlertEvent } from '@meeting-scribe/shared';

contextBridge.exposeInMainWorld('meetingScribeDesktop', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  listTeamsSources: () => ipcRenderer.invoke('teams:list-sources'),
  detectTeamsMeeting: () => ipcRenderer.invoke('teams:detect-meeting'),
  openJoinUrl: (joinUrl: string, preferDesktop?: boolean) =>
    ipcRenderer.invoke('meeting:open-join-url', joinUrl, preferDesktop),
  setPendingCaptureSession: (sessionId: string) =>
    ipcRenderer.invoke('capture:set-pending-session', sessionId),
  consumePendingCaptureSession: () =>
    ipcRenderer.invoke('capture:consume-pending-session'),
  onMeetingAlert: (handler: (payload: MeetingAlertEvent['payload']) => void) => {
    const listener = (_event: unknown, payload: MeetingAlertEvent['payload']) =>
      handler(payload);
    ipcRenderer.on('meeting:alert', listener);
    return () => ipcRenderer.removeListener('meeting:alert', listener);
  },
  onTeamsMeetingWindow: (
    handler: (payload: { id: string; name: string }) => void,
  ) => {
    const listener = (
      _event: unknown,
      payload: { id: string; name: string },
    ) => handler(payload);
    ipcRenderer.on('teams:meeting-window', listener);
    return () => ipcRenderer.removeListener('teams:meeting-window', listener);
  },
});
