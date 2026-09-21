'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calendarConnectUrl, api } from '@/lib/api';

type CalendarAccount = {
  id: string;
  provider: string;
  email: string;
};

type CalendarStatus = {
  googleConfigured: boolean;
  microsoftConfigured: boolean;
  accounts: CalendarAccount[];
};

const OAUTH_ERRORS: Record<string, string> = {
  google_not_configured:
    'Google ainda não está configurado no .env. Siga o guia gratuito abaixo (Client ID + Secret) e reinicie o backend.',
  microsoft_not_configured:
    'Microsoft ainda não está configurada no .env. Siga o guia gratuito abaixo e reinicie o backend.',
  google_callback: 'Falha no retorno do Google. Tente conectar de novo.',
  microsoft_callback: 'Falha no retorno da Microsoft. Tente conectar de novo.',
  google_token: 'Google não devolveu o token. Confira Client Secret e URI de redirecionamento.',
  microsoft_token:
    'Microsoft não devolveu o token. Confira Client Secret, URI e se contas pessoais estão habilitadas.',
};

export default function SettingsPage() {
  const params = useSearchParams();
  const connected = params.get('connected');
  const syncedParam = params.get('synced');
  const oauthError = params.get('oauth_error');

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [feeds, setFeeds] = useState<
    Array<{ id: string; url: string; label: string | null }>
  >([]);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [showIcs, setShowIcs] = useState(false);

  async function refresh() {
    try {
      const [feedsData, statusData] = await Promise.all([
        api.listCalendarFeeds(),
        api.calendarStatus(),
      ]);
      setFeeds(feedsData);
      setStatus(statusData);
    } catch {
      setFeeds([]);
      setStatus(null);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (connected && syncedParam !== null) {
      setSyncMessage(
        `Conta ${connected} conectada. ${syncedParam} reunião(ões) sincronizada(s) automaticamente.`,
      );
    }
  }, [connected, syncedParam]);

  async function syncNow() {
    try {
      const result = await api.syncCalendar();
      setSyncMessage(`${result.synced} reunião(ões) sincronizada(s).`);
      await refresh();
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
      await refresh();
      await syncNow();
    } catch {
      setFeedError(
        'Não foi possível salvar o feed. Use a URL secreta ICS do Google/Outlook.',
      );
    }
  }

  const googleAccounts =
    status?.accounts.filter((a) => a.provider === 'GOOGLE') ?? [];
  const microsoftAccounts =
    status?.accounts.filter((a) => a.provider === 'MICROSOFT') ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Calendários</h1>
        <p className="mt-2 text-slate-400">
          Conecte Gmail/Google Calendar ou Outlook/Teams uma vez. Você aceita as
          permissões na tela oficial (igual aos apps do mercado) e o Meeting
          Scribe passa a detectar reuniões Meet/Teams sozinho — 100% gratuito
          (cota pessoal das APIs).
        </p>
      </div>

      {oauthError ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {OAUTH_ERRORS[oauthError] ?? 'Erro ao conectar calendário.'}
        </p>
      ) : null}

      {connected ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Conta {connected} autorizada com sucesso.
          {syncedParam !== null
            ? ` Sync inicial: ${syncedParam} reunião(ões).`
            : null}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">
          Conectar com um clique (recomendado)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-accent/35 bg-ink-900 p-5">
            <h3 className="font-medium text-white">Google Calendar / Gmail</h3>
            <p className="mt-2 text-sm text-slate-400">
              Detecta links do Meet e eventos da agenda Google.
            </p>
            {googleAccounts.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {googleAccounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-ink-950/80 px-3 py-2"
                  >
                    <span className="truncate text-emerald-200">{a.email}</span>
                    <button
                      type="button"
                      className="shrink-0 text-red-300 hover:underline"
                      onClick={async () => {
                        await api.disconnectCalendarAccount(a.id);
                        await refresh();
                      }}
                    >
                      Desconectar
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {status?.googleConfigured ? (
              <a
                href={calendarConnectUrl('google')}
                className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft"
              >
                {googleAccounts.length
                  ? 'Conectar outra conta Google'
                  : 'Conectar Google'}
              </a>
            ) : (
              <p className="mt-4 text-sm text-amber-200/90">
                Configure o OAuth gratuito uma vez (guia abaixo) e este botão
                passa a abrir a tela de permissões do Google.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-accent/35 bg-ink-900 p-5">
            <h3 className="font-medium text-white">Outlook / Microsoft Teams</h3>
            <p className="mt-2 text-sm text-slate-400">
              Lê a agenda do Outlook e reuniões Teams (conta Microsoft pessoal
              ou trabalho).
            </p>
            {microsoftAccounts.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {microsoftAccounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-ink-950/80 px-3 py-2"
                  >
                    <span className="truncate text-emerald-200">{a.email}</span>
                    <button
                      type="button"
                      className="shrink-0 text-red-300 hover:underline"
                      onClick={async () => {
                        await api.disconnectCalendarAccount(a.id);
                        await refresh();
                      }}
                    >
                      Desconectar
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {status?.microsoftConfigured ? (
              <a
                href={calendarConnectUrl('microsoft')}
                className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-soft"
              >
                {microsoftAccounts.length
                  ? 'Conectar outra conta Microsoft'
                  : 'Conectar Outlook / Teams'}
              </a>
            ) : (
              <p className="mt-4 text-sm text-amber-200/90">
                Configure o registro Azure gratuito uma vez (guia abaixo) e o
                botão libera a tela de permissões da Microsoft.
              </p>
            )}
          </div>
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
      </section>

      <section
        id="oauth-setup"
        className="space-y-3 rounded-2xl border border-white/10 bg-ink-900 p-5"
      >
        <h2 className="font-medium text-white">
          Setup gratuito (só uma vez, ~10 min)
        </h2>
        <p className="text-sm text-slate-400">
          Google e Microsoft exigem que <strong>este app self-hosted</strong>{' '}
          tenha um Client ID gratuito no console deles. Depois disso, o uso
          diário é só clicar em Conectar e aceitar — sem pagar.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Google:</strong> Cloud Console → ativar Calendar API →
            credencial OAuth Web → redirect{' '}
            <code className="text-accent-soft">
              http://localhost:3001/api/v1/calendar/google/callback
            </code>
            .
          </li>
          <li>
            <strong>Microsoft:</strong> Azure → Registro de app → redirect{' '}
            <code className="text-accent-soft">
              http://localhost:3001/api/v1/calendar/microsoft/callback
            </code>{' '}
            → permissões Graph <code className="text-accent-soft">Calendars.Read</code>.
          </li>
          <li>
            Cole Client ID/Secret no <code className="text-accent-soft">.env</code>{' '}
            e reinicie o backend.
          </li>
          <li>
            Volte aqui e clique em <strong>Conectar</strong> — abre a tela
            oficial de permissões.
          </li>
        </ol>
        <p className="text-xs text-slate-500">
          Passo a passo completo (prints mentais):{' '}
          <code className="text-accent-soft">docs/oauth-setup-gratis.md</code>
        </p>
      </section>

      <div className="rounded-2xl border border-white/10 bg-ink-900 p-5">
        <h2 className="font-medium text-white">Teams — app desktop</h2>
        <p className="mt-2 text-sm text-slate-400">
          Para reuniões no app Teams (fora do navegador):{' '}
          <code className="text-accent-soft">npm run dev:desktop</code>
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowIcs((v) => !v)}
          className="text-sm text-slate-400 hover:text-white"
        >
          {showIcs ? '▾' : '▸'} Alternativa avançada: feed ICS (sem tela de
          permissões)
        </button>
        {showIcs ? (
          <form
            onSubmit={onAddFeed}
            className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-ink-900 p-5"
          >
            <p className="text-sm text-slate-400">
              Só use se não puder criar OAuth. Cole o endereço secreto iCal do
              Google/Outlook.
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
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
            >
              Salvar feed ICS
            </button>
            {feeds.length ? (
              <ul className="space-y-2 pt-2">
                {feeds.map((feed) => (
                  <li
                    key={feed.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate text-slate-300">
                      {feed.label || feed.url}
                    </span>
                    <button
                      type="button"
                      className="text-red-300 hover:underline"
                      onClick={async () => {
                        await api.removeCalendarFeed(feed.id);
                        await refresh();
                      }}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </form>
        ) : null}
      </div>
    </div>
  );
}
