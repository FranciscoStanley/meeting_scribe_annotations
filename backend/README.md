# Backend — Meeting Scribe

API NestJS com Clean Architecture.

```
backend/
├── prisma/                 # Schema e migrations
├── src/
│   ├── domain/             # Entidades, ports, domain services
│   ├── application/        # Use cases
│   ├── infrastructure/     # Prisma, calendários, STT, scheduler
│   ├── presentation/       # HTTP, WebSocket
│   ├── modules/            # Nest modules
│   ├── app.module.ts
│   └── main.ts
├── .env.example
└── package.json            # @meeting-scribe/backend
```

```powershell
npm run dev:backend
# ou, a partir desta pasta:
npm run dev -w @meeting-scribe/backend
```

Porta padrão: **3001** · Swagger: `/api/docs`
