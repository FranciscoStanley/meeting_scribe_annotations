/** Converte string/Date em Date válida ou null. */
export function parseScheduleDate(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type MeetingScheduleValidation =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Valida início/fim da agenda (formulários + API).
 * `rejectPastStart` (default true): bloqueia início no passado (com margem de 1 min).
 */
export function validateMeetingSchedule(input: {
  scheduledStart: Date | string | null | undefined;
  scheduledEnd?: Date | string | null | undefined;
  now?: Date;
  rejectPastStart?: boolean;
}): MeetingScheduleValidation {
  const start = parseScheduleDate(input.scheduledStart);
  if (!start) {
    return { ok: false, message: 'Informe uma data/hora de início válida.' };
  }

  const hasEnd =
    input.scheduledEnd != null && String(input.scheduledEnd).trim() !== '';
  const end = hasEnd ? parseScheduleDate(input.scheduledEnd) : null;
  if (hasEnd && !end) {
    return { ok: false, message: 'Data/hora de fim inválida.' };
  }
  if (end && end.getTime() <= start.getTime()) {
    return {
      ok: false,
      message: 'A data/hora de fim deve ser posterior ao início.',
    };
  }

  const rejectPast = input.rejectPastStart !== false;
  const now = input.now ?? new Date();
  if (rejectPast && start.getTime() < now.getTime() - 60_000) {
    return {
      ok: false,
      message: 'O início não pode estar no passado. Ajuste a data/hora.',
    };
  }

  return { ok: true };
}

/** Lança Error se inválido — uso no backend. */
export function assertMeetingSchedule(
  scheduledStart: Date,
  scheduledEnd?: Date,
  options?: { rejectPastStart?: boolean; now?: Date },
): void {
  const result = validateMeetingSchedule({
    scheduledStart,
    scheduledEnd,
    now: options?.now,
    rejectPastStart: options?.rejectPastStart ?? false,
  });
  if (!result.ok) throw new Error(result.message);
}
