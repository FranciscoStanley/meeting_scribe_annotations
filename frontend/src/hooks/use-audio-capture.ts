'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { transcriptionSocketUrl } from '@/lib/api';

export type CaptureSource = 'tab' | 'mic';

export interface LiveSegment {
  id: string;
  speakerLabel: string;
  text: string;
  startedAt: string;
  confidence?: number;
}

const CHUNK_MS = 5000;

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

function pickMimeType(): string {
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  if (MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  }
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    return 'audio/mp4';
  }
  return '';
}

export function useAudioCapture(sessionId: string) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Pronto');
  const [chunksSent, setChunksSent] = useState(0);
  const [segments, setSegments] = useState<LiveSegment[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef('audio/webm');
  const sendingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const ensureSocket = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;
    const socket = io(transcriptionSocketUrl(), {
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = socket;
    socket.on('transcript:segment', (segment: LiveSegment) => {
      setSegments((prev) =>
        prev.some((s) => s.id === segment.id) ? prev : [...prev, segment],
      );
      setStatus('Trecho recebido');
    });
    socket.on('connect_error', (err) => {
      setError(`WebSocket: ${err.message}`);
    });
    return socket;
  }, []);

  // Escuta a sessão mesmo antes de gravar (útil se houver outro capturador)
  useEffect(() => {
    const socket = ensureSocket();
    const join = () => socket.emit('session:subscribe', { sessionId });
    if (socket.connected) join();
    else socket.on('connect', join);
    return () => {
      socket.off('connect', join);
    };
  }, [sessionId, ensureSocket]);

  const sendBlob = useCallback(
    async (blob: Blob) => {
      if (!blob.size || sendingRef.current) return;
      const socket = socketRef.current;
      if (!socket?.connected) {
        setError('WebSocket desconectado — não foi possível enviar áudio.');
        return;
      }
      sendingRef.current = true;
      try {
        const data = await blobToBase64(blob);
        socket.emit(
          'audio:chunk',
          {
            sessionId,
            mimeType: mimeTypeRef.current || blob.type || 'audio/webm',
            data,
          },
          (ack?: { ok?: boolean; transcribed?: boolean }) => {
            setChunksSent((n) => n + 1);
            if (ack?.transcribed) {
              setStatus('Transcrevendo…');
            } else {
              setStatus(`Áudio enviado (${Math.round(blob.size / 1024)} KB) — aguardando STT`);
            }
          },
        );
      } finally {
        sendingRef.current = false;
      }
    },
    [sessionId],
  );

  const stopRecorderCycle = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    recorderRef.current = null;
  }, []);

  const startRecorderCycle = useCallback(
    (stream: MediaStream) => {
      const mimeType = pickMimeType();
      mimeTypeRef.current = mimeType || 'audio/webm';

      const create = () => {
        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(stream, options);
        recorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            void sendBlob(event.data);
          }
        };

        recorder.onerror = () => {
          setError('Falha no MediaRecorder');
        };

        // Sem timeslice: stop() gera um WebM completo (com cabeçalho) — ffmpeg consegue ler
        recorder.start();
      };

      create();
      clearTimer();
      timerRef.current = setInterval(() => {
        const current = recorderRef.current;
        if (!current || current.state !== 'recording') return;
        current.stop();
        // Recria após flush do blob completo
        setTimeout(() => {
          if (streamRef.current) create();
        }, 60);
      }, CHUNK_MS);
    },
    [sendBlob],
  );

  const stop = useCallback(async () => {
    stopRecorderCycle();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    socketRef.current?.emit('session:complete', { sessionId });
    setActive(false);
    setStatus('Captura encerrada');
  }, [sessionId, stopRecorderCycle]);

  const start = useCallback(
    async (source: CaptureSource = 'tab') => {
      setError(null);
      setChunksSent(0);
      setStatus('Solicitando permissão…');
      try {
        let stream: MediaStream;
        if (source === 'mic') {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              channelCount: 1,
            },
          });
        } else {
          // Chrome: áudio da ABA (Meet/Teams web). Tela/janela quase nunca traz áudio no Windows.
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: 'browser',
            } as MediaTrackConstraints,
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            } as MediaTrackConstraints,
            // Chromium extras (ignorados se o browser não suporte)
            ...({
              preferCurrentTab: false,
              selfBrowserSurface: 'exclude',
              surfaceSwitching: 'include',
              systemAudio: 'include',
              monitorTypeSurfaces: 'exclude',
            } as Record<string, unknown>),
          });
          stream.getVideoTracks().forEach((track) => track.stop());
          const audioTracks = stream.getAudioTracks();
          if (!audioTracks.length) {
            throw new Error(
              'Sem áudio. No Chrome: aba "Chrome Tab" → selecione a aba do Meet → marque "Also share tab audio" / "Compartilhar áudio da aba". Não use Janela nem Tela inteira.',
            );
          }
          stream = new MediaStream(audioTracks);
        }

        streamRef.current = stream;
        stream.getAudioTracks().forEach((track) => {
          track.onended = () => {
            void stop();
          };
        });

        const socket = ensureSocket();
        await new Promise<void>((resolve, reject) => {
          if (socket.connected) resolve();
          else {
            socket.once('connect', () => resolve());
            socket.once('connect_error', (e) => reject(e));
            setTimeout(() => reject(new Error('Timeout WebSocket')), 8000);
          }
        });
        socket.emit('session:start', { sessionId });

        startRecorderCycle(stream);
        setActive(true);
        setStatus(
          source === 'mic'
            ? 'Gravando microfone — fale normalmente'
            : 'Gravando áudio da aba — fale na reunião',
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao capturar áudio');
        setStatus('Erro');
        await stop();
      }
    },
    [sessionId, ensureSocket, startRecorderCycle, stop],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    active,
    error,
    status,
    chunksSent,
    segments,
    start,
    stop,
  };
}
