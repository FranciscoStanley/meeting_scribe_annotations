'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const swaggerUrl =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : 'http://localhost:3001') + '/api/docs';

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  external?: boolean;
  icon: React.ReactNode;
};

function IconHome() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAgenda() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
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
        d="M8 3v4M16 3v4M4 10h16M12 14v4M10 16h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconApi() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    match: (p) => p === '/',
    icon: <IconHome />,
  },
  {
    href: '/meetings/new',
    label: 'Agenda',
    match: (p) => p === '/meetings/new',
    icon: <IconAgenda />,
  },
  {
    href: '/settings',
    label: 'Calendário',
    match: (p) => p.startsWith('/settings'),
    icon: <IconCalendar />,
  },
  {
    href: swaggerUrl,
    label: 'API',
    match: () => false,
    external: true,
    icon: <IconApi />,
  },
];

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = item.match(pathname);
  const className = `ms-nav-item ${
    active ? 'ms-nav-item-active' : 'ms-nav-item-idle'
  }`;

  const content = (
    <>
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand"
          aria-hidden
        />
      ) : null}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-brand-soft text-brand-ink' : 'bg-surface text-muted'
        }`}
      >
        {item.icon}
      </span>
      {item.label}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        title="Documentação OpenAPI (Swagger)"
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = (
    <Link
      href="/"
      className="group flex items-start gap-3"
      onClick={() => setMobileOpen(false)}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold tracking-tight text-white shadow-soft transition group-hover:bg-brand-ink">
        MS
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block font-display text-base font-semibold tracking-tight text-ink transition group-hover:text-brand">
          Meeting Scribe
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">
          Transcrição corporativa
        </span>
      </span>
    </Link>
  );

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Principal">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
        Menu
      </p>
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          item={item}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      ))}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-hairline/80 bg-panel/95 px-4 py-3 backdrop-blur-md lg:hidden">
        {brand}
        <button
          type="button"
          className="ms-btn ms-btn-sm ms-btn-secondary"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <IconClose /> : <IconMenu />}
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-hairline bg-panel/98 px-4 py-6 shadow-lift backdrop-blur-sm transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:bg-panel lg:shadow-none lg:backdrop-blur-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 hidden lg:block">{brand}</div>
        <div className="mb-8 lg:hidden">{brand}</div>
        {nav}
        <div className="mt-auto space-y-3 border-t border-hairline pt-5">
          <p className="px-1 text-[11px] leading-relaxed text-muted-soft">
            Teams & Meet · captura e transcrição em tempo real
          </p>
          <button
            type="button"
            className="ms-btn-ghost w-full justify-start px-3 text-sm"
            onClick={() => {
              void (async () => {
                await fetch('/api/auth/session', { method: 'DELETE' });
                window.location.href = '/login';
              })();
            }}
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
