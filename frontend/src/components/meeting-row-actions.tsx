'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { meetingCanModify, MeetingSessionStatus } from '@meeting-scribe/shared';
import { api } from '@/lib/api';

function IconEdit({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5l3 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrash({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconOpen({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M14 5h5v5M19 5l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MeetingRowActions({
  id,
  status,
}: {
  id: string;
  status: MeetingSessionStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const canModify = meetingCanModify(status);
  const openPrimary = status === 'LIVE' || status === 'COMPLETED';

  async function onDelete() {
    if (
      !window.confirm(
        'Excluir esta agenda? Esta ação não pode ser desfeita.',
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await api.deleteMeeting(id);
      router.refresh();
    } catch {
      window.alert(
        'Não foi possível excluir. Apenas agendas que ainda não iniciaram podem ser removidas.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="inline-flex flex-wrap items-center justify-end gap-1.5"
      role="group"
      aria-label="Ações da reunião"
    >
      {canModify ? (
        <>
          <Link
            href={`/meetings/${id}/edit`}
            className="ms-btn ms-btn-sm ms-btn-secondary"
          >
            <IconEdit />
            Editar
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="ms-btn ms-btn-sm ms-btn-danger-ghost"
            aria-label="Excluir agenda"
          >
            <IconTrash />
            Excluir
          </button>
        </>
      ) : null}
      <Link
        href={`/meetings/${id}`}
        className={
          openPrimary
            ? 'ms-btn ms-btn-sm ms-btn-primary'
            : 'ms-btn ms-btn-sm ms-btn-secondary'
        }
      >
        <IconOpen />
        Abrir
      </Link>
    </div>
  );
}
