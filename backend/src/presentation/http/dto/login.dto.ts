import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'admin@empresa.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiProperty({
    description:
      'Senha do operador (APP_AUTH_PASSWORD) ou, se só houver API_ACCESS_TOKEN, a própria chave de API.',
    example: '********',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  password!: string;
}
