# Struktur Folder Project — Aplikasi Gudang

Berikut adalah struktur direktori final dan penjelasan tanggung jawab masing-masing folder:

```text
warehouse-app/
├── apps/
│   ├── desktop/                         # Modul Aplikasi Desktop
│   │   ├── src/                         # Sumber kode React + TypeScript
│   │   │   ├── assets/                  # Aset gambar & statis UI
│   │   │   ├── components/              # Komponen UI bersama (ui, common, feedback)
│   │   │   ├── features/                # Modul berbasis fitur (auth, inventory, master-data, dll.)
│   │   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── layouts/                 # Layout aplikasi (sidebar, navbar, content)
│   │   │   ├── lib/                     # Inisialisasi library pihak ketiga (queryClient, axios)
│   │   │   ├── routes/                  # Konfigurasi routing frontend
│   │   │   ├── services/                # API client services
│   │   │   ├── stores/                  # State management global (Zustand)
│   │   │   ├── types/                   # Definisi tipe lokal
│   │   │   ├── utils/                   # Fungsi utilitas frontend
│   │   │   ├── App.tsx                  # Root React Component
│   │   │   └── main.tsx                 # Entrypoint React Vite
│   │   ├── src-tauri/                   # Backend Native Desktop Tauri v2
│   │   │   ├── capabilities/            # Hak akses & permissions Tauri
│   │   │   ├── icons/                   # Ikon aplikasi desktop
│   │   │   ├── src/                     # Sumber kode Rust Tauri
│   │   │   │   ├── commands/            # Tauri IPC native commands
│   │   │   │   ├── services/            # Background native services
│   │   │   │   ├── state/               # State manajemen runtime Tauri
│   │   │   │   ├── utils/               # Native utility functions
│   │   │   │   ├── lib.rs               # Library lifecycle & server orchestration
│   │   │   │   └── main.rs              # Desktop executable entrypoint
│   │   │   ├── Cargo.toml               # Manifest Rust Desktop crate
│   │   │   └── tauri.conf.json          # Konfigurasi desktop Tauri v2
│   │   ├── public/                      # Asset statis Vite
│   │   ├── package.json                 # Dependency package desktop
│   │   ├── tsconfig.json                # TypeScript compiler options
│   │   └── vite.config.ts               # Konfigurasi build Vite
│   │
│   └── api/                             # Modul REST API Server Rust + Axum
│       ├── src/                         # Sumber kode backend API
│       │   ├── config/                  # Pengaturan environment & app config
│       │   ├── database/                # Koneksi pool SQLx & migrasi MySQL
│       │   ├── middleware/              # Logging, auth, dan security headers
│       │   ├── modules/                 # Modul logika bisnis (auth, items, stock, dll.)
│       │   ├── routes/                  # Route handlers & endpoints API (/api/v1)
│       │   ├── errors/                  # Centralized error handling
│       │   ├── utils/                   # Standard JSON API responses
│       │   ├── app.rs                   # Router assembly & CORS setup
│       │   ├── lib.rs                   # Interface pustaka API (integrated mode)
│       │   └── main.rs                  # Standalone executable entrypoint
│       ├── migrations/                  # Skrip SQLx database migrations
│       ├── tests/                       # Automated integration tests
│       ├── Cargo.toml                   # Manifest Rust API crate
│       └── .env.example                 # Contoh variabel environment
│
├── packages/
│   └── contracts/                       # Shared schemas, DTOs, dan type definitions
│       ├── openapi/                     # Dokumen spesifikasi OpenAPI
│       ├── src/                         # Schema TypeScript yang dihasilkan
│       └── package.json                 # Package manifest contracts
│
├── database/                            # Desain fisik & seed database
│   ├── design/                          # Rancangan skema, ERD, dan PDM
│   ├── seeds/                           # Skrip data inisial
│   └── README.md                        # Panduan pengelolaan database
│
├── docs/                                # Dokumentasi sistem lengkap
│   ├── sitemap/                         # Peta situs aplikasi
│   ├── api/                             # Dokumentasi endpoint API
│   ├── database/                        # Catatan skema tabel
│   ├── architecture/                    # Panduan arsitektur sistem
│   └── development/                     # Panduan workflow pengembang
│
├── scripts/                             # Skrip automasi pengembangan
│   ├── dev/                             # Skrip bootstrap development
│   ├── build/                           # Skrip kompilasi dan release
│   └── database/                        # Skrip setup & seeding DB
│
├── Cargo.toml                           # Cargo Workspace Manifest
├── package.json                         # Root Monorepo Package Manifest
├── pnpm-workspace.yaml                  # pnpm Workspace Configuration
├── rust-toolchain.toml                  # Konfigurasi toolchain Rust stabil
├── .gitignore                           # Git ignore terpadu
└── README.md                            # Panduan utama project
```
