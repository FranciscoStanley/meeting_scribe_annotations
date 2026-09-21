'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAudioCapture } from '@/hooks/use-audio-capture';
import { transcriptionSocketUrl } from '@/lib/api';

interface LiveSegment {
  id: string;
  speakerLabel: string;
  text: string;
  startedAt: string;
}

export default function CaptureSessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const { active, error, start, stop } = useAudioCapture(sessionId);
  const [segments, setSegments] = useState<LiveSegment[]>([]);

  useEffect(() => {
    const socket: Socket = io(transcriptionSocketUrl(), {
      transports: ['websocket'],
    });

    socket.on(
      'transcript:segment',
      (segment: LiveSegment) => {
        setSegments((prev) => [...prev, segment]);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Captura ao vivo</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Clique em iniciar e selecione a <strong>aba do Teams ou Meet</strong>.
          Ative <strong>compartilhar áudio da aba</strong> — assim o sistema ouve
          toda a conversa e transcreve em tempo real com identificação de falantes
          (via serviço STT/diarização configurado).
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {!active ? (
          <button
            type="button"
            onClick={start}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Iniciar transcrição da reunião
          </button>
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
          {active ? 'Gravando áudio da reunião' : 'Inativo'}
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
          >
            <p className="text-xs text-accent-soft">{segment.speakerLabel}</p>
            <p className="mt-1 text-slate-100">{segment.text}</p>
          </article>
        ))}
        {!segments.length ? (
          <p className="text-sm text-slate-500">
            Os trechos aparecerão aqui conforme o áudio for processado.
          </p>
        ) : null}
      </section>
    </div>
  );
}
