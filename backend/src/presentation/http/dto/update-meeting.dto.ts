import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingPlatform } from '@meeting-scribe/shared';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateMeetingDto {
  @ApiProperty({ example: 'Daily Sync' })
  @IsString()
  title!: string;

  @ApiProperty({ example: '2026-09-22T18:00:00.000Z' })
  @IsDateString()
  scheduledStart!: string;

  @ApiPropertyOptional({ example: '2026-09-22T18:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiProperty({
    example: 'https://meet.google.com/rdg-sxjm-eux',
    description: 'Link Meet/Teams obrigatório',
  })
  @IsUrl({ require_protocol: true })
  joinUrl!: string;

  @ApiPropertyOptional({ enum: ['TEAMS', 'MEET', 'ZOOM', 'OTHER'] })
  @IsOptional()
  @IsEnum(['TEAMS', 'MEET', 'ZOOM', 'OTHER'])
  platform?: MeetingPlatform;
}
