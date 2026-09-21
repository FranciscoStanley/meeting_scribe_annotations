export const SPEECH_TO_TEXT_PORT = Symbol('SPEECH_TO_TEXT_PORT');

export interface SpeechToTextResult {
  text: string;
  confidence?: number;
  speakerLabel?: string;
}

export interface SpeechToTextPort {
  transcribeChunk(audio: Buffer, mimeType: string): Promise<SpeechToTextResult | null>;
}
