import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('Meeting Scribe API')
    .setDescription(
      [
        'Transcrição em tempo real de reuniões Teams/Meet.',
        '',
        '**Fluxo:** `POST /api/v1/meetings` (horário + joinUrl) → SSE `meeting:starting` → UI captura → WebSocket `/transcription`.',
        '',
        '**WebSocket** namespace `/transcription` (Socket.IO):',
        '- `session:start` / `session:subscribe` `{ sessionId }` — entra na room `session:{id}`',
        '- `audio:chunk` `{ sessionId, mimeType, data(base64) }` — STT local ou remoto',
        '- `transcript:segment` (server→client) — trecho salvo',
        '- `session:complete` `{ sessionId }`',
        '',
        'Docs extras: `docs/realtime.md`, Postman em `docs/postman/`.',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addTag('meetings', 'Agendamento, lista e transcrições')
    .addTag('calendar', 'OAuth Google/Microsoft e feeds ICS')
    .addTag('events', 'SSE alertas meeting:starting')
    .addTag('health', 'Healthcheck')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
