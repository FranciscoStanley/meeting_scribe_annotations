import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { TranscribeAudioChunkUseCase } from '../../application/use-cases/transcribe-audio-chunk.use-case';
import { StartTranscriptionSessionUseCase } from '../../application/use-cases/start-transcription-session.use-case';
import { CompleteTranscriptionSessionUseCase } from '../../application/use-cases/complete-transcription-session.use-case';
import {
  ApiAccessGuard,
  extractApiToken,
  tokensMatch,
} from '../../infrastructure/security/api-access.guard';

@WebSocketGateway({
  cors: { origin: true },
  namespace: '/transcription',
  maxHttpBufferSize: 3e6,
})
@UseGuards(ApiAccessGuard)
export class TranscriptionGateway implements OnGatewayConnection {
  private readonly logger = new Logger(TranscriptionGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly transcribeChunk: TranscribeAudioChunkUseCase,
    private readonly startSession: StartTranscriptionSessionUseCase,
    private readonly completeSession: CompleteTranscriptionSessionUseCase,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const expected = (this.config.get<string>('API_ACCESS_TOKEN') ?? '').trim();
    if (!expected) return;
    const provided = extractApiToken({ handshake: client.handshake });
    if (!provided || !tokensMatch(provided, expected)) {
      this.logger.warn(`WS rejeitado (auth): ${client.id}`);
      client.disconnect(true);
    }
  }

  private room(sessionId: string) {
    return `session:${sessionId}`;
  }

  private maxChunkBytes() {
    return Number(this.config.get('MAX_AUDIO_CHUNK_BYTES') ?? 2_000_000);
  }

  @SubscribeMessage('session:start')
  async onStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string },
  ) {
    if (!body?.sessionId || typeof body.sessionId !== 'string') {
      throw new WsException('sessionId inválido');
    }
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
    if (!body?.sessionId || typeof body.sessionId !== 'string') {
      throw new WsException('sessionId inválido');
    }
    await client.join(this.room(body.sessionId));
    return { ok: true };
  }

  @SubscribeMessage('session:complete')
  async onComplete(@MessageBody() body: { sessionId: string }) {
    if (!body?.sessionId || typeof body.sessionId !== 'string') {
      throw new WsException('sessionId inválido');
    }
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
      if (!body?.sessionId || typeof body.data !== 'string') {
        return { ok: false, error: 'invalid_payload' };
      }
      if (body.data.length > this.maxChunkBytes() * 1.4) {
        this.logger.warn(`Chunk base64 rejeitado (tamanho) sessão ${body.sessionId}`);
        return { ok: false, error: 'chunk_too_large' };
      }
      const buffer = Buffer.from(body.data, 'base64');
      if (buffer.length > this.maxChunkBytes()) {
        this.logger.warn(
          `Chunk rejeitado (${buffer.length} > ${this.maxChunkBytes()}) sessão ${body.sessionId}`,
        );
        return { ok: false, error: 'chunk_too_large' };
      }
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
