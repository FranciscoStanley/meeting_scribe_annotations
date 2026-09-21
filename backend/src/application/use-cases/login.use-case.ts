import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tokensMatch } from '../../infrastructure/security/api-access.guard';

export type AuthMode = 'open' | 'credentials' | 'token';

export type LoginResult = {
  accessToken: string | null;
  email: string;
  mode: AuthMode;
};

export type AuthStatus = {
  openMode: boolean;
  credentialsConfigured: boolean;
  tokenConfigured: boolean;
};

@Injectable()
export class LoginUseCase {
  constructor(private readonly config: ConfigService) {}

  status(): AuthStatus {
    const authEmail = (this.config.get<string>('APP_AUTH_EMAIL') ?? '').trim();
    const authPassword = (
      this.config.get<string>('APP_AUTH_PASSWORD') ?? ''
    ).trim();
    const apiToken = (this.config.get<string>('API_ACCESS_TOKEN') ?? '').trim();
    const credentialsConfigured = Boolean(authEmail && authPassword);
    const tokenConfigured = Boolean(apiToken);
    return {
      openMode: !credentialsConfigured && !tokenConfigured,
      credentialsConfigured,
      tokenConfigured,
    };
  }

  execute(input: { email?: string; password: string }): LoginResult {
    const authEmail = (this.config.get<string>('APP_AUTH_EMAIL') ?? '').trim();
    const authPassword = (
      this.config.get<string>('APP_AUTH_PASSWORD') ?? ''
    ).trim();
    const apiToken = (this.config.get<string>('API_ACCESS_TOKEN') ?? '').trim();
    const email = (input.email ?? '').trim().toLowerCase();
    const password = input.password;

    if (authEmail && authPassword) {
      const emailOk = email && tokensMatch(email, authEmail.toLowerCase());
      const passOk = tokensMatch(password, authPassword);
      if (!emailOk || !passOk) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }
      return {
        accessToken: apiToken || null,
        email: authEmail,
        mode: 'credentials',
      };
    }

    if (apiToken) {
      if (!tokensMatch(password, apiToken)) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }
      return {
        accessToken: apiToken,
        email: email || 'operator',
        mode: 'token',
      };
    }

    // Modo aberto (dev local sem APP_AUTH_* e sem API_ACCESS_TOKEN)
    return {
      accessToken: null,
      email: email || 'local@meeting-scribe',
      mode: 'open',
    };
  }
}
