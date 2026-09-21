import { speakerColor } from '@/lib/speaker-color';

export function SpeakerLabel({
  name,
  color,
  className = 'text-xs font-medium',
}: {
  name: string;
  /** Cor já resolvida (mapa da reunião); senão usa hash estável. */
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ color: color ?? speakerColor(name) }}
    >
      {name}
    </span>
  );
}
