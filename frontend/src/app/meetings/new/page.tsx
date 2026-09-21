'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AlertBanner, PageHeader, Panel } from '@/components/ui';

export default function NewMeetingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const startLocal = String(form.get('scheduledStart'));
    const endLocal = String(form.get('scheduledEnd') || '');
    if (endLocal && new Date(endLocal).getTime() <= new Date(startLocal).getTime()) {
      setError('A data/hora de fim deve ser posterior ao início.');
      return;
    }
    try {
      await api.createMeeting({
        title: String(form.get('title')),
        scheduledStart: new Date(startLocal).toISOString(),
        scheduledEnd: endLocal
          ? new Date(endLocal).toISOString()
          : undefined,
        joinUrl: String(form.get('joinUrl')),
      });
      router.push('/?agendada=1');
    } catch {
      setError('Não foi possível agendar. Confira horário e link (com https://).');
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Agendar reunião"
        description="Informe horário e link (Teams ou Meet). Deixe a aba aberta: na hora pedimos permissão para participar e transcrever."
      />

      <Panel className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <label className="ms-label">
            Título
            <input
              name="title"
              required
              placeholder="Ex.: Daily Sync"
              className="ms-input"
            />
          </label>
          <label className="ms-label">
            Início
            <input
              name="scheduledStart"
              type="datetime-local"
              required
              className="ms-input"
            />
          </label>
          <label className="ms-label">
            Fim <span className="font-normal text-muted">(opcional)</span>
            <input
              name="scheduledEnd"
              type="datetime-local"
              className="ms-input"
            />
          </label>
          <label className="ms-label">
            Link Meet / Teams
            <input
              name="joinUrl"
              type="url"
              required
              placeholder="https://meet.google.com/…"
              className="ms-input"
            />
          </label>
          {error ? <AlertBanner tone="danger">{error}</AlertBanner> : null}
          <button type="submit" className="ms-btn-primary w-full sm:w-auto">
            Agendar — avisar na hora
          </button>
        </form>
      </Panel>
    </div>
  );
}
