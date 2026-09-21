/** Paleta com contraste alto entre vizinhos — fundo claro. */
export const SPEAKER_PALETTE = [
  '#0F766E', // teal
  '#1D4ED8', // blue
  '#B45309', // amber
  '#BE123C', // rose
  '#7C3AED', // violet
  '#C2410C', // orange
  '#15803D', // green
  '#0369A1', // sky
  '#A21CAF', // fuchsia
  '#9A3412', // brown
  '#4338CA', // indigo
  '#0E7490', // cyan
] as const;

export function normalizeSpeakerKey(label: string): string {
  return label.trim().toLowerCase() || 'desconhecido';
}

function hashLabel(label: string): number {
  const key = normalizeSpeakerKey(label);
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Cores distintas por ordem de primeira aparição na reunião.
 * Preferir isto ao hash sozinho — evita colisões perceptuais (ex.: dois teas perto).
 */
export function buildSpeakerColorMap(
  labels: Iterable<string>,
): Map<string, string> {
  const map = new Map<string, string>();
  let index = 0;
  for (const label of labels) {
    const key = normalizeSpeakerKey(label);
    if (map.has(key)) continue;
    map.set(key, SPEAKER_PALETTE[index % SPEAKER_PALETTE.length]);
    index += 1;
  }
  return map;
}

/** Cor estável por falante. Com `map`, usa a atribuição da reunião. */
export function speakerColor(
  label: string,
  map?: Map<string, string>,
): string {
  const key = normalizeSpeakerKey(label);
  if (map?.has(key)) return map.get(key)!;
  return SPEAKER_PALETTE[hashLabel(label) % SPEAKER_PALETTE.length];
}
