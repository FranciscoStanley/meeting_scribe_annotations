import { Injectable } from '@nestjs/common';
import { ServerSentEvent } from '@meeting-scribe/shared';
import { RealtimeEventsPort } from '../../domain/ports/realtime-events.port';

@Injectable()
export class InMemoryRealtimeEventsAdapter implements RealtimeEventsPort {
  private readonly listeners = new Set<(event: ServerSentEvent) => void>();

  publish(event: ServerSentEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  subscribe(listener: (event: ServerSentEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
