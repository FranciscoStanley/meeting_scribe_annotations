/** Valida início/fim da agenda (domínio). */
export function assertMeetingSchedule(
  scheduledStart: Date,
  scheduledEnd?: Date,
): void {
  if (!(scheduledStart instanceof Date) || Number.isNaN(scheduledStart.getTime())) {
    throw new Error('Data/hora de início inválida');
  }
  if (scheduledEnd !== undefined) {
    if (!(scheduledEnd instanceof Date) || Number.isNaN(scheduledEnd.getTime())) {
      throw new Error('Data/hora de fim inválida');
    }
    if (scheduledEnd.getTime() <= scheduledStart.getTime()) {
      throw new Error('A data/hora de fim deve ser posterior ao início');
    }
  }
}
