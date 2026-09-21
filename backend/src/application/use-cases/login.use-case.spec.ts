import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.use-case';

function mockConfig(map: Record<string, string | undefined>): ConfigService {
  return {
    get: vi.fn((key: string) => map[key]),
  } as unknown as ConfigService;
}

describe('LoginUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('modo aberto quando não há APP_AUTH nem API token', () => {
    const useCase = new LoginUseCase(mockConfig({}));
    expect(useCase.status()).toEqual({
      openMode: true,
      credentialsConfigured: false,
      tokenConfigured: false,
    });
    const result = useCase.execute({
      email: 'demo@corp.com',
      password: 'qualquer',
    });
    expect(result.mode).toBe('open');
    expect(result.accessToken).toBeNull();
    expect(result.email).toBe('demo@corp.com');
  });

  it('valida e-mail e senha quando APP_AUTH_* está configurado', () => {
    const useCase = new LoginUseCase(
      mockConfig({
        APP_AUTH_EMAIL: 'Admin@Empresa.com',
        APP_AUTH_PASSWORD: 's3nha-forte',
        API_ACCESS_TOKEN: 'api-token-xyz',
      }),
    );
    expect(useCase.status().credentialsConfigured).toBe(true);
    const ok = useCase.execute({
      email: 'admin@empresa.com',
      password: 's3nha-forte',
    });
    expect(ok).toEqual({
      accessToken: 'api-token-xyz',
      email: 'Admin@Empresa.com',
      mode: 'credentials',
    });
    expect(() =>
      useCase.execute({ email: 'admin@empresa.com', password: 'errada' }),
    ).toThrow(UnauthorizedException);
  });

  it('aceita senha = API_ACCESS_TOKEN quando não há APP_AUTH', () => {
    const useCase = new LoginUseCase(
      mockConfig({ API_ACCESS_TOKEN: 'chave-api' }),
    );
    expect(useCase.status()).toMatchObject({
      openMode: false,
      tokenConfigured: true,
    });
    const ok = useCase.execute({ password: 'chave-api' });
    expect(ok.mode).toBe('token');
    expect(ok.accessToken).toBe('chave-api');
    expect(() => useCase.execute({ password: 'outra' })).toThrow(
      UnauthorizedException,
    );
  });
});
