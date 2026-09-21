/** Paleta legível em fundo claro — mesma cor sempre para o mesmo nome. */
export const SPEAKER_PALETTE = [
  '#0F766E', // teal
  '#1D4ED8', // blue
  '#7C3AED', // violet (acento falante, não tema)
  '#B45309', // amber
  '#BE123C', // rose
  '#0E7490', // cyan
  '#C2410C', // orange
  '#4338CA', // indigo
  '#A21CAF', // fuchsia
  '#15803D', // green
  '#9D174D', // pink
  '#155E75', // slate-cyan
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
