# AGENTS.md — General Guidelines for AI Coding Agents

## 1. Project Overview
**Aplikasi Gudang** adalah aplikasi desktop modern untuk manajemen inventaris dan material konstruksi bangunan, dengan rencana penambahan modul POS (Kasir) di tahap berikutnya. Aplikasi mengadopsi arsitektur Monorepo dengan frontend React (TypeScript) dan backend Rust (Tauri v2 + Axum + MySQL 8.x via SQLx).

## 2. Technology Stack
- **Desktop Framework**: Tauri v2
- **Frontend**: React 19, TypeScript (Strict Mode), Vite
- **Package Manager**: pnpm (pnpm workspace)
- **Desktop Native Backend**: Rust (Tauri commands, lifecycle management)
- **API Backend**: Rust + Axum (REST API, standalone & integrated mode)
- **Database Driver**: SQLx (MySQL 8.x, Connection Pooling)
- **Cargo Workspace**: Resolver v2

## 3. Project Structure
```text
warehouse-app/
├── apps/
│   ├── desktop/         # Frontend React + Tauri v2 (gudang-desktop)
│   └── api/             # REST API Server Rust + Axum (gudang-api)
├── packages/
│   └── contracts/       # Shared TypeScript types & OpenAPI contracts
├── database/            # Skema ERD, PDM, dan seed database
├── docs/                # Dokumentasi arsitektur dan panduan pengembang
├── scripts/             # Otomasi dev, build, dan database
├── Cargo.toml           # Root Cargo workspace manifest
├── pnpm-workspace.yaml  # Root pnpm workspace manifest
└── package.json         # Root package manager & task scripts
```

## 4. Architecture Rules
1. **Layered & Feature-Based Architecture**: Kode dibagi secara terisolasi per fitur (`features/` di frontend, `modules/` di backend API).
2. **Strict Boundary**: Frontend dilarang keras mengakses MySQL secara langsung. Seluruh interaksi data wajib melalui Axum REST API.
3. **Dual-Mode Axum**:
   - **Integrated Mode**: Berjalan di dalam proses Tauri desktop (127.0.0.1:4317) dengan graceful shutdown saat jendela aplikasi ditutup.
   - **Standalone Mode**: Dapat dijalankan secara terpisah menggunakan binary `cargo run -p gudang-api`.
4. **Shared State**: Gunakan `AppState` di Axum untuk membagikan connection pool database dan konfigurasi ke seluruh router.

## 5. Naming & Coding Conventions
- **Rust**: `snake_case` untuk function dan module, `PascalCase` untuk struct dan enum, `SCREAMING_SNAKE_CASE` untuk konstanta.
- **TypeScript**: `camelCase` untuk variabel dan fungsi, `PascalCase` untuk komponen dan interface, `kebab-case` untuk nama folder fitur dan file komponen.
- **Strict Typing**: Tidak diperbolehkan memakai `any` di TypeScript tanpa alasan teknis kuat dan persetujuan.

## 6. Error Handling Conventions
- **Rust**: Gunakan centralized error handling (`AppError` dengan `thiserror`). Semua response API wajib menggunakan struktur konsisten `ApiResponse<T>`:
  ```json
  {
    "success": true | false,
    "message": "...",
    "data": ... | null
  }
  ```
- **Database Availability**: Jika MySQL tidak terhubung, endpoint `/api/v1/health/db` wajib mengembalikan status HTTP `503 Service Unavailable`. Jangan pernah memalsukan status koneksi database.

## 7. Security Rules
- API server diwajibkan bind ke `127.0.0.1`, bukan `0.0.0.0`.
- Batasi origin CORS ke `tauri://localhost`, `http://tauri.localhost`, dan `http://localhost:1420`.
- Jangan menyimpan kredensial atau secret di kode frontend.
- Gunakan application data directory yang aman untuk penyimpanan data lokal desktop.

## 8. Scope Restrictions (SANGAT PENTING)
AI Agent dilarang mengimplementasikan fitur bisnis di luar scope scaffold tahap pertama tanpa instruksi eksplisit:
- DILARANG membuat CRUD barang atau master kategori sekarang.
- DILARANG membuat transaksi stok (barang masuk/keluar/koreksi/opname).
- DILARANG membuat modul autentikasi JWT / user management lengkap.
- DILARANG membuat sistem transaksi kasir / POS.
- DILARANG membuat dummy business logic yang seolah-olah sudah berfungsi.
