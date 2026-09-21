import Link from 'next/link';
import { api } from '@/lib/api';

function platformLabel(platform: string) {
  if (platform === 'TEAMS') return 'Microsoft Teams';
  if (platform === 'MEET') return 'Google Meet';
  return platform;
}

export default async function HomePage() {
  let meetings: Awaited<ReturnType<typeof api.listMeetings>> = [];
  let error: string | null = null;
  try {
    meetings = await api.listMeetings();
  } catch {
    error =
      'Não foi possível carregar reuniões. Verifique se a API está em execução.';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Suas reuniões</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Cada sessão fica salva com falantes e texto. Quando uma reunião do
            calendário estiver prestes a começar, você recebe um convite para
            entrar com transcrição.
          </p>
        </div>
        <Link
          href="/meetings/new"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Nova reunião manual
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Plataforma</th>
              <th className="px-4 py-3 font-medium">Início</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Trechos</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{meeting.title}</td>
                <td className="px-4 py-3">{platformLabel(meeting.platform)}</td>
                <td className="px-4 py-3 text-slate-300">
                  {new Date(meeting.scheduledStart).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">{meeting.status}</td>
                <td className="px-4 py-3">{meeting.segmentCount}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-accent-soft hover:underline"
                  >
                    Ver transcrição
                  </Link>
                </td>
              </tr>
            ))}
            {!meetings.length && !error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma reunião ainda. Conecte Google/Microsoft em Calendários
                  ou crie uma reunião manual.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
