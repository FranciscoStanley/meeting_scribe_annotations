import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiAccessGuard } from '../infrastructure/security/api-access.guard';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: Number(config.get('THROTTLE_TTL_MS') ?? 60_000),
          limit: Number(config.get('THROTTLE_LIMIT') ?? 120),
        },
      ],
    }),
  ],
  providers: [
    ApiAccessGuard,
    { provide: APP_GUARD, useClass: ApiAccessGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [ApiAccessGuard],
})
export class SecurityModule {}
