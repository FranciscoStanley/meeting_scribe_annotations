import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@ApiTags('calendar')
@Controller('api/v1/calendar')
export class CalendarOAuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('google/connect')
  @ApiOperation({ summary: 'Inicia OAuth Google Calendar' })
  connectGoogle(@Res() res: Response) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI');
    if (!clientId || !redirectUri) {
      return res.status(400).send('GOOGLE_CLIENT_ID/REDIRECT_URI não configurados');
    }
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly email');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    return res.redirect(url.toString());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI');
    if (!code || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).send('Callback inválido');
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const tokens = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };
    if (!tokens.access_token) {
      return res.status(400).send(tokens.error ?? 'Falha ao obter token Google');
    }

    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    const profile = (await profileRes.json()) as { email?: string };
    const email = profile.email ?? 'google-user';

    await this.prisma.calendarAccount.upsert({
      where: { provider_email: { provider: 'GOOGLE', email } },
      create: {
        provider: 'GOOGLE',
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      },
    });

    const webOrigin = this.config.get('CORS_ORIGIN') ?? 'http://localhost:3000';
    return res.redirect(`${webOrigin}/settings?connected=google`);
  }

  @Get('microsoft/connect')
  @ApiOperation({ summary: 'Inicia OAuth Microsoft Graph (Teams/Outlook)' })
  connectMicrosoft(@Res() res: Response) {
    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID');
    const redirectUri = this.config.get<string>('MICROSOFT_REDIRECT_URI');
    const tenant = this.config.get<string>('MICROSOFT_TENANT') ?? 'common';
    if (!clientId || !redirectUri) {
      return res
        .status(400)
        .send('MICROSOFT_CLIENT_ID/REDIRECT_URI não configurados');
    }
    const url = new URL(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    );
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'offline_access Calendars.Read User.Read');
    return res.redirect(url.toString());
  }

  @Get('microsoft/callback')
  async microsoftCallback(@Query('code') code: string, @Res() res: Response) {
    const clientId = this.config.get<string>('MICROSOFT_CLIENT_ID');
    const clientSecret = this.config.get<string>('MICROSOFT_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('MICROSOFT_REDIRECT_URI');
    const tenant = this.config.get<string>('MICROSOFT_TENANT') ?? 'common';
    if (!code || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).send('Callback inválido');
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'offline_access Calendars.Read User.Read',
    });

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    );
    const tokens = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };
    if (!tokens.access_token) {
      return res
        .status(400)
        .send(tokens.error ?? 'Falha ao obter token Microsoft');
    }

    const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileRes.json()) as {
      mail?: string;
      userPrincipalName?: string;
    };
    const email = profile.mail ?? profile.userPrincipalName ?? 'microsoft-user';

    await this.prisma.calendarAccount.upsert({
      where: { provider_email: { provider: 'MICROSOFT', email } },
      create: {
        provider: 'MICROSOFT',
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      },
    });

    const webOrigin = this.config.get('CORS_ORIGIN') ?? 'http://localhost:3000';
    return res.redirect(`${webOrigin}/settings?connected=microsoft`);
  }
}
