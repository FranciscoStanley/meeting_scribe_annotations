import { Controller, Inject, MessageEvent, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  REALTIME_EVENTS_PORT,
  RealtimeEventsPort,
} from '../../domain/ports/realtime-events.port';
import { ServerSentEvent } from '@meeting-scribe/shared';

@ApiTags('events')
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@Controller('api/v1/events')
export class EventsController {
  constructor(
    @Inject(REALTIME_EVENTS_PORT)
    private readonly realtime: RealtimeEventsPort,
  ) {}

  @Sse('stream')
  @ApiOperation({
    summary: 'Stream SSE — alertas de reunião',
    description:
      'Eventos: `meeting:starting` (sessionId, title, platform, joinUrl, startsInMinutes), `heartbeat` a cada ~25s. Janela configurável via MEETING_ALERT_MINUTES e MEETING_ALERT_GRACE_MINUTES.',
  })
  stream(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const unsubscribe = this.realtime.subscribe((event: ServerSentEvent) => {
        subscriber.next({ data: event });
      });

      const heartbeat = setInterval(() => {
        subscriber.next({
          data: { type: 'heartbeat', payload: { at: new Date().toISOString() } },
        });
      }, 25_000);

      return () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
    });
  }
}
