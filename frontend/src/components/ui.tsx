import Link from 'next/link';

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.35rem] sm:leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
            {description}
          </p>
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
  const dot: Record<string, string> = {
    SCHEDULED: 'bg-muted-soft',
    AWAITING_JOIN: 'bg-live',
    LIVE: 'bg-brand',
    COMPLETED: 'bg-ok',
    CANCELLED: 'bg-danger',
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
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide ${
        map[status] ?? 'bg-surface-muted text-muted'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-sm ${dot[status] ?? 'bg-muted-soft'}`}
        aria-hidden
      />
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
    <div className="px-6 py-16 text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist text-brand"
        aria-hidden
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M8 3v4M16 3v4M4 10h16"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {children ? (
        <div className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          {children}
        </div>
      ) : null}
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
    <div
      className={`rounded-2xl border px-4 py-3.5 text-sm leading-relaxed shadow-soft ${tones[tone]}`}
    >
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
