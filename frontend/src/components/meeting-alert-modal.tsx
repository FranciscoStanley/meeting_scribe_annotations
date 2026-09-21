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
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-wide text-accent-soft">
          Reunião detectada · {platform}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-300">
          Começa em {startsInMinutes} min. Deseja participar com transcrição em
          tempo real?
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/sessions/${sessionId}/capture`}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft"
            onClick={onDismiss}
          >
            Iniciar transcrição
          </Link>
          {joinUrl ? (
            <>
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
              >
                Abrir no navegador
              </a>
              {platform === 'TEAMS' && isTeamsJoinUrl(joinUrl) ? (
                <a
                  href={toTeamsDesktopJoinUrl(joinUrl)}
                  className="rounded-xl border border-accent/40 px-4 py-2 text-sm text-accent-soft hover:bg-accent/10"
                >
                  Abrir no Teams (desktop)
                </a>
              ) : null}
            </>
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
