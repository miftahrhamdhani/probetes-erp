# Frontend Launcher

Halaman awal Probetes ERP dibuat sebagai launcher modul dengan tampilan mendekati referensi visual.

## Komponen

```txt
page.tsx
├── AppHeader
│   └── ProbetesLogo
├── HeroBanner
└── ModuleGrid
    └── ModuleCard
```

## Data module

Data modul disimpan di `apps/web/src/config/modules.ts` sebagai typed array configuration. Tipe shared berada di `packages/types/src/modules.ts`.

## Styling

- Tailwind CSS digunakan untuk seluruh layout dan visual.
- Background halaman memakai abu-abu sangat muda, bukan putih polos.
- Header memakai warna mendekati `#f6f7f9`.
- Hero menggunakan rounded corner, border halus, dan shadow lembut.
- Ilustrasi sisi kanan hero dibuat dengan HTML/CSS tanpa image eksternal.

## Responsif

Grid module memakai pola:

- 1 kolom di mobile.
- 2 kolom di tablet.
- 3 kolom di desktop.
