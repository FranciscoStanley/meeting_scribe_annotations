'use client';

import { useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { transcriptionSocketUrl } from '@/lib/api';

export function useAudioCapture(sessionId: string) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(async () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    socketRef.current?.emit('session:complete', { sessionId });
    socketRef.current?.disconnect();
    recorderRef.current = null;
    streamRef.current = null;
    socketRef.current = null;
    setActive(false);
  }, [sessionId]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      stream.getVideoTracks().forEach((track) => track.stop());

      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length) {
        throw new Error(
          'Nenhum áudio capturado. Selecione a aba da reunião (Meet/Teams) e marque "Compartilhar áudio".',
        );
      }

      const audioOnly = new MediaStream(audioTracks);
      streamRef.current = audioOnly;

      const socket = io(transcriptionSocketUrl(), { transports: ['websocket'] });
      socketRef.current = socket;
      socket.emit('session:start', { sessionId });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(audioOnly, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = async (event) => {
        if (!event.data.size) return;
        const buffer = await event.data.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        socket.emit('audio:chunk', {
          sessionId,
          mimeType,
          data: base64,
        });
      };

      recorder.start(4000);
      setActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao capturar áudio');
      await stop();
    }
  }, [sessionId, stop]);

  return { active, error, start, stop };
}
