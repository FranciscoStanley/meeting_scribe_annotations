import { format, isValid, parse, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Exibição amigável pt-BR: 22/09/2026 · 15:00 */
export function formatDateTimeDisplay(value: Date | null): string {
  if (!value || !isValid(value)) return '';
  return format(value, "dd/MM/yyyy · HH:mm", { locale: ptBR });
}

export function combineDateAndTime(date: Date, timeHHmm: string): Date {
  const [h, m] = timeHHmm.split(':').map((n) => Number(n));
  const hours = Number.isFinite(h) ? h : 0;
  const minutes = Number.isFinite(m) ? m : 0;
  return setMinutes(setHours(date, hours), minutes);
}

export function timeFromDate(value: Date | null): string {
  if (!value || !isValid(value)) return '09:00';
  return format(value, 'HH:mm');
}

/** Valor local sem timezone drift para datetime-local legado. */
export function toLocalDateTimeValue(isoOrDate: string | Date): Date {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d;
}

export function parseDisplayOrIso(raw: string): Date | null {
  if (!raw.trim()) return null;
  const asIso = new Date(raw);
  if (isValid(asIso)) return asIso;
  const parsed = parse(raw, 'dd/MM/yyyy HH:mm', new Date());
  return isValid(parsed) ? parsed : null;
}
