import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PersistenceModule } from './modules/persistence.module';
import { MeetingsModule } from './modules/meetings.module';
import { CalendarModule } from './modules/calendar.module';
import { TranscriptionModule } from './modules/transcription.module';
import { RealtimeModule } from './modules/realtime.module';
import { HealthController } from './presentation/http/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PersistenceModule,
    MeetingsModule,
    CalendarModule,
    TranscriptionModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
