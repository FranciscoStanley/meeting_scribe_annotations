import Link from 'next/link';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-base leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`ms-panel ${className}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-surface-muted text-ink-soft',
    AWAITING_JOIN: 'bg-live-soft text-live',
    LIVE: 'bg-brand-soft text-brand-ink',
    COMPLETED: 'bg-ok-soft text-ok',
    CANCELLED: 'bg-danger-soft text-danger',
  };
  const labels: Record<string, string> = {
    SCHEDULED: 'Agendada',
    AWAITING_JOIN: 'Aguardando',
    LIVE: 'Ao vivo',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${
        map[status] ?? 'bg-surface-muted text-muted'
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-display text-lg font-medium text-ink">{title}</p>
      {children ? <div className="mt-2 text-sm text-muted">{children}</div> : null}
    </div>
  );
}

export function AlertBanner({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'ok' | 'warn' | 'danger';
  children: React.ReactNode;
}) {
  const tones = {
    info: 'border-hairline bg-brand-mist text-ink-soft',
    ok: 'border-ok/20 bg-ok-soft text-ok',
    warn: 'border-live/25 bg-live-soft text-live',
    danger: 'border-danger/25 bg-danger-soft text-danger',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-semibold text-brand hover:text-brand-ink hover:underline"
    >
      {children}
    </Link>
  );
}
