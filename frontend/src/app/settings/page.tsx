'use client';

import { useSearchParams } from 'next/navigation';
import { calendarConnectUrl, api } from '@/lib/api';
import { useState } from 'react';

export default function SettingsPage() {
  const params = useSearchParams();
  const connected = params.get('connected');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  async function syncNow() {
    try {
      const result = await api.syncCalendar();
      setSyncMessage(`${result.synced} reunião(ões) sincronizada(s).`);
    } catch {
      setSyncMessage('Falha ao sincronizar calendário.');
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Calendários</h1>
        <p className="mt-2 text-slate-400">
          Conecte Google Calendar (Meet) e Microsoft Outlook/Teams para detectar
          reuniões automaticamente e pedir para participar com transcrição.
        </p>
      </div>

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
          <h2 className="font-medium text-white">Google Calendar</h2>
          <p className="mt-2 text-sm text-slate-400">Detecta links do Meet.</p>
        </a>
        <a
          href={calendarConnectUrl('microsoft')}
          className="rounded-2xl border border-white/10 bg-ink-900 p-5 hover:border-accent/40"
        >
          <h2 className="font-medium text-white">Microsoft 365</h2>
          <p className="mt-2 text-sm text-slate-400">
            Detecta reuniões Teams no Outlook.
          </p>
        </a>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-ink-900 p-5">
        <h2 className="font-medium text-white">Teams — app desktop (Windows)</h2>
        <p className="mt-2 text-sm text-slate-400">
          Para reuniões fora do navegador, use o companion Electron. Ele detecta a
          janela do Teams, abre links com <code className="text-accent-soft">msteams://</code>{' '}
          e envia o áudio para a mesma API.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Na pasta <code>desktop/</code>: <code>npm run dev:desktop</code>
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
