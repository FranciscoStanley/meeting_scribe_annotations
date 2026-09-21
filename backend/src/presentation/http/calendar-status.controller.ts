import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@ApiTags('calendar')
@Controller('api/v1/calendar')
export class CalendarStatusController {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary:
      'Status OAuth (Google/Microsoft configurados?) e contas já autorizadas',
  })
  @ApiOkResponse({
    description:
      'Indica se Client ID está no .env e lista e-mails conectados (sem tokens)',
  })
  async status() {
    const googleConfigured = Boolean(
      this.config.get<string>('GOOGLE_CLIENT_ID')?.trim() &&
        this.config.get<string>('GOOGLE_CLIENT_SECRET')?.trim(),
    );
    const microsoftConfigured = Boolean(
      this.config.get<string>('MICROSOFT_CLIENT_ID')?.trim() &&
        this.config.get<string>('MICROSOFT_CLIENT_SECRET')?.trim(),
    );

    const accounts = await this.prisma.calendarAccount.findMany({
      select: {
        id: true,
        provider: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      googleConfigured,
      microsoftConfigured,
      accounts: accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        email: a.email,
        connectedAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      setupGuideUrl: '/settings#oauth-setup',
    };
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: 'Desconecta conta Google/Microsoft autorizada' })
  async disconnect(@Param('id') id: string) {
    const existing = await this.prisma.calendarAccount.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Conta não encontrada');
    }
    await this.prisma.calendarAccount.delete({ where: { id } });
    return { ok: true };
  }
}
