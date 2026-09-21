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

  /**
   * Fim efetivo: scheduledEnd ou início + duração padrão (minutos).
   * Usado para encerrar agendas cujo horário já passou.
   */
  effectiveEnd(defaultDurationMinutes = 60): Date {
    if (this.props.scheduledEnd) return this.props.scheduledEnd;
    return new Date(
      this.props.scheduledStart.getTime() + defaultDurationMinutes * 60_000,
    );
  }

  /**
   * Encerrar quando início e fim efetivo já passaram
   * (e a sessão ainda não está COMPLETED/CANCELLED).
   */
  shouldAutoComplete(now: Date, defaultDurationMinutes = 60): boolean {
    if (
      this.props.status === 'COMPLETED' ||
      this.props.status === 'CANCELLED'
    ) {
      return false;
    }
    if (now.getTime() < this.props.scheduledStart.getTime()) {
      return false;
    }
    return now.getTime() >= this.effectiveEnd(defaultDurationMinutes).getTime();
  }

  /** Agendas que ainda não iniciaram captura: SCHEDULED ou AWAITING_JOIN */
  canModify(): boolean {
    return (
      this.props.status === 'SCHEDULED' || this.props.status === 'AWAITING_JOIN'
    );
  }

  updateSchedule(input: {
    title: string;
    scheduledStart: Date;
    scheduledEnd?: Date;
    joinUrl: string;
    platform: MeetingPlatform;
  }): MeetingSessionEntity {
    if (!this.canModify()) {
      throw new Error(
        'Só é possível editar agendas que ainda não iniciaram (não LIVE/COMPLETED).',
      );
    }
    return new MeetingSessionEntity({
      ...this.props,
      title: input.title,
      scheduledStart: input.scheduledStart,
      scheduledEnd: input.scheduledEnd,
      joinUrl: input.joinUrl,
      platform: input.platform,
      // Reagenda: volta a SCHEDULED e limpa alerta para avisar de novo
      status: 'SCHEDULED',
      alertSentAt: undefined,
    });
  }
}
