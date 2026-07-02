# Arsitektur Probetes ERP

Probetes ERP menggunakan monorepo agar frontend, backend, dan shared package bisa berkembang dengan batas yang jelas.

## Batas aplikasi

- `apps/web`: antarmuka pengguna berbasis Next.js. Untuk tahap ini hanya berisi home launcher ERP.
- `apps/api`: backend NestJS. Untuk tahap ini hanya skeleton dan health check.
- `packages/types`: kontrak TypeScript yang bisa dipakai lintas app.
- `packages/ui`: komponen UI generik untuk kebutuhan lintas app di masa depan.
- `packages/config`: konfigurasi bersama untuk TypeScript/Tailwind/tooling.

## Prinsip tahap awal

- UI launcher bersifat product-specific, sehingga komponen seperti `AppHeader`, `HeroBanner`, dan `ModuleGrid` tetap berada di `apps/web`.
- Package `ui` belum diisi komponen brand-specific untuk menghindari abstraksi terlalu dini.
- Backend belum memiliki database, auth, atau modul bisnis.
