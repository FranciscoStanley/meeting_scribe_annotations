import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../infrastructure/security/api-access.guard';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Get('status')
  @ApiOperation({
    summary: 'Status do login da UI',
    description:
      'Indica se o ambiente está aberto (local) ou exige e-mail/senha ou chave de API.',
  })
  @ApiOkResponse({ description: 'Configuração de autenticação (sem segredos)' })
  status() {
    return this.loginUseCase.status();
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({
    summary: 'Login do operador',
    description:
      'Valida APP_AUTH_EMAIL/APP_AUTH_PASSWORD ou, se só houver API_ACCESS_TOKEN, a senha = token. Em modo aberto (local) aceita qualquer entrada e não devolve token.',
  })
  @ApiOkResponse({ description: '{ accessToken, email, mode }' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  login(@Body() body: LoginDto) {
    return this.loginUseCase.execute({
      email: body.email,
      password: body.password,
    });
  }
}
