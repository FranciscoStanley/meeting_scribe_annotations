'use client';

import { useParams } from 'next/navigation';
import { useAudioCapture } from '@/hooks/use-audio-capture';
import { SpeakerLabel } from '@/components/speaker-label';
import { speakerColor } from '@/lib/speaker-color';

export default function CaptureSessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const { active, error, status, chunksSent, segments, start, stop } =
    useAudioCapture(sessionId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Captura ao vivo</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Para o <strong>Google Meet</strong>: abra a reunião no{' '}
          <strong>Chrome (aba)</strong>, depois aqui clique em capturar áudio da
          aba, escolha essa aba do Meet e marque{' '}
          <strong>Compartilhar áudio da aba</strong>. O app Meet desktop não
          funciona — precisa ser a aba do browser.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-500">
          <li>Entre no Meet nesta aba/janela do Chrome</li>
          <li>Volte aqui e clique em &quot;Capturar áudio da aba&quot;</li>
          <li>Selecione a aba do Meet (não &quot;Janela&quot; / &quot;Tela inteira&quot;)</li>
          <li>Marque o checkbox de compartilhar áudio</li>
          <li>Fale por ~10s e espere os trechos (1ª vez o Whisper demora)</li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!active ? (
          <>
            <button
              type="button"
              onClick={() => start('tab')}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Capturar áudio da aba (Meet/Teams web)
            </button>
            <button
              type="button"
              onClick={() => start('mic')}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-100"
            >
              Testar com microfone
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="rounded-xl border border-red-400/40 px-4 py-2 text-sm text-red-200"
          >
            Encerrar captura
          </button>
        )}
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            active
              ? 'bg-emerald-500/20 text-emerald-200'
              : 'bg-white/10 text-slate-400'
          }`}
        >
          {active ? 'Gravando' : 'Inativo'}
        </span>
        <span className="text-xs text-slate-500">
          {status}
          {chunksSent > 0 ? ` · ${chunksSent} envios` : ''}
        </span>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">Transcrição em tempo real</h2>
        {segments.map((segment) => (
          <article
            key={segment.id}
            className="rounded-xl border border-white/10 bg-ink-900 p-4"
            style={{
              borderLeftColor: speakerColor(segment.speakerLabel),
              borderLeftWidth: 3,
            }}
          >
            <SpeakerLabel name={segment.speakerLabel} />
            <p className="mt-1 text-slate-100">{segment.text}</p>
          </article>
        ))}
        {!segments.length ? (
          <p className="text-sm text-slate-500">
            {active
              ? 'Aguardando o primeiro trecho (Whisper local pode demorar na 1ª vez)…'
              : 'Inicie a captura e fale. Se usar aba, marque “Compartilhar áudio”.'}
          </p>
        ) : null}
      </section>
    </div>
  );
}
