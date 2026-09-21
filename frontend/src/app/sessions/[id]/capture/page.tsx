'use client';

import { useParams } from 'next/navigation';
import { useAudioCapture } from '@/hooks/use-audio-capture';
import { SpeakerLabel } from '@/components/speaker-label';
import { speakerColor } from '@/lib/speaker-color';
import { AlertBanner, EmptyState, PageHeader, Panel } from '@/components/ui';

export default function CaptureSessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const { active, error, status, chunksSent, segments, start, stop } =
    useAudioCapture(sessionId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Captura ao vivo"
        description="Para Google Meet ou Teams na web: compartilhe a aba no Chrome com áudio. Para validar o STT rapidamente, use o microfone."
      />

      <Panel className="p-6 sm:p-8">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Entre na reunião numa aba do Chrome</li>
          <li>Volte aqui e escolha capturar áudio da aba</li>
          <li>Selecione a aba da reunião (não janela nem tela inteira)</li>
          <li>Marque “Compartilhar áudio da aba”</li>
          <li>Fale ~10s — a primeira vez o Whisper pode demorar</li>
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!active ? (
            <>
              <button
                type="button"
                onClick={() => start('tab')}
                className="ms-btn-primary"
              >
                Capturar áudio da aba
              </button>
              <button
                type="button"
                onClick={() => start('mic')}
                className="ms-btn-secondary"
              >
                Testar com microfone
              </button>
            </>
          ) : (
            <button type="button" onClick={stop} className="ms-btn-danger">
              Encerrar captura
            </button>
          )}
          <span
            className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold ${
              active
                ? 'bg-brand-soft text-brand-ink'
                : 'bg-surface-muted text-muted'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-sm ${
                active ? 'bg-brand' : 'bg-muted-soft'
              }`}
              aria-hidden
            />
            {active ? 'Gravando' : 'Inativo'}
          </span>
          <span className="text-xs text-muted">
            {status}
            {chunksSent > 0 ? ` · ${chunksSent} envios` : ''}
          </span>
        </div>

        {error ? (
          <div className="mt-4">
            <AlertBanner tone="danger">{error}</AlertBanner>
          </div>
        ) : null}
      </Panel>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Transcrição em tempo real
        </h2>
        {segments.map((segment) => (
          <article
            key={segment.id}
            className="rounded-2xl border border-hairline bg-panel p-5 shadow-soft"
            style={{
              borderLeftColor: speakerColor(segment.speakerLabel),
              borderLeftWidth: 3,
            }}
          >
            <SpeakerLabel
              name={segment.speakerLabel}
              className="text-sm font-semibold"
            />
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
              {segment.text}
            </p>
          </article>
        ))}
        {!segments.length ? (
          <Panel>
            <EmptyState
              title={
                active
                  ? 'Aguardando o primeiro trecho'
                  : 'Nenhum trecho ainda'
              }
            >
              {active
                ? 'O Whisper local pode demorar na primeira execução.'
                : 'Inicie a captura e fale. Na aba, marque compartilhar áudio.'}
            </EmptyState>
          </Panel>
        ) : null}
      </section>
    </div>
  );
}
