import { ServerSentEvent } from '@meeting-scribe/shared';

export const REALTIME_EVENTS_PORT = Symbol('REALTIME_EVENTS_PORT');

export interface RealtimeEventsPort {
  publish(event: ServerSentEvent): void;
  subscribe(listener: (event: ServerSentEvent) => void): () => void;
}
