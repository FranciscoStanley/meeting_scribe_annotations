'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { meetingCanModify, MeetingSessionStatus } from '@meeting-scribe/shared';
import { api } from '@/lib/api';

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

  if (!canModify) {
    return (
      <Link
        href={`/meetings/${id}`}
        className="font-semibold text-brand hover:text-brand-ink hover:underline"
      >
        Visualizar
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Link
        href={`/meetings/${id}/edit`}
        className="font-semibold text-brand hover:text-brand-ink hover:underline"
      >
        Editar
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="font-semibold text-danger hover:underline disabled:opacity-50"
      >
        Excluir
      </button>
      <Link
        href={`/meetings/${id}`}
        className="text-muted hover:text-ink hover:underline"
      >
        Ver
      </Link>
    </div>
  );
}
