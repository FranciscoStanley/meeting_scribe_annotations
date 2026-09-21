'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  meetingCanModify,
  MeetingSessionStatus,
  validateMeetingSchedule,
} from '@meeting-scribe/shared';
import { api } from '@/lib/api';
import { BackLink } from '@/components/back-link';
import {
  MeetingScheduleForm,
  MeetingScheduleFormValues,
} from '@/components/meeting-schedule-form';
import { AlertBanner, PageHeader } from '@/components/ui';

export default function EditMeetingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<MeetingSessionStatus | null>(null);
  const [values, setValues] = useState<MeetingScheduleFormValues>({
    title: '',
    start: null,
    end: null,
    joinUrl: '',
  });

  useEffect(() => {
    void (async () => {
      try {
        const meeting = await api.getMeeting(id);
        if (!meeting.canModify) {
          router.replace(`/meetings/${id}`);
          return;
        }
        setValues({
          title: meeting.title,
          start: new Date(meeting.scheduledStart),
          end: meeting.scheduledEnd ? new Date(meeting.scheduledEnd) : null,
          joinUrl: meeting.joinUrl ?? '',
        });
        setStatus(meeting.status);
      } catch {
        setError('Reunião não encontrada.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

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
      await api.updateMeeting(id, {
        title: values.title.trim(),
        scheduledStart: values.start.toISOString(),
        scheduledEnd: values.end ? values.end.toISOString() : undefined,
        joinUrl: values.joinUrl.trim(),
      });
      toast.success('Agenda atualizada.');
      router.push('/');
      router.refresh();
    } catch {
      setError(
        'Não foi possível salvar. Confira os dados ou se a agenda ainda não iniciou.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-28 rounded-xl bg-surface-muted" />
          <div className="h-12 w-2/3 rounded-xl bg-surface-muted" />
          <div className="h-64 rounded-2xl bg-surface-muted" />
        </div>
      </div>
    );
  }

  if (status && !meetingCanModify(status)) {
    return (
      <AlertBanner tone="warn">
        Esta reunião já iniciou ou foi concluída — somente visualização.
      </AlertBanner>
    );
  }

  if (error && !values.start) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <BackLink href="/" label="Voltar para home" />
        <AlertBanner tone="danger">{error}</AlertBanner>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href={`/meetings/${id}`} label="Voltar à reunião" />
      <PageHeader
        eyebrow="Agenda"
        title="Editar agenda"
        description="Ajuste título, janela de horário e o link de entrada. Só agendas ainda não iniciadas podem ser alteradas."
      />
      <div className="mt-8">
        <MeetingScheduleForm
          mode="edit"
          values={values}
          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          onSubmit={onSubmit}
          busy={busy}
          error={error}
          cancelHref={`/meetings/${id}`}
        />
      </div>
    </div>
  );
}
