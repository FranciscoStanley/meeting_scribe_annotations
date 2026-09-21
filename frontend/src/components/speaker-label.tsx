import { speakerColor } from '@/lib/speaker-color';

export function SpeakerLabel({
  name,
  className = 'text-xs font-medium',
}: {
  name: string;
  className?: string;
}) {
  return (
    <span className={className} style={{ color: speakerColor(name) }}>
      {name}
    </span>
  );
}
