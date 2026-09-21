'use client';

import { useSearchParams } from 'next/navigation';

export function ScheduledBanner() {
  const params = useSearchParams();
  if (params.get('agendada') !== '1') return null;

  return (
    <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
      Reunião agendada. Deixe esta página aberta: perto do horário o Meeting
      Scribe pede permissão para <strong>participar e transcrever</strong>.
    </p>
  );
}
