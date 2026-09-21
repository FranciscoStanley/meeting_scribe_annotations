import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

function parseCorsOrigins(raw: string | undefined): string | string[] {
  const value = raw ?? 'http://localhost:3000';
  if (value.includes(',')) {
    return value.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return value;
}

async function bootstrap() {
  const requireToken =
    process.env.SECURITY_REQUIRE_TOKEN === 'true' ||
    process.env.NODE_ENV === 'production';
  const apiToken = (process.env.API_ACCESS_TOKEN ?? '').trim();
  if (requireToken && !apiToken) {
    throw new Error(
      'API_ACCESS_TOKEN é obrigatório quando NODE_ENV=production ou SECURITY_REQUIRE_TOKEN=true',
    );
  }

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(
    helmet({
      contentSecurityPolicy: false, // Swagger UI; frontend aplica CSP próprio
      crossOriginEmbedderPolicy: false,
    }),
  );

  const maxJson = Number(process.env.MAX_JSON_BODY_BYTES ?? 1_000_000);
  app.use(json({ limit: maxJson }));
  app.use(urlencoded({ extended: true, limit: maxJson }));

  const corsOrigin = parseCorsOrigins(process.env.CORS_ORIGIN);
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('Meeting Scribe API')
    .setDescription(
      [
        'Transcrição em tempo real de reuniões Teams/Meet.',
        '',
        '**Segurança:** se `API_ACCESS_TOKEN` estiver definido, envie `Authorization: Bearer <token>` ou `X-API-Key`.',
        'Health e callbacks OAuth são públicos. Rate limit: `THROTTLE_LIMIT` / `THROTTLE_TTL_MS`.',
        '',
        '**Fluxo:** `POST /api/v1/meetings` → SSE `meeting:starting` → WebSocket `/transcription`.',
        '',
        '**WebSocket** `/transcription`: auth via `auth.token` no handshake; `audio:chunk` limitado por `MAX_AUDIO_CHUNK_BYTES`.',
        '',
        'Docs: `docs/security.md`, `docs/realtime.md`, Postman em `docs/postman/`.',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addApiKey(
      { type: 'apiKey', name: 'X-API-Key', in: 'header' },
      'api-key',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'API_ACCESS_TOKEN' },
      'bearer',
    )
    .addTag('meetings', 'Agendamento, lista e transcrições')
    .addTag('calendar', 'OAuth Google/Microsoft e feeds ICS')
    .addTag('events', 'SSE alertas meeting:starting')
    .addTag('health', 'Healthcheck (público)')
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
