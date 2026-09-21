'use client';

import { useEffect, useState } from 'react';
import { MeetingAlertEvent, ServerSentEvent } from '@meeting-scribe/shared';
import { eventsStreamUrl } from '@/lib/api';

export function useMeetingAlerts(disabled = false) {
  const [alert, setAlert] = useState<MeetingAlertEvent['payload'] | null>(null);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    let source: EventSource | null = null;
    let cancelled = false;

    void (async () => {
      const url = await eventsStreamUrl();
      if (cancelled) return;
      source = new EventSource(url);
      source.onmessage = (message) => {
        const event = JSON.parse(message.data) as ServerSentEvent;
        if (event.type !== 'meeting:starting') return;

        setAlert(event.payload);

        if (
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          new Notification('Reunião começando', {
            body: `${event.payload.title} — deseja iniciar a transcrição?`,
            tag: event.payload.sessionId,
          });
        }
      };
    })();

    return () => {
      cancelled = true;
      source?.close();
    };
  }, [disabled]);

  return { alert, dismiss: () => setAlert(null) };
}
