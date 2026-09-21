import { Injectable } from '@nestjs/common';
import {
  MeetingPlatform,
  MeetingSessionStatus,
} from '@meeting-scribe/shared';
import { MeetingSessionEntity } from '../../domain/entities/meeting-session.entity';
import { MeetingSessionRepositoryPort } from '../../domain/ports/meeting-session.repository.port';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaMeetingSessionRepository
  implements MeetingSessionRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async save(session: MeetingSessionEntity): Promise<MeetingSessionEntity> {
    const props = session.toProps();
    const row = await this.prisma.meetingSession.upsert({
      where: { id: props.id },
      create: {
        id: props.id,
        externalId: props.externalId,
        title: props.title,
        platform: props.platform,
        status: props.status,
        joinUrl: props.joinUrl,
        scheduledStart: props.scheduledStart,
        scheduledEnd: props.scheduledEnd,
        startedAt: props.startedAt,
        endedAt: props.endedAt,
        alertSentAt: props.alertSentAt ?? null,
      },
      update: {
        title: props.title,
        platform: props.platform,
        status: props.status,
        joinUrl: props.joinUrl,
        scheduledStart: props.scheduledStart,
        scheduledEnd: props.scheduledEnd ?? null,
        startedAt: props.startedAt ?? null,
        endedAt: props.endedAt ?? null,
        alertSentAt: props.alertSentAt ?? null,
      },
    });
    return this.map(row);
  }

  async findById(id: string): Promise<MeetingSessionEntity | null> {
    const row = await this.prisma.meetingSession.findUnique({ where: { id } });
    return row ? this.map(row) : null;
  }

  async findUpcoming(from: Date, to: Date): Promise<MeetingSessionEntity[]> {
    const rows = await this.prisma.meetingSession.findMany({
      where: {
        scheduledStart: { gte: from, lte: to },
        status: { in: ['SCHEDULED', 'AWAITING_JOIN'] },
      },
      orderBy: { scheduledStart: 'asc' },
    });
    return rows.map((row) => this.map(row));
  }

  async findAwaitingOrLive(): Promise<MeetingSessionEntity[]> {
    const rows = await this.prisma.meetingSession.findMany({
      where: { status: { in: ['AWAITING_JOIN', 'LIVE'] } },
      orderBy: { scheduledStart: 'asc' },
    });
    return rows.map((row) => this.map(row));
  }

  async listRecent(limit: number): Promise<MeetingSessionEntity[]> {
    const rows = await this.prisma.meetingSession.findMany({
      orderBy: { scheduledStart: 'desc' },
      take: limit,
    });
    return rows.map((row) => this.map(row));
  }

  async findByExternalId(
    externalId: string,
  ): Promise<MeetingSessionEntity | null> {
    const row = await this.prisma.meetingSession.findFirst({
      where: { externalId },
    });
    return row ? this.map(row) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.meetingSession.delete({ where: { id } });
  }

  private map(row: {
    id: string;
    externalId: string | null;
    title: string;
    platform: MeetingPlatform;
    status: MeetingSessionStatus;
    joinUrl: string | null;
    scheduledStart: Date;
    scheduledEnd: Date | null;
    startedAt: Date | null;
    endedAt: Date | null;
    alertSentAt: Date | null;
  }): MeetingSessionEntity {
    return MeetingSessionEntity.rehydrate({
      id: row.id,
      externalId: row.externalId ?? undefined,
      title: row.title,
      platform: row.platform,
      status: row.status,
      joinUrl: row.joinUrl ?? undefined,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd ?? undefined,
      startedAt: row.startedAt ?? undefined,
      endedAt: row.endedAt ?? undefined,
      alertSentAt: row.alertSentAt ?? undefined,
    });
  }
}
