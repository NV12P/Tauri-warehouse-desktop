# Panduan Pengembang (Development Guide)

Dokumen ini menjelaskan langkah demi langkah cara menyiapkan environment, menjalankan mode pengembangan, dan menguji aplikasi.

## 1. Prasyarat Sistem
- **Node.js**: v20.x atau lebih baru (Disarankan Node.js LTS, terpasang v22.x).
- **pnpm**: v9.x / v10.x / v12.x (`npm i -g pnpm`).
- **Rust & Cargo**: Toolchain `stable` (MSVC toolchain pada Windows).
- **C++ Build Tools**: Visual Studio Build Tools (C++ Desktop Development workload) untuk Tauri & kompilasi native.
- **MySQL Server**: MySQL 8.x (opsional pada tahap scaffold awal).

## 2. Instalasi Dependensi
Jalankan di root workspace:
```bash
pnpm install
```

## 3. Menjalankan Aplikasi

### Mode 1: Desktop Application Terintegrasi (Rekomendasi)
Menjalankan frontend React sekaligus in-process Axum API server:
```bash
pnpm dev:desktop
# atau:
pnpm --filter @gudang/desktop tauri dev
```

### Mode 2: Standalone API Server
Jika hanya ingin menguji REST API atau backend:
```bash
cargo run -p gudang-api
```
Server akan aktif di `http://127.0.0.1:4317`.

### Mode 3: Frontend Only (Web Browser)
```bash
pnpm dev
# atau:
pnpm --filter @gudang/desktop dev
```
Buka peramban di `http://localhost:1420`.

## 4. Linting, Formatting & Type Checking
- **Typecheck TypeScript**:
  ```bash
  pnpm typecheck
  ```
- **Build Frontend**:
  ```bash
  pnpm --filter @gudang/desktop build
  ```
- **Format Rust Code**:
  ```bash
  cargo fmt --check
  cargo fmt
  ```
- **Lint Rust Code**:
  ```bash
  cargo clippy --workspace
  ```
- **Check Rust Compilation**:
  ```bash
  cargo check --workspace
  ```

## 5. Menyiapkan MySQL Database
1. Buat database baru di MySQL:
   ```sql
   CREATE DATABASE gudang_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Buat file `.env` di direktori `apps/api/` (atau salin dari `.env.example`):
   ```env
   DATABASE_URL=mysql://root:password_anda@127.0.0.1:3306/gudang_db
   API_HOST=127.0.0.1
   API_PORT=4317
   RUST_LOG=info
   ```
3. Restart API server atau jalankan ulang Tauri Desktop.
4. Periksa endpoint `GET http://127.0.0.1:4317/api/v1/health/db` untuk memverifikasi koneksi nyata.
