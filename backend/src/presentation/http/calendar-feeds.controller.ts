import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

class CreateCalendarFeedDto {
  @ApiProperty({ example: 'https://calendar.google.com/calendar/ical/.../basic.ics' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional()
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
  list() {
    return this.prisma.calendarFeed.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post()
  @ApiOperation({ summary: 'Adiciona feed ICS público/secreto do Google/Outlook' })
  create(@Body() dto: CreateCalendarFeedDto) {
    return this.prisma.calendarFeed.upsert({
      where: { url: dto.url },
      create: { url: dto.url, label: dto.label },
      update: { label: dto.label, enabled: true },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove feed ICS' })
  async remove(@Param('id') id: string) {
    await this.prisma.calendarFeed.delete({ where: { id } });
    return { ok: true };
  }
}
