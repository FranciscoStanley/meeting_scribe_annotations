'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { validateMeetingSchedule } from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { BackLink } from '@/components/back-link';
import {
  MeetingScheduleForm,
  MeetingScheduleFormValues,
} from '@/components/meeting-schedule-form';
import { PageHeader } from '@/components/ui';

export default function NewMeetingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<MeetingScheduleFormValues>({
    title: '',
    start: null,
    end: null,
    joinUrl: '',
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validation = validateMeetingSchedule({
      scheduledStart: values.start,
      scheduledEnd: values.end,
      rejectPastStart: true,
    });
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    if (!values.start) return;

    setBusy(true);
    try {
      await api.createMeeting({
        title: values.title.trim(),
        scheduledStart: values.start.toISOString(),
        scheduledEnd: values.end ? values.end.toISOString() : undefined,
        joinUrl: values.joinUrl.trim(),
      });
      toast.success('Reunião agendada.');
      router.push('/?agendada=1');
    } catch {
      setError(
        'Não foi possível agendar. Confira horário e link (com https://).',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/" label="Voltar para reuniões" />
      <PageHeader
        title="Agendar reunião"
        description="Defina o horário no calendário, cole o link do Teams ou Meet e deixe a aba aberta para o alerta na hora."
      />
      <div className="mt-8">
        <MeetingScheduleForm
          mode="create"
          values={values}
          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          onSubmit={onSubmit}
          busy={busy}
          error={error}
          cancelHref="/"
        />
      </div>
    </div>
  );
}
