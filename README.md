# Aplikasi Gudang

Aplikasi desktop modern untuk manajemen inventaris barang dan material konstruksi bangunan yang tersimpan di gudang, dibangun dengan arsitektur Monorepo menggunakan Tauri v2, React, TypeScript, Rust Axum, dan MySQL.

---

## 1. Teknologi yang Digunakan

| Lapisan | Teknologi |
|---|---|
| **Desktop Framework** | Tauri v2 |
| **Frontend** | React 19 + TypeScript (Strict Mode) |
| **Build Tool Frontend** | Vite |
| **Desktop Native** | Rust |
| **API Backend** | Rust + Axum (REST API, Dual-Mode) |
| **Database Driver** | SQLx (MySQL 8.x, Connection Pooling) |
| **Package Manager** | pnpm (pnpm workspace) |
| **Rust Workspace** | Cargo Workspace (Resolver v2) |
| **Arsitektur Repository** | Monorepo |

---

## 2. Arsitektur Project

Project ini menggunakan arsitektur **Monorepo** yang terbagi menjadi:
- `apps/desktop`: Aplikasi antarmuka desktop (React + Tauri v2 native core).
- `apps/api`: REST API server berbasis Rust + Axum dengan mode ganda (*integrated* di dalam Tauri dan *standalone binary*).
- `packages/contracts`: Definisi tipe data bersama dan skema kontrak API.
- `database/`: Dokumentasi skema ERD/PDM dan seed awal.
- `docs/`: Dokumentasi arsitektur sistem dan panduan pengembang.
- `scripts/`: Skrip otomasi pembangunan dan pengujian.

Frontend terisolasi penuh dan tidak memiliki akses langsung ke database MySQL. Semua transaksi data diarahkan melalui REST API lokal (`http://127.0.0.1:4317`).

---

## 3. Prasyarat Instalasi

Pastikan komputer telah terinstal:
- **Node.js**: v20.x atau lebih baru (terverifikasi pada v22.18.0)
- **pnpm**: v9+ (terverifikasi pada v12.18.0)
- **Rust**: Toolchain stable (terverifikasi pada rustc 1.99.1 MSVC)
- **C++ Build Tools**: Visual Studio Build Tools dengan opsi C++ Desktop Development (diperlukan untuk Tauri di Windows)
- **MySQL Server** (opsional pada tahap inisialisasi): MySQL 8.x

---

## 4. Cara Menjalankan Project

### A. Instalasi Dependensi
```bash
pnpm install
```

### B. Menjalankan Mode Desktop (Integrated Mode)
Tauri akan membuka jendela aplikasi desktop dan menjalankan server Axum terintegrasi di background pada port `4317`:
```bash
pnpm dev:desktop
# atau
pnpm --filter @gudang/desktop tauri dev
```

### C. Menjalankan Standalone API Server
Berguna untuk pengujian REST API terpisah tanpa membuka GUI desktop:
```bash
cargo run -p gudang-api
```
Server aktif di `http://127.0.0.1:4317`.

Endpoint yang tersedia:
- `GET http://127.0.0.1:4317/api/v1/health`: Memeriksa ketersediaan API server.
- `GET http://127.0.0.1:4317/api/v1/health/db`: Memeriksa konektivitas riil ke database MySQL.

### D. Menjalankan Frontend Saja (Web Mode)
```bash
pnpm dev
```
Buka browser pada `http://localhost:1420`.

---

## 5. Cara Build Aplikasi

- **Typecheck TypeScript**:
  ```bash
  pnpm typecheck
  ```
- **Build Frontend**:
  ```bash
  pnpm --filter @gudang/desktop build
  ```
- **Build Desktop Binary (Production Installer/Bundle)**:
  ```bash
  pnpm build:desktop
  ```
- **Kompilasi Workspace Rust**:
  ```bash
  cargo check --workspace
  ```

---

## 6. Konfigurasi Database (MySQL)

1. Buat database di MySQL:
   ```sql
   CREATE DATABASE gudang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Buat file `.env` di `apps/api/` berdasarkan template `.env.example`:
   ```env
   DATABASE_URL=mysql://root:password@127.0.0.1:3306/gudang_db
   API_HOST=127.0.0.1
   API_PORT=4317
   RUST_LOG=info
   ```
3. Verifikasi koneksi melalui endpoint `GET http://127.0.0.1:4317/api/v1/health/db`.
   Jika MySQL belum aktif, endpoint akan mengembalikan respon jujur `503 Service Unavailable`.
