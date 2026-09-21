'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { api, type AuthStatusDto } from '@/lib/api';

export function LoginForm() {
  const search = useSearchParams();
  const nextPath = search.get('next') || '/';

  const [status, setStatus] = useState<AuthStatusDto | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await api.authStatus();
        if (!cancelled) setStatus(s);
      } catch {
        if (!cancelled) {
          setStatus({
            openMode: true,
            credentialsConfigured: false,
            tokenConfigured: false,
          });
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hint = useMemo(() => {
    if (!status) return '';
    if (status.credentialsConfigured) {
      return 'Use o e-mail e a senha definidos em APP_AUTH_* no servidor.';
    }
    if (status.tokenConfigured) {
      return 'Ambiente com chave de API: informe a chave no campo senha.';
    }
    return 'Ambiente local aberto — entre para acessar o workspace.';
  }, [status]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api.login({
        email: email.trim() || undefined,
        password: password || (status?.openMode ? 'local' : ''),
      });
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.accessToken,
          email: result.email,
        }),
      });
      if (!sessionRes.ok) throw new Error('Falha ao gravar sessão');
      toast.success('Bem-vindo ao Meeting Scribe');
      const dest = nextPath.startsWith('/') ? nextPath : '/';
      window.location.assign(dest);
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.includes('401')
          ? 'Credenciais inválidas'
          : 'Não foi possível entrar. Verifique a API e tente de novo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="ms-login-form space-y-5">
      <div>
        <label htmlFor="login-email" className="ms-label">
          E-mail
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          className="ms-input"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={Boolean(status?.credentialsConfigured)}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="ms-label">
          {status?.tokenConfigured && !status.credentialsConfigured
            ? 'Chave de acesso'
            : 'Senha'}
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="ms-input"
          placeholder={
            status?.openMode ? 'Opcional em modo local' : '••••••••'
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!status?.openMode}
        />
      </div>

      <p className="text-sm leading-relaxed text-muted">{booting ? '…' : hint}</p>

      <button
        type="submit"
        className="ms-btn-primary w-full py-3 text-base"
        disabled={loading || booting}
      >
        {loading ? 'Entrando…' : 'Entrar no workspace'}
      </button>
    </form>
  );
}
