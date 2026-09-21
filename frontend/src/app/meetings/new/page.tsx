'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewMeetingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const startLocal = String(form.get('scheduledStart'));
    const endLocal = String(form.get('scheduledEnd') || '');
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
      setError('Não foi possível agendar a reunião. Confira horário e link.');
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Agendar reunião</h1>
        <p className="mt-2 text-sm text-slate-400">
          Informe <strong>horário</strong> e <strong>link</strong> (Teams/Meet).
          Quando chegar a hora, o Meeting Scribe pede permissão para participar e
          transcrever — deixe esta aba aberta (ou o app desktop).
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6"
      >
        <label className="block text-sm">
          <span className="text-slate-300">Título</span>
          <input
            name="title"
            required
            placeholder="Ex.: Daily Sync"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-300">Início</span>
          <input
            name="scheduledStart"
            type="datetime-local"
            required
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-300">Fim (opcional)</span>
          <input
            name="scheduledEnd"
            type="datetime-local"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-300">Link Meet / Teams</span>
          <input
            name="joinUrl"
            type="url"
            required
            placeholder="https://teams.microsoft.com/meet/..."
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Agendar — avisar na hora
        </button>
      </form>
    </div>
  );
}
