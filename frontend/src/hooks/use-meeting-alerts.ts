'use client';

import { useEffect, useState } from 'react';
import { MeetingAlertEvent, ServerSentEvent } from '@meeting-scribe/shared';
import { eventsStreamUrl } from '@/lib/api';

export function useMeetingAlerts() {
  const [alert, setAlert] = useState<MeetingAlertEvent['payload'] | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    const source = new EventSource(eventsStreamUrl());

    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as ServerSentEvent;
      if (event.type !== 'meeting:starting') return;

      setAlert(event.payload);

      if (Notification.permission === 'granted') {
        new Notification('Reunião começando', {
          body: `${event.payload.title} — deseja iniciar a transcrição?`,
          tag: event.payload.sessionId,
        });
      }
    };

    return () => source.close();
  }, []);

  return { alert, dismiss: () => setAlert(null) };
}
