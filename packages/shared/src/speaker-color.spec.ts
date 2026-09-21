import { describe, expect, it } from 'vitest';
import {
  SPEAKER_PALETTE,
  buildSpeakerColorMap,
  speakerColor,
} from './speaker-color';

describe('speakerColor', () => {
  it('retorna a mesma cor para o mesmo nome (case-insensitive)', () => {
    expect(speakerColor('Ana')).toBe(speakerColor('ana'));
    expect(speakerColor('  Bob  ')).toBe(speakerColor('bob'));
  });

  it('distribui nomes pela paleta (hash estável)', () => {
    const colors = ['Alice', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe'].map(
      (n) => speakerColor(n),
    );
    expect(
      colors.every((c) =>
        SPEAKER_PALETTE.includes(c as (typeof SPEAKER_PALETTE)[number]),
      ),
    ).toBe(true);
    expect(new Set(colors).size).toBeGreaterThan(1);
  });

  it('trata rótulo vazio como desconhecido estável', () => {
    expect(speakerColor('')).toBe(speakerColor('desconhecido'));
  });
});

describe('buildSpeakerColorMap', () => {
  it('atribui cores distintas na ordem de aparição', () => {
    const map = buildSpeakerColorMap([
      'Ana Costa',
      'Carlos Mendes',
      'Ana Costa',
      'Carlos Mendes',
    ]);
    expect(map.get('ana costa')).toBe(SPEAKER_PALETTE[0]);
    expect(map.get('carlos mendes')).toBe(SPEAKER_PALETTE[1]);
    expect(speakerColor('Ana Costa', map)).not.toBe(
      speakerColor('Carlos Mendes', map),
    );
  });

  it('Ana Costa e Carlos Mendes ficam visualmente distintos via mapa', () => {
    const map = buildSpeakerColorMap(['Ana Costa', 'Carlos Mendes']);
    expect(speakerColor('Ana Costa', map)).toBe('#0F766E');
    expect(speakerColor('Carlos Mendes', map)).toBe('#1D4ED8');
  });
});
