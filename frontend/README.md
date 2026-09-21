# Frontend — Meeting Scribe

Aplicação Next.js (App Router) + Tailwind.

```
frontend/
├── src/
│   ├── app/            # Rotas (dashboard, settings, captura)
│   ├── components/     # UI
│   ├── hooks/          # Alertas SSE, captura de áudio
│   └── lib/            # Cliente HTTP da API
├── .env.example
└── package.json        # @meeting-scribe/frontend
```

```powershell
npm run dev:frontend
# ou:
npm run dev -w @meeting-scribe/frontend
```

Porta padrão: **3000** · API esperada em `NEXT_PUBLIC_API_URL` (padrão `http://localhost:3001`).
