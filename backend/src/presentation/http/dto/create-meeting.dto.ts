import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingPlatform } from '@meeting-scribe/shared';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsDateString()
  scheduledStart!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiProperty({
    example: 'https://teams.microsoft.com/meet/237776367551390?p=xxx',
  })
  @IsUrl({ require_protocol: true })
  joinUrl!: string;

  @ApiPropertyOptional({ enum: ['TEAMS', 'MEET', 'ZOOM', 'OTHER'] })
  @IsOptional()
  @IsEnum(['TEAMS', 'MEET', 'ZOOM', 'OTHER'])
  platform?: MeetingPlatform;
}
