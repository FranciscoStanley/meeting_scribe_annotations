import { describe, expect, it } from 'vitest';
import { SPEAKER_PALETTE, speakerColor } from './speaker-color';

describe('speakerColor', () => {
  it('retorna a mesma cor para o mesmo nome (case-insensitive)', () => {
    expect(speakerColor('Ana')).toBe(speakerColor('ana'));
    expect(speakerColor('  Bob  ')).toBe(speakerColor('bob'));
  });

  it('distribui nomes pela paleta (hash estável)', () => {
    const colors = ['Alice', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe'].map(
      speakerColor,
    );
    expect(colors.every((c) => SPEAKER_PALETTE.includes(c as (typeof SPEAKER_PALETTE)[number]))).toBe(
      true,
    );
    expect(new Set(colors).size).toBeGreaterThan(1);
  });

  it('trata rótulo vazio como desconhecido estável', () => {
    expect(speakerColor('')).toBe(speakerColor('desconhecido'));
  });
});
