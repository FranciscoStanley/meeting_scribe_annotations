'use client';

import { useRouter } from 'next/navigation';

type BackLinkProps = {
  /** Destino se não houver histórico do browser. */
  href?: string;
  label?: string;
};

export function BackLink({ href = '/', label = 'Voltar' }: BackLinkProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
          }
          router.push(href);
        }}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 6 9 12l6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </button>
    </div>
  );
}
