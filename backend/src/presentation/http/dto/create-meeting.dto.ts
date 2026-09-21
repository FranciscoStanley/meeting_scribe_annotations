import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingPlatform } from '@meeting-scribe/shared';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Daily Sync', description: 'Título exibido no dashboard e no alerta' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: '2026-09-22T18:00:00.000Z',
    description: 'Início (ISO-8601). O alerta SSE dispara na janela lead/grace.',
  })
  @IsDateString()
  scheduledStart!: string;

  @ApiPropertyOptional({ example: '2026-09-22T18:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiProperty({
    example: 'https://meet.google.com/rdg-sxjm-eux',
    description:
      'Link Meet/Teams obrigatório no agendamento manual. Usado no modal Participar e transcrever.',
  })
  @IsUrl({ require_protocol: true })
  joinUrl!: string;

  @ApiPropertyOptional({
    enum: ['TEAMS', 'MEET', 'ZOOM', 'OTHER'],
    description: 'Se omitido, o backend tenta detectar pelo joinUrl',
  })
  @IsOptional()
  @IsEnum(['TEAMS', 'MEET', 'ZOOM', 'OTHER'])
  platform?: MeetingPlatform;
}
