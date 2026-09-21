import { io, Socket } from 'socket.io-client';
import {
  buildSpeakerColorMap,
  normalizeSpeakerKey,
  speakerColor,
} from '@meeting-scribe/shared';

const api = window.meetingScribeDesktop;

let socket: Socket | null = null;
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let currentAlertJoinUrl: string | undefined;
const seenSpeakers: string[] = [];

const sessionInput = document.getElementById('session-id') as HTMLInputElement;
const teamsDetect = document.getElementById('teams-detect') as HTMLParagraphElement;
const statusEl = document.getElementById('status') as HTMLSpanElement;
const errorEl = document.getElementById('error') as HTMLParagraphElement;
const segmentsEl = document.getElementById('segments') as HTMLDivElement;
const alertBox = document.getElementById('alert-box') as HTMLDivElement;
const alertText = document.getElementById('alert-text') as HTMLParagraphElement;
const preferDesktop = document.getElementById('prefer-desktop') as HTMLInputElement;
const captureMode = document.getElementById('capture-mode') as HTMLSelectElement;

function showError(message: string) {
  errorEl.style.display = 'block';
  errorEl.textContent = message;
}

function clearError() {
  errorEl.style.display = 'none';
}

function setStatus(live: boolean) {
  statusEl.textContent = live ? 'Capturando Teams' : 'Inativo';
  statusEl.classList.toggle('live', live);
  (document.getElementById('btn-start') as HTMLButtonElement).disabled = live;
  (document.getElementById('btn-stop') as HTMLButtonElement).disabled = !live;
}

function colorForSpeaker(speakerLabel: string): string {
  const key = normalizeSpeakerKey(speakerLabel);
  if (!seenSpeakers.includes(key)) seenSpeakers.push(key);
  const map = buildSpeakerColorMap(seenSpeakers);
  return map.get(key) ?? speakerColor(speakerLabel);
}

function appendSegment(speakerLabel: string, text: string) {
  const color = colorForSpeaker(speakerLabel);
  const div = document.createElement('div');
  div.className = 'segment';
  div.style.borderLeft = `3px solid ${color}`;
  div.style.paddingLeft = '10px';
  const name = document.createElement('div');
  name.className = 'speaker';
  name.style.color = color;
  name.textContent = speakerLabel;
  const body = document.createElement('div');
  body.textContent = text;
  div.append(name, body);
  segmentsEl.prepend(div);
}

async function refreshTeamsDetection() {
  const detected = await api.detectTeamsMeeting();
  if (!detected) {
    teamsDetect.textContent =
      'Teams desktop não detectado. Abra o app Microsoft Teams e entre na reunião.';
    return;
  }
  teamsDetect.textContent = detected.isLikelyInCall
    ? `Reunião detectada: “${detected.name}”`
    : `Teams aberto: “${detected.name}” (entre na reunião para capturar)`;
}

async function captureTeamsAudio(): Promise<MediaStream> {
  const mode = captureMode.value;
  if (mode === 'loopback') {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    displayStream.getVideoTracks().forEach((track) => track.stop());
    const audioTracks = displayStream.getAudioTracks();
    if (!audioTracks.length) {
      throw new Error(
        'Nenhum áudio capturado. Use Windows 11+ ou selecione “Compartilhar áudio do sistema”.',
      );
    }
    return new MediaStream(audioTracks);
  }

  const detected = await api.detectTeamsMeeting();
  const sources = await api.listTeamsSources();
  const sourceId = detected?.id ?? sources[0]?.id;
  if (!sourceId) {
    throw new Error(
      'Janela do Teams não encontrada. Abra o Microsoft Teams (desktop) e a reunião.',
    );
  }

  const captureStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
      },
    } as MediaTrackConstraints,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
      },
    } as MediaTrackConstraints,
  });

  captureStream.getVideoTracks().forEach((track) => track.stop());
  const audioTracks = captureStream.getAudioTracks();
  if (!audioTracks.length) {
    throw new Error(
      'Sem áudio na janela Teams. Troque para “Áudio do sistema (loopback)” ou compartilhe áudio no modo loopback.',
    );
  }
  return new MediaStream(audioTracks);
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function startCapture() {
  clearError();
  const sessionId = sessionInput.value.trim();
  if (!sessionId) {
    showError('Informe o ID da sessão (reunião) da API.');
    return;
  }

  const config = await api.getConfig();
  stream = await captureTeamsAudio();

  socket = io(`${config.wsUrl}/transcription`, { transports: ['websocket'] });
  socket.emit('session:start', { sessionId });
  socket.on('transcript:segment', (segment: { speakerLabel: string; text: string }) => {
    appendSegment(segment.speakerLabel, segment.text);
  });

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = async (event) => {
    if (!event.data.size || !socket) return;
    const buffer = await event.data.arrayBuffer();
    socket.emit('audio:chunk', {
      sessionId,
      mimeType,
      data: bufferToBase64(buffer),
    });
  };
  recorder.start(4000);
  setStatus(true);
}

async function stopCapture() {
  recorder?.stop();
  stream?.getTracks().forEach((track) => track.stop());
  const sessionId = sessionInput.value.trim();
  if (socket && sessionId) {
    socket.emit('session:complete', { sessionId });
    socket.disconnect();
  }
  recorder = null;
  stream = null;
  socket = null;
  setStatus(false);
}

function showAlert(payload: {
  sessionId: string;
  title: string;
  platform: string;
  joinUrl?: string;
  startsInMinutes: number;
}) {
  sessionInput.value = payload.sessionId;
  currentAlertJoinUrl = payload.joinUrl;
  alertText.textContent = `${payload.title} (${payload.platform}) — começa em ${payload.startsInMinutes} min.`;
  alertBox.style.display = 'block';
}

document.getElementById('btn-start')?.addEventListener('click', () => {
  void startCapture().catch((err) => {
    showError(err instanceof Error ? err.message : 'Falha ao capturar Teams');
    void stopCapture();
  });
});

document.getElementById('btn-stop')?.addEventListener('click', () => {
  void stopCapture();
});

document.getElementById('btn-alert-join')?.addEventListener('click', () => {
  if (currentAlertJoinUrl) {
    void api.openJoinUrl(currentAlertJoinUrl, preferDesktop.checked);
  }
});

document.getElementById('btn-alert-transcribe')?.addEventListener('click', () => {
  alertBox.style.display = 'none';
  void startCapture().catch((err) => {
    showError(err instanceof Error ? err.message : 'Falha ao transcrever');
  });
});

void (async () => {
  await refreshTeamsDetection();
  setInterval(refreshTeamsDetection, 15_000);

  const pending = await api.consumePendingCaptureSession();
  if (pending) sessionInput.value = pending;

  api.onMeetingAlert(showAlert);
  api.onTeamsMeetingWindow(() => {
    void refreshTeamsDetection();
  });
})();
