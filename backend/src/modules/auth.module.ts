import { Module } from '@nestjs/common';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { AuthController } from '../presentation/http/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [LoginUseCase],
})
export class AuthModule {}
