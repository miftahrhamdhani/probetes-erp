# Probetes ERP

Foundation project untuk Probetes ERP tahap awal: monorepo dengan frontend Next.js, backend NestJS, shared packages, dan halaman awal/home launcher ERP.

## Struktur

```txt
probetes-erp/
├── apps/
│   ├── web/        # Frontend Next.js + React + TypeScript + Tailwind CSS
│   └── api/        # Backend NestJS + TypeScript skeleton
├── packages/
│   ├── ui/         # Shared UI component nanti
│   ├── types/      # Shared types
│   └── config/     # Shared config
├── docs/
└── README.md
```

## Prasyarat

- Node.js 20 atau lebih baru
- pnpm 9 atau lebih baru

Aktifkan Corepack bila diperlukan:

```bash
corepack enable
```

## Instalasi

```bash
pnpm install
```

## Menjalankan frontend

```bash
pnpm dev:web
```

Frontend berjalan di:

```txt
http://localhost:3000
```

## Menjalankan backend

```bash
pnpm dev:api
```

Backend berjalan di:

```txt
http://localhost:3001
```

Health check:

```txt
http://localhost:3001/health
```

Response yang diharapkan:

```json
{
  "status": "ok",
  "service": "probetes-api"
}
```

## Menjalankan semua app

```bash
pnpm dev
```

## Verifikasi

```bash
pnpm typecheck
pnpm build
```

## Scope tahap ini

Yang sudah dibuat:

- Monorepo dasar.
- `apps/web` dengan halaman awal ERP responsif.
- `apps/api` dengan route health check sederhana.
- Shared packages awal untuk `ui`, `types`, dan `config`.

Yang belum/tidak dibuat pada tahap ini:

- Database/ORM.
- Login/authentication.
- Dashboard marketing.
- Business logic ERP.
- Integrasi API frontend.

## Rekomendasi commit

Jika hasil sudah stabil, jalankan manual:

```bash
git add .
git commit -m "chore: initialize Probetes ERP monorepo foundation"
```
