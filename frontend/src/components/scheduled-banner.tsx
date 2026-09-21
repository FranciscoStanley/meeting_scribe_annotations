'use client';

import { useSearchParams } from 'next/navigation';
import { AlertBanner } from '@/components/ui';

export function ScheduledBanner() {
  const params = useSearchParams();
  if (params.get('agendada') !== '1') return null;

  return (
    <AlertBanner tone="ok">
      Reunião agendada. Deixe esta página aberta: perto do horário o Meeting
      Scribe pede para participar e transcrever.
    </AlertBanner>
  );
}
