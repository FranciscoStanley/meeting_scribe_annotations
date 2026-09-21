import { SpeakerLabel } from '@/components/speaker-label';

export function TranscriptSegmentCard({
  speakerLabel,
  text,
  startedAt,
  color,
}: {
  speakerLabel: string;
  text: string;
  startedAt?: string;
  color: string;
}) {
  return (
    <article
      className="rounded-2xl border border-hairline bg-panel p-5 shadow-soft"
      style={{
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: color,
      }}
    >
      <header className="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
        <SpeakerLabel
          name={speakerLabel}
          color={color}
          className="text-sm font-semibold"
        />
        {startedAt ? (
          <time className="tabular-nums" dateTime={startedAt}>
            {new Date(startedAt).toLocaleTimeString('pt-BR')}
          </time>
        ) : null}
      </header>
      <p className="text-[15px] leading-relaxed text-ink-soft">{text}</p>
    </article>
  );
}
