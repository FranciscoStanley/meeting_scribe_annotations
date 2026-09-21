'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calendarConnectUrl, api } from '@/lib/api';

export default function SettingsPage() {
  const params = useSearchParams();
  const connected = params.get('connected');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<
    Array<{ id: string; url: string; label: string | null }>
  >([]);
  const [feedError, setFeedError] = useState<string | null>(null);

  async function refreshFeeds() {
    try {
      setFeeds(await api.listCalendarFeeds());
    } catch {
      setFeeds([]);
    }
  }

  useEffect(() => {
    void refreshFeeds();
  }, []);

  async function syncNow() {
    try {
      const result = await api.syncCalendar();
      setSyncMessage(`${result.synced} reunião(ões) sincronizada(s).`);
    } catch {
      setSyncMessage('Falha ao sincronizar calendário.');
    }
  }

  async function onAddFeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedError(null);
    const form = new FormData(event.currentTarget);
    try {
      await api.addCalendarFeed({
        url: String(form.get('url')),
        label: String(form.get('label') || '') || undefined,
      });
      event.currentTarget.reset();
      await refreshFeeds();
      await syncNow();
    } catch {
      setFeedError(
        'Não foi possível salvar o feed. Use a URL secreta ICS do Google/Outlook.',
      );
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Calendários</h1>
        <p className="mt-2 text-slate-400">
          Sem OAuth: cole o link ICS secreto do Google Calendar ou Outlook. O
          sistema detecta Meet/Teams e avisa antes da reunião.
        </p>
      </div>

      <form
        onSubmit={onAddFeed}
        className="space-y-3 rounded-2xl border border-accent/30 bg-ink-900 p-5"
      >
        <h2 className="font-medium text-white">Feed ICS (recomendado)</h2>
        <p className="text-sm text-slate-400">
          Google Calendar → Configurações do calendário → Integrar calendário →
          “Endereço secreto no formato iCal”. Outlook: exportar ICS / link de
          assinatura.
        </p>
        <label className="block text-sm">
          <span className="text-slate-300">URL ICS</span>
          <input
            name="url"
            type="url"
            required
            placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-300">Nome (opcional)</span>
          <input
            name="label"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2"
          />
        </label>
        {feedError ? <p className="text-sm text-red-300">{feedError}</p> : null}
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Salvar e sincronizar
        </button>
      </form>

      {feeds.length ? (
        <ul className="space-y-2">
          {feeds.map((feed) => (
            <li
              key={feed.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-white">
                  {feed.label || 'Calendário ICS'}
                </p>
                <p className="truncate text-xs text-slate-500">{feed.url}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-red-300 hover:underline"
                onClick={async () => {
                  await api.removeCalendarFeed(feed.id);
                  await refreshFeeds();
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {connected ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Conta {connected} conectada com sucesso.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={calendarConnectUrl('google')}
          className="rounded-2xl border border-white/10 bg-ink-900 p-5 hover:border-accent/40"
        >
          <h2 className="font-medium text-white">Google OAuth (opcional)</h2>
          <p className="mt-2 text-sm text-slate-400">
            Só se você já tiver GOOGLE_CLIENT_ID no .env.
          </p>
        </a>
        <a
          href={calendarConnectUrl('microsoft')}
          className="rounded-2xl border border-white/10 bg-ink-900 p-5 hover:border-accent/40"
        >
          <h2 className="font-medium text-white">Microsoft OAuth (opcional)</h2>
          <p className="mt-2 text-sm text-slate-400">
            Só se você já tiver MICROSOFT_CLIENT_ID no .env.
          </p>
        </a>
      </div>

      <div className="rounded-2xl border border-white/10 bg-ink-900 p-5">
        <h2 className="font-medium text-white">Teams — app desktop</h2>
        <p className="mt-2 text-sm text-slate-400">
          Para reuniões no app Teams (fora do navegador):{' '}
          <code className="text-accent-soft">npm run dev:desktop</code>
        </p>
      </div>

      <button
        type="button"
        onClick={syncNow}
        className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
      >
        Sincronizar agora
      </button>
      {syncMessage ? (
        <p className="text-sm text-slate-300">{syncMessage}</p>
      ) : null}
    </div>
  );
}
