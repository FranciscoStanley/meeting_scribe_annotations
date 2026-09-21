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
    try {
      const created = (await api.createMeeting({
        title: String(form.get('title')),
        scheduledStart: new Date(String(form.get('scheduledStart'))).toISOString(),
        joinUrl: String(form.get('joinUrl') || '') || undefined,
      })) as { id: string };
      router.push(`/sessions/${created.id}/capture`);
    } catch {
      setError('Não foi possível criar a reunião.');
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold text-white">Nova reunião</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
        <label className="block text-sm">
          <span className="text-slate-300">Título</span>
          <input
            name="title"
            required
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
          <span className="text-slate-300">Link Meet/Teams (opcional)</span>
          <input
            name="joinUrl"
            type="url"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Criar e preparar captura
        </button>
      </form>
    </div>
  );
}
