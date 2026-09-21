import { Suspense } from 'react';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-login-hero" aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-ink/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <section className="ms-login-brand space-y-6 lg:pr-6">
          <div className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand font-display text-lg font-bold text-white shadow-lift">
              MS
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink">
              Meeting Scribe
            </span>
          </div>
          <h1 className="max-w-lg font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Transcrição corporativa em tempo real
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            Agende Teams ou Meet, receba o alerta na hora e capture a conversa
            com falantes coloridos — direto no browser.
          </p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              Alerta SSE antes do horário
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              Áudio da aba ou microfone
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              Whisper local ou Docker
            </li>
          </ul>
        </section>

        <section className="ms-login-panel ms-panel mx-auto w-full max-w-md p-8 shadow-lift sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Acesso
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
            Entrar
          </h2>
          <p className="mt-2 text-sm text-muted">
            Proteja o workspace com e-mail/senha ou chave de API do servidor.
          </p>
          <div className="mt-8">
            <Suspense
              fallback={
                <div className="h-48 animate-pulse rounded-xl bg-surface" />
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
