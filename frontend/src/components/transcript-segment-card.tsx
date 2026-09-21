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
      className="rounded-2xl border border-hairline bg-panel p-5 shadow-soft transition hover:shadow-lift"
      style={{
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: color,
      }}
    >
      <header className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-sm"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <SpeakerLabel
            name={speakerLabel}
            color={color}
            className="truncate text-sm font-semibold"
          />
        </div>
        {startedAt ? (
          <time
            className="shrink-0 rounded-md bg-surface px-2 py-0.5 text-xs tabular-nums text-muted"
            dateTime={startedAt}
          >
            {new Date(startedAt).toLocaleTimeString('pt-BR')}
          </time>
        ) : null}
      </header>
      <p className="text-[15px] leading-relaxed text-ink-soft">{text}</p>
    </article>
  );
}
