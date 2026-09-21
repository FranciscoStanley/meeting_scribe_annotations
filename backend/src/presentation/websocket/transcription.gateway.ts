import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TranscribeAudioChunkUseCase } from '../../application/use-cases/transcribe-audio-chunk.use-case';
import { StartTranscriptionSessionUseCase } from '../../application/use-cases/start-transcription-session.use-case';
import { CompleteTranscriptionSessionUseCase } from '../../application/use-cases/complete-transcription-session.use-case';

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/transcription',
})
export class TranscriptionGateway {
  private readonly logger = new Logger(TranscriptionGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly transcribeChunk: TranscribeAudioChunkUseCase,
    private readonly startSession: StartTranscriptionSessionUseCase,
    private readonly completeSession: CompleteTranscriptionSessionUseCase,
  ) {}

  private room(sessionId: string) {
    return `session:${sessionId}`;
  }

  @SubscribeMessage('session:start')
  async onStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string },
  ) {
    await client.join(this.room(body.sessionId));
    await this.startSession.execute(body.sessionId);
    this.logger.log(`Cliente ${client.id} entrou em ${this.room(body.sessionId)}`);
    return { ok: true };
  }

  @SubscribeMessage('session:subscribe')
  async onSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string },
  ) {
    await client.join(this.room(body.sessionId));
    return { ok: true };
  }

  @SubscribeMessage('session:complete')
  async onComplete(@MessageBody() body: { sessionId: string }) {
    await this.completeSession.execute(body.sessionId);
    return { ok: true };
  }

  @SubscribeMessage('audio:chunk')
  async onAudioChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { sessionId: string; mimeType: string; data: string },
  ) {
    try {
      const buffer = Buffer.from(body.data, 'base64');
      this.logger.debug(
        `Chunk ${buffer.length} bytes (${body.mimeType}) sessão ${body.sessionId}`,
      );
      const segment = await this.transcribeChunk.execute(
        body.sessionId,
        buffer,
        body.mimeType ?? 'audio/webm',
      );
      if (segment) {
        const payload = {
          id: segment.id,
          speakerLabel: segment.speakerLabel,
          text: segment.text,
          startedAt: segment.startedAt.toISOString(),
          confidence: segment.confidence,
        };
        // Room: UI e capturador (mesmo ou sockets distintos) recebem o trecho
        this.server.to(this.room(body.sessionId)).emit('transcript:segment', payload);
        client.emit('transcript:segment', payload);
      }
      return { ok: true, transcribed: Boolean(segment) };
    } catch (error) {
      this.logger.error('Falha ao processar chunk de áudio', error);
      return { ok: false };
    }
  }
}
