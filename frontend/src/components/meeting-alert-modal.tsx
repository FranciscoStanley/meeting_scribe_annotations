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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-wide text-accent-soft">
          Reunião detectada · {platform}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-300">
          {timing} Deseja participar e iniciar a transcrição em tempo real?
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={participateAndTranscribe}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft"
          >
            Participar e transcrever
          </button>
          <Link
            href={`/sessions/${sessionId}/capture`}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
            onClick={onDismiss}
          >
            Só transcrever
          </Link>
          {joinUrl ? (
            <a
              href={joinUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
            >
              Só abrir reunião
            </a>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
