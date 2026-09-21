/** Paleta legível em fundo escuro — mesma cor sempre para o mesmo nome. */
export const SPEAKER_PALETTE = [
  '#38bdf8', // sky
  '#a78bfa', // violet
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb7185', // rose
  '#2dd4bf', // teal
  '#f97316', // orange
  '#60a5fa', // blue
  '#e879f9', // fuchsia
  '#4ade80', // green
  '#f472b6', // pink
  '#22d3ee', // cyan
] as const;

function hashLabel(label: string): number {
  const key = label.trim().toLowerCase() || 'desconhecido';
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Cor estável por falante (hash do nome). */
export function speakerColor(label: string): string {
  return SPEAKER_PALETTE[hashLabel(label) % SPEAKER_PALETTE.length];
}
