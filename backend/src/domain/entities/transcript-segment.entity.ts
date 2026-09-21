import { v4 as uuidv4 } from 'uuid';

export interface TranscriptSegmentProps {
  id: string;
  sessionId: string;
  speakerLabel: string;
  text: string;
  startedAt: Date;
  endedAt?: Date;
  confidence?: number;
  speakerId?: string;
}

export class TranscriptSegmentEntity {
  private constructor(private readonly props: TranscriptSegmentProps) {}

  static create(
    input: Omit<TranscriptSegmentProps, 'id'> & { id?: string },
  ): TranscriptSegmentEntity {
    const text = input.text.trim();
    if (!text) {
      throw new Error('Transcript text cannot be empty');
    }
    return new TranscriptSegmentEntity({
      id: input.id ?? uuidv4(),
      ...input,
      text,
    });
  }

  static rehydrate(props: TranscriptSegmentProps): TranscriptSegmentEntity {
    return new TranscriptSegmentEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get speakerLabel(): string {
    return this.props.speakerLabel;
  }

  get text(): string {
    return this.props.text;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get endedAt(): Date | undefined {
    return this.props.endedAt;
  }

  get confidence(): number | undefined {
    return this.props.confidence;
  }

  get speakerId(): string | undefined {
    return this.props.speakerId;
  }

  toProps(): TranscriptSegmentProps {
    return { ...this.props };
  }
}
