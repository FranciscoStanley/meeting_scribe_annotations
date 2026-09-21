import { describe, expect, it } from 'vitest';
import {
  combineDateAndTime,
  formatDateTimeDisplay,
  timeFromDate,
} from './datetime';

describe('datetime helpers', () => {
  it('formata exibição pt-BR', () => {
    const d = new Date(2026, 8, 22, 15, 30);
    expect(formatDateTimeDisplay(d)).toBe('22/09/2026 · 15:30');
  });

  it('combina data e horário', () => {
    const base = new Date(2026, 8, 22, 0, 0);
    const combined = combineDateAndTime(base, '14:45');
    expect(combined.getHours()).toBe(14);
    expect(combined.getMinutes()).toBe(45);
  });

  it('extrai HH:mm', () => {
    expect(timeFromDate(new Date(2026, 8, 22, 9, 5))).toBe('09:05');
  });
});
