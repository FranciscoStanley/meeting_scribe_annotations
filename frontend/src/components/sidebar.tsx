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
  const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
    active
      ? 'bg-brand-mist text-brand-ink'
      : 'text-muted hover:bg-surface hover:text-ink'
  }`;

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
        {item.icon}
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.icon}
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const brand = (
    <Link href="/" className="group block px-1" onClick={() => setMobileOpen(false)}>
      <p className="font-display text-lg font-semibold tracking-tight text-ink transition group-hover:text-brand">
        Meeting Scribe
      </p>
      <p className="mt-0.5 text-xs leading-snug text-muted">
        Transcrição corporativa
      </p>
    </Link>
  );

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Principal">
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
      {/* Mobile top bar */}
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
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-hairline bg-panel px-4 py-5 shadow-lift transition-transform lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 hidden lg:block">{brand}</div>
        <div className="mb-6 lg:hidden">{brand}</div>
        {nav}
        <p className="mt-auto pt-8 text-[11px] leading-relaxed text-muted-soft">
          Teams & Meet · captura e transcrição
        </p>
      </aside>
    </>
  );
}
