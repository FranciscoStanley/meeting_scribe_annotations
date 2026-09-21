import {
  MeetingPlatform,
  MeetingSessionStatus,
} from '@meeting-scribe/shared';
import { v4 as uuidv4 } from 'uuid';

export interface MeetingSessionProps {
  id: string;
  title: string;
  platform: MeetingPlatform;
  status: MeetingSessionStatus;
  scheduledStart: Date;
  scheduledEnd?: Date;
  joinUrl?: string;
  externalId?: string;
  startedAt?: Date;
  endedAt?: Date;
  alertSentAt?: Date;
}

export class MeetingSessionEntity {
  private constructor(private readonly props: MeetingSessionProps) {}

  static create(input: Omit<MeetingSessionProps, 'id' | 'status'> & { id?: string }): MeetingSessionEntity {
    return new MeetingSessionEntity({
      id: input.id ?? uuidv4(),
      status: 'SCHEDULED',
      ...input,
    });
  }

  static rehydrate(props: MeetingSessionProps): MeetingSessionEntity {
    return new MeetingSessionEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get platform(): MeetingPlatform {
    return this.props.platform;
  }

  get status(): MeetingSessionStatus {
    return this.props.status;
  }

  get scheduledStart(): Date {
    return this.props.scheduledStart;
  }

  get scheduledEnd(): Date | undefined {
    return this.props.scheduledEnd;
  }

  get joinUrl(): string | undefined {
    return this.props.joinUrl;
  }

  get externalId(): string | undefined {
    return this.props.externalId;
  }

  get startedAt(): Date | undefined {
    return this.props.startedAt;
  }

  get endedAt(): Date | undefined {
    return this.props.endedAt;
  }

  get alertSentAt(): Date | undefined {
    return this.props.alertSentAt;
  }

  toProps(): MeetingSessionProps {
    return { ...this.props };
  }

  shouldAlert(now: Date, leadMinutes: number, graceMinutes = 2): boolean {
    if (this.props.alertSentAt) return false;
    if (this.props.status === 'COMPLETED' || this.props.status === 'CANCELLED') {
      return false;
    }
    const diffMs = this.props.scheduledStart.getTime() - now.getTime();
    const diffMin = diffMs / 60_000;
    // Janela: de (início - lead) até (início + grace) — cobre atraso do cron
    return diffMin <= leadMinutes && diffMin >= -graceMinutes;
  }

  markAlertSent(at: Date): MeetingSessionEntity {
    return new MeetingSessionEntity({ ...this.props, alertSentAt: at, status: 'AWAITING_JOIN' });
  }

  startLive(at: Date): MeetingSessionEntity {
    return new MeetingSessionEntity({
      ...this.props,
      status: 'LIVE',
      startedAt: this.props.startedAt ?? at,
    });
  }

  complete(at: Date): MeetingSessionEntity {
    return new MeetingSessionEntity({
      ...this.props,
      status: 'COMPLETED',
      endedAt: at,
    });
  }
}
