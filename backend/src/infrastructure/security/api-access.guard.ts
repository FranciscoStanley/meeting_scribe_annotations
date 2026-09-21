import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'crypto';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function tokensMatch(provided: string, expected: string): boolean {
  return safeEqual(provided, expected);
}

export function extractApiToken(request: {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
  handshake?: {
    auth?: Record<string, unknown>;
    headers?: Record<string, string | string[] | undefined>;
    query?: Record<string, unknown>;
  };
}): string | undefined {
  const headers = request.headers ?? request.handshake?.headers ?? {};
  const auth = headers.authorization ?? headers.Authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  const apiKey = headers['x-api-key'] ?? headers['X-API-Key'];
  if (typeof apiKey === 'string' && apiKey.trim()) return apiKey.trim();

  const query = request.query ?? request.handshake?.query ?? {};
  if (typeof query.apiKey === 'string') return query.apiKey;
  if (typeof query.token === 'string') return query.token;

  const hsAuth = request.handshake?.auth;
  if (hsAuth && typeof hsAuth.token === 'string') return hsAuth.token;
  if (hsAuth && typeof hsAuth.apiKey === 'string') return hsAuth.apiKey;

  return undefined;
}

@Injectable()
export class ApiAccessGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const expected = (this.config.get<string>('API_ACCESS_TOKEN') ?? '').trim();
    // Sem token configurado: modo aberto (dev local). Em produção configure API_ACCESS_TOKEN.
    if (!expected) return true;

    const type = context.getType<'http' | 'ws' | 'rpc'>();
    let provided: string | undefined;

    if (type === 'ws') {
      const client = context.switchToWs().getClient();
      provided = extractApiToken({
        handshake: client?.handshake,
      });
    } else {
      const request = context.switchToHttp().getRequest();
      provided = extractApiToken(request);
    }

    if (!provided || !tokensMatch(provided, expected)) {
      throw new UnauthorizedException(
        'Token de API inválido ou ausente. Envie Authorization: Bearer <API_ACCESS_TOKEN> ou X-API-Key.',
      );
    }
    return true;
  }
}
