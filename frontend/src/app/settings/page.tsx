'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calendarConnectUrl, api } from '@/lib/api';
import { BackLink } from '@/components/back-link';
import { AlertBanner, PageHeader, Panel } from '@/components/ui';

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
    'Google ainda não está configurado no .env. Siga o guia gratuito e reinicie o backend.',
  microsoft_not_configured:
    'Microsoft ainda não está configurada no .env. Siga o guia e reinicie o backend.',
  google_callback: 'Falha no retorno do Google. Tente conectar de novo.',
  microsoft_callback: 'Falha no retorno da Microsoft. Tente conectar de novo.',
  google_token:
    'Google não devolveu o token. Confira Client Secret e URI de redirecionamento.',
  microsoft_token:
    'Microsoft não devolveu o token. Confira Client Secret, URI e contas habilitadas.',
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
        `Conta ${connected} conectada. ${syncedParam} reunião(ões) sincronizada(s).`,
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
    <div className="mx-auto max-w-3xl space-y-8">
      <BackLink href="/" label="Voltar para home" />
      <PageHeader
        eyebrow="Integrações"
        title="Calendários"
        description="Conecte Google ou Outlook uma vez. O Meeting Scribe detecta Meet/Teams automaticamente — sem mensalidade (cota gratuita das APIs)."
      />

      {oauthError ? (
        <AlertBanner tone="warn">
          {OAUTH_ERRORS[oauthError] ?? 'Erro ao conectar calendário.'}
        </AlertBanner>
      ) : null}

      {connected ? (
        <AlertBanner tone="ok">
          Conta {connected} autorizada.
          {syncedParam !== null
            ? ` Sync inicial: ${syncedParam} reunião(ões).`
            : null}
        </AlertBanner>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Conectar com um clique
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">
              Google Calendar
            </h3>
            <p className="mt-2 text-sm text-muted">
              Detecta links do Meet e eventos da agenda Google.
            </p>
            {googleAccounts.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {googleAccounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2"
                  >
                    <span className="truncate text-ink-soft">{a.email}</span>
                    <button
                      type="button"
                      className="shrink-0 text-sm font-medium text-danger hover:underline"
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
                className="ms-btn-primary mt-4"
              >
                {googleAccounts.length
                  ? 'Conectar outra conta Google'
                  : 'Conectar Google'}
              </a>
            ) : (
              <p className="mt-4 text-sm text-live">
                Configure o OAuth gratuito uma vez (guia abaixo) para habilitar
                este botão.
              </p>
            )}
          </Panel>

          <Panel className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">
              Outlook / Teams
            </h3>
            <p className="mt-2 text-sm text-muted">
              Lê a agenda Outlook e reuniões Teams (conta pessoal ou trabalho).
            </p>
            {microsoftAccounts.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {microsoftAccounts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2"
                  >
                    <span className="truncate text-ink-soft">{a.email}</span>
                    <button
                      type="button"
                      className="shrink-0 text-sm font-medium text-danger hover:underline"
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
                className="ms-btn-primary mt-4"
              >
                {microsoftAccounts.length
                  ? 'Conectar outra conta Microsoft'
                  : 'Conectar Outlook / Teams'}
              </a>
            ) : (
              <p className="mt-4 text-sm text-live">
                Configure o registro Azure gratuito uma vez para habilitar este
                botão.
              </p>
            )}
          </Panel>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={syncNow} className="ms-btn-secondary">
            Sincronizar agora
          </button>
          {syncMessage ? (
            <p className="text-sm text-muted">{syncMessage}</p>
          ) : null}
        </div>
      </section>

      <Panel className="space-y-3 p-5" id="oauth-setup">
        <h2 className="font-display text-base font-semibold text-ink">
          Setup gratuito (uma vez, ~10 min)
        </h2>
        <p className="text-sm text-muted">
          Este app self-hosted precisa de um Client ID gratuito no Google Cloud /
          Azure. Depois, o uso diário é só Conectar e aceitar.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>
            <strong>Google:</strong> Calendar API + OAuth Web → redirect{' '}
            <code className="rounded bg-surface px-1 text-brand">
              http://localhost:3001/api/v1/calendar/google/callback
            </code>
          </li>
          <li>
            <strong>Microsoft:</strong> App registration → redirect{' '}
            <code className="rounded bg-surface px-1 text-brand">
              http://localhost:3001/api/v1/calendar/microsoft/callback
            </code>{' '}
            · <code className="rounded bg-surface px-1 text-brand">Calendars.Read</code>
          </li>
          <li>
            Cole Client ID/Secret no{' '}
            <code className="rounded bg-surface px-1 text-brand">.env</code> e
            reinicie o backend.
          </li>
          <li>
            Volte e clique em <strong>Conectar</strong>.
          </li>
        </ol>
        <p className="text-xs text-muted">
          Detalhes: <code className="text-brand">docs/oauth-setup-gratis.md</code>
        </p>
      </Panel>

      <Panel className="p-5">
        <h2 className="font-display text-base font-semibold text-ink">
          Teams — app desktop
        </h2>
        <p className="mt-2 text-sm text-muted">
          Reuniões no app Teams (fora do navegador):{' '}
          <code className="rounded bg-surface px-1 text-brand">
            npm run dev:desktop
          </code>
        </p>
      </Panel>

      <div>
        <button
          type="button"
          onClick={() => setShowIcs((v) => !v)}
          className="text-sm font-medium text-muted hover:text-ink"
        >
          {showIcs ? 'Ocultar' : 'Mostrar'} alternativa: feed ICS
        </button>
        {showIcs ? (
          <form onSubmit={onAddFeed} className="ms-panel mt-3 space-y-3 p-5">
            <p className="text-sm text-muted">
              Só se não puder usar OAuth. Cole o endereço secreto iCal.
            </p>
            <label className="ms-label">
              URL ICS
              <input
                name="url"
                type="url"
                required
                placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                className="ms-input"
              />
            </label>
            <label className="ms-label">
              Nome <span className="font-normal text-muted">(opcional)</span>
              <input name="label" className="ms-input" />
            </label>
            {feedError ? (
              <AlertBanner tone="danger">{feedError}</AlertBanner>
            ) : null}
            <button type="submit" className="ms-btn-secondary">
              Salvar feed ICS
            </button>
            {feeds.length ? (
              <ul className="space-y-2 border-t border-hairline pt-3">
                {feeds.map((feed) => (
                  <li
                    key={feed.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate text-ink-soft">
                      {feed.label || feed.url}
                    </span>
                    <button
                      type="button"
                      className="font-medium text-danger hover:underline"
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
