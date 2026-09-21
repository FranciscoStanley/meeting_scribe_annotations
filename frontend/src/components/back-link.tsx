'use client';

import { useRouter } from 'next/navigation';

type BackLinkProps = {
  href?: string;
  label?: string;
};

export function BackLink({ href = '/', label = 'Voltar' }: BackLinkProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-hairline bg-panel px-3 py-2 text-sm font-semibold text-ink-soft shadow-soft transition hover:border-brand/25 hover:bg-brand-mist/40 hover:text-brand-ink"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(href);
      }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-muted transition group-hover:bg-brand-soft group-hover:text-brand-ink">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 6 9 12l6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </button>
  );
}
