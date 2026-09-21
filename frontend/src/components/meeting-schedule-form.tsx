'use client';

import { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import { differenceInMinutes } from 'date-fns';
import { DateTimeField } from '@/components/date-time-field';
import { AlertBanner } from '@/components/ui';
import { formatDateTimeDisplay } from '@/lib/datetime';

export type MeetingScheduleFormValues = {
  title: string;
  start: Date | null;
  end: Date | null;
  joinUrl: string;
};

type MeetingScheduleFormProps = {
  mode: 'create' | 'edit';
  values: MeetingScheduleFormValues;
  onChange: (patch: Partial<MeetingScheduleFormValues>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  error?: string | null;
  cancelHref?: string;
  footerExtra?: ReactNode;
};

function detectPlatformHint(url: string): string | null {
  const u = url.toLowerCase();
  if (u.includes('teams.microsoft') || u.includes('teams.live')) {
    return 'Microsoft Teams';
  }
  if (u.includes('meet.google')) return 'Google Meet';
  return null;
}

function durationLabel(start: Date | null, end: Date | null): string | null {
  if (!start || !end) return null;
  const mins = differenceInMinutes(end, start);
  if (mins <= 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function MeetingScheduleForm({
  mode,
  values,
  onChange,
  onSubmit,
  busy,
  error,
  cancelHref = '/',
}: MeetingScheduleFormProps) {
  const platform = detectPlatformHint(values.joinUrl);
  const duration = durationLabel(values.start, values.end);
  const submitLabel =
    mode === 'create'
      ? busy
        ? 'Agendando…'
        : 'Agendar — avisar na hora'
      : busy
        ? 'Salvando…'
        : 'Salvar alterações';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-hairline bg-panel shadow-soft">
        <div className="border-b border-hairline bg-gradient-to-br from-brand-mist/80 via-panel to-panel px-6 py-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {mode === 'create' ? 'Nova agenda' : 'Edição'}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">
            {values.title.trim() || 'Sem título'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {values.start
              ? formatDateTimeDisplay(values.start)
              : 'Defina o horário de início'}
            {duration ? (
              <span className="text-muted-soft"> · duração {duration}</span>
            ) : null}
          </p>
        </div>

        <div className="space-y-8 px-6 py-7 sm:px-8">
          <fieldset className="space-y-4">
            <legend className="font-display text-sm font-semibold text-ink">
              Identidade
            </legend>
            <label className="ms-label">
              Título da reunião
              <input
                value={values.title}
                onChange={(e) => onChange({ title: e.target.value })}
                required
                placeholder="Ex.: Daily Sync · Produto"
                className="ms-input"
                autoComplete="off"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-display text-sm font-semibold text-ink">
              Horário
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <DateTimeField
                label="Início"
                value={values.start}
                onChange={(start) => onChange({ start })}
                required
                minDate={new Date()}
              />
              <DateTimeField
                label="Fim"
                value={values.end}
                onChange={(end) => onChange({ end })}
                optionalHint
                minDate={values.start ?? new Date()}
              />
            </div>
            {duration ? (
              <p className="rounded-xl border border-brand/15 bg-brand-mist/50 px-3.5 py-2.5 text-sm text-brand-ink">
                Janela prevista: <strong>{duration}</strong>
                {!values.end
                  ? null
                  : ' — o sistema encerra a agenda após o fim efetivo.'}
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-muted">
                Sem fim informado, a agenda encerra automaticamente após a
                duração padrão configurada no servidor.
              </p>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-display text-sm font-semibold text-ink">
              Entrada na reunião
            </legend>
            <label className="ms-label">
              Link Meet / Teams
              <input
                type="url"
                value={values.joinUrl}
                onChange={(e) => onChange({ joinUrl: e.target.value })}
                required
                placeholder="https://meet.google.com/… ou teams.microsoft.com/…"
                className="ms-input font-mono text-[13px]"
                autoComplete="off"
              />
            </label>
            {platform ? (
              <p className="inline-flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
                <span
                  className="h-1.5 w-1.5 rounded-sm bg-brand"
                  aria-hidden
                />
                Detectado: {platform}
              </p>
            ) : values.joinUrl.trim() ? (
              <p className="text-xs text-muted">
                Use um link completo com https://
              </p>
            ) : null}
          </fieldset>

          {error ? <AlertBanner tone="danger">{error}</AlertBanner> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-hairline bg-surface/50 px-6 py-4 sm:px-8">
          <button
            type="submit"
            disabled={busy}
            className="ms-btn-primary min-w-[10rem]"
          >
            {submitLabel}
          </button>
          <Link href={cancelHref} className="ms-btn-secondary">
            Cancelar
          </Link>
        </div>
      </section>
    </form>
  );
}
