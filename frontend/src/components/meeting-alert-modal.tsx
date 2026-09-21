'use client';

import Link from 'next/link';
import { isTeamsJoinUrl, toTeamsDesktopJoinUrl } from '@meeting-scribe/shared';

interface Props {
  title: string;
  platform: string;
  startsInMinutes: number;
  sessionId: string;
  joinUrl?: string;
  onDismiss: () => void;
}

export function MeetingAlertModal({
  title,
  platform,
  startsInMinutes,
  sessionId,
  joinUrl,
  onDismiss,
}: Props) {
  const timing =
    startsInMinutes <= 0
      ? 'A reunião está começando agora.'
      : `Começa em ${startsInMinutes} min.`;

  function participateAndTranscribe() {
    if (joinUrl) {
      const target =
        platform === 'TEAMS' && isTeamsJoinUrl(joinUrl)
          ? toTeamsDesktopJoinUrl(joinUrl)
          : joinUrl;
      window.open(target, '_blank', 'noopener,noreferrer');
    }
    onDismiss();
    window.location.href = `/sessions/${sessionId}/capture`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-[2px] sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-alert-title"
        className="w-full max-w-lg rounded-2xl border border-hairline bg-panel p-6 shadow-lift sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          Reunião detectada · {platform}
        </p>
        <h2
          id="meeting-alert-title"
          className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {timing} Deseja participar e iniciar a transcrição em tempo real?
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={participateAndTranscribe}
            className="ms-btn-primary"
          >
            Participar e transcrever
          </button>
          <Link
            href={`/sessions/${sessionId}/capture`}
            className="ms-btn-secondary"
            onClick={onDismiss}
          >
            Só transcrever
          </Link>
          {joinUrl ? (
            <a
              href={joinUrl}
              target="_blank"
              rel="noreferrer"
              className="ms-btn-secondary"
            >
              Só abrir reunião
            </a>
          ) : null}
          <button type="button" onClick={onDismiss} className="ms-btn-ghost">
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
