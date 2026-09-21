import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

class CreateCalendarFeedDto {
  @ApiProperty({
    example:
      'https://calendar.google.com/calendar/ical/exemplo/private-xxx/basic.ics',
  })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ example: 'Trabalho' })
  @IsOptional()
  @IsString()
  label?: string;
}

@ApiTags('calendar')
@Controller('api/v1/calendar/feeds')
export class CalendarFeedsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Lista feeds ICS (sem OAuth)' })
  @ApiOkResponse({ description: 'Lista de CalendarFeed' })
  list() {
    return this.prisma.calendarFeed.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  @ApiOperation({
    summary: 'Adiciona feed ICS público/secreto do Google/Outlook',
  })
  @ApiOkResponse({ description: 'Feed criado ou atualizado' })
  create(@Body() dto: CreateCalendarFeedDto) {
    return this.prisma.calendarFeed.upsert({
      where: { url: dto.url },
      create: { url: dto.url, label: dto.label },
      update: { label: dto.label, enabled: true },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove feed ICS' })
  @ApiOkResponse({ description: '{ ok: true }' })
  async remove(@Param('id') id: string) {
    await this.prisma.calendarFeed.delete({ where: { id } });
    return { ok: true };
  }
}
