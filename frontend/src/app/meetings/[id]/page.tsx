import Link from 'next/link';
import { api } from '@/lib/api';

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: Awaited<ReturnType<typeof api.getTranscript>> | null = null;
  try {
    data = await api.getTranscript(id);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <p className="text-red-300">Transcrição não encontrada ou API indisponível.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            {String(data.session.title)}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {data.segments.length} trechos transcritos
          </p>
        </div>
        <Link
          href={`/sessions/${id}/capture`}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Continuar captura
        </Link>
      </div>

      <div className="space-y-3">
        {data.segments.map((segment) => (
          <article
            key={segment.id}
            className="rounded-xl border border-white/10 bg-ink-900 p-4"
          >
            <header className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-accent-soft">
                {segment.speakerLabel}
              </span>
              <time dateTime={segment.startedAt}>
                {new Date(segment.startedAt).toLocaleTimeString('pt-BR')}
              </time>
            </header>
            <p className="text-slate-100">{segment.text}</p>
          </article>
        ))}
        {!data.segments.length ? (
          <p className="text-slate-500">Ainda não há trechos para esta reunião.</p>
        ) : null}
      </div>
    </div>
  );
}
