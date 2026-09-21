import { BrowserWindow, Notification, shell } from 'electron';
import {
  isTeamsJoinUrl,
  MeetingAlertEvent,
  ServerSentEvent,
  toTeamsDesktopJoinUrl,
} from '@meeting-scribe/shared';
import { DesktopConfig } from './config';

type AlertHandler = (alert: MeetingAlertEvent['payload']) => void;

export class MeetingAlertsService {
  private abort: AbortController | null = null;
  private onAlert: AlertHandler | null = null;

  constructor(private readonly config: DesktopConfig) {}

  setHandler(handler: AlertHandler) {
    this.onAlert = handler;
  }

  start() {
    if (this.abort) return;
    void this.readStream();
  }

  stop() {
    this.abort?.abort();
    this.abort = null;
  }

  openMeetingJoinUrl(joinUrl: string, preferDesktopTeams: boolean) {
    let target = joinUrl;
    if (preferDesktopTeams && isTeamsJoinUrl(joinUrl)) {
      target = toTeamsDesktopJoinUrl(joinUrl);
    }
    void shell.openExternal(target);
  }

  private async readStream() {
    const url = `${this.config.apiUrl}/api/v1/events/stream`;
    this.abort = new AbortController();

    try {
      const response = await fetch(url, { signal: this.abort.signal });
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          this.handleSseBlock(rawEvent);
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setTimeout(() => this.readStream(), 5000);
    }
  }

  private handleSseBlock(block: string) {
    const dataLine = block
      .split('\n')
      .find((line) => line.startsWith('data:'));
    if (!dataLine) return;

    const json = dataLine.replace(/^data:\s*/, '');
    const event = JSON.parse(json) as ServerSentEvent;
    if (event.type !== 'meeting:starting') return;

    this.onAlert?.(event.payload);

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: 'Reunião começando',
        body: `${event.payload.title} — abrir no Teams e transcrever?`,
      });
      notification.on('click', () => {
        BrowserWindow.getAllWindows()[0]?.show();
        BrowserWindow.getAllWindows()[0]?.focus();
      });
    }
  }
}
