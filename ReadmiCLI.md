# TASK: INITIALIZE PROJECT SCAFFOLD — APLIKASI GUDANG

Kamu bertindak sebagai Senior Software Architect dan Senior Full-Stack Engineer yang bertanggung jawab menyiapkan fondasi project desktop application bernama **Aplikasi Gudang**.

Tugasmu adalah menginisialisasi project berdasarkan arsitektur dan ketentuan teknis di bawah ini.

Jangan langsung membuat seluruh fitur aplikasi. Fokus hanya pada project initialization, struktur folder, konfigurasi workspace, integrasi teknologi, dan dokumentasi dasar.

---

# 1. PROJECT OVERVIEW

Nama project: Aplikasi Gudang

Tujuan:
Membangun aplikasi desktop untuk mengelola inventaris barang/material konstruksi bangunan yang tersimpan di gudang.

Aplikasi ini direncanakan memiliki dua bagian utama:

1. Aplikasi Gudang.
2. Aplikasi Kasir.

Prioritas pengembangan saat ini adalah Aplikasi Gudang. Fitur Kasir baru akan dikembangkan setelah Aplikasi Gudang selesai dan stabil.

Aplikasi nantinya mendukung beberapa akun pengguna dengan hak akses berbeda.

## Keputusan arsitektur yang sudah ditetapkan

| Komponen | Teknologi |
|---|---|
| Desktop Framework | Tauri v2 |
| Frontend | React |
| Programming Language Frontend | TypeScript |
| Build Tool | Vite |
| Desktop Backend | Rust |
| API Backend | Rust + Axum |
| Database Driver | SQLx |
| Database | MySQL 8.x |
| API Architecture | REST API |
| Package Manager Frontend | pnpm |
| Rust Workspace | Cargo Workspace |
| Repository Architecture | Monorepo |
| AI Development Assistance | CLI Coding Agent |

Jangan mengganti teknologi tersebut tanpa persetujuan.

## Deployment awal

Aplikasi pada tahap pertama akan digunakan pada satu komputer utama.

Komputer tersebut menjalankan:
- Tauri Desktop Application.
- React Frontend.
- Axum API Server.
- MySQL Database.

Axum API Server berjalan di dalam proses aplikasi Tauri dan hanya menerima koneksi lokal melalui 127.0.0.1.

Namun, struktur API harus memungkinkan Axum dijalankan sebagai standalone server pada pengembangan dan deployment mendatang.

Arsitektur harus memungkinkan pemindahan API Server dan MySQL ke komputer server terpisah di masa mendatang tanpa perlu menulis ulang business logic.

## Sistem pengguna

Aplikasi dirancang untuk multi-user dengan role awal:

- admin_gudang
- admin_kasir

Implementasi fitur kasir dan sistem permission granular belum termasuk dalam task ini.

---

# 2. ARSITEKTUR PROJECT

Gunakan pendekatan:

- Monorepo Architecture.
- Layered Architecture.
- Feature-Based Architecture.
- REST API.
- Repository Pattern pada API Backend.

Pembagian tanggung jawab:

## Frontend — React + TypeScript

Bertanggung jawab terhadap:
- User Interface.
- Navigasi halaman.
- Form.
- Komponen UI.
- State management.
- Komunikasi dengan REST API.

Frontend tidak boleh mengakses MySQL secara langsung.

## Desktop Backend — Tauri + Rust

Bertanggung jawab terhadap:
- Integrasi native desktop.
- Pengelolaan direktori aplikasi.
- File system.
- Pemilihan gambar.
- Pengelolaan lifecycle API Server.
- Komunikasi dengan fitur native Tauri.

## API Backend — Rust + Axum

Bertanggung jawab terhadap:
- REST API.
- Business logic.
- Authentication dan authorization pada tahap implementasi berikutnya.
- Request validation.
- Database access melalui SQLx.
- Response handling.
- Error handling.

API harus memiliki library interface dan standalone executable.

Buat fungsi yang memungkinkan Tauri menjalankan Axum tanpa menjalankan proses server terpisah secara manual.

Gunakan shared application state agar koneksi database dan konfigurasi dapat digunakan oleh seluruh router.

## Database — MySQL

Bertanggung jawab menyimpan seluruh data aplikasi.

Gunakan:
- InnoDB.
- utf8mb4.
- SQLx.
- Connection pooling.
- SQLx migrations.

Jangan membuat koneksi MySQL langsung dari React maupun Tauri Frontend.

---

# 3. STRUKTUR FOLDER TARGET

Buat struktur project dengan mengikuti rancangan berikut.

project-aplikasi-gudang/

├── apps/
│   ├── desktop/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   ├── common/
│   │   │   │   └── feedback/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── master-data/
│   │   │   │   │   ├── items/
│   │   │   │   │   └── categories/
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── stock-in/
│   │   │   │   │   ├── stock-out/
│   │   │   │   │   ├── stock-transactions/
│   │   │   │   │   └── stock-corrections/
│   │   │   │   ├── stock-opname/
│   │   │   │   ├── reports/
│   │   │   │   ├── users/
│   │   │   │   ├── account/
│   │   │   │   └── kasir/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── lib/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── src-tauri/
│   │   │   ├── capabilities/
│   │   │   ├── icons/
│   │   │   ├── src/
│   │   │   │   ├── commands/
│   │   │   │   ├── services/
│   │   │   │   ├── state/
│   │   │   │   ├── utils/
│   │   │   │   ├── lib.rs
│   │   │   │   └── main.rs
│   │   │   ├── Cargo.toml
│   │   │   └── tauri.conf.json
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── database/
│       │   ├── middleware/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── categories/
│       │   │   ├── items/
│       │   │   ├── stock_transactions/
│       │   │   ├── stock_corrections/
│       │   │   ├── stock_movements/
│       │   │   ├── stock_opnames/
│       │   │   ├── dashboard/
│       │   │   ├── reports/
│       │   │   ├── exports/
│       │   │   ├── users/
│       │   │   └── kasir/
│       │   ├── routes/
│       │   ├── errors/
│       │   ├── utils/
│       │   ├── app.rs
│       │   ├── lib.rs
│       │   └── main.rs
│       ├── migrations/
│       ├── tests/
│       ├── Cargo.toml
│       └── .env.example
│
├── packages/
│   └── contracts/
│       ├── openapi/
│       ├── src/
│       │   ├── generated/
│       │   └── schemas/
│       └── package.json
│
├── database/
│   ├── design/
│   ├── seeds/
│   └── README.md
│
├── docs/
│   ├── sitemap/
│   ├── api/
│   ├── database/
│   ├── architecture/
│   └── development/
│
├── scripts/
│   ├── dev/
│   ├── build/
│   └── database/
│
├── Cargo.toml
├── package.json
├── pnpm-workspace.yaml
├── rust-toolchain.toml
├── .gitignore
└── README.md

Buat file dan folder yang diperlukan untuk scaffold.

Untuk folder fitur yang belum diimplementasikan, cukup siapkan struktur dan README.md jika diperlukan. Jangan membuat implementasi fitur palsu hanya untuk mengisi folder.

---

# 4. DETAIL IMPLEMENTASI TAHAP 1

## A. Inisialisasi Monorepo

Buat:
- Root package.json.
- pnpm-workspace.yaml.
- Root Cargo.toml.
- rust-toolchain.toml.
- .gitignore.
- README.md.

Gunakan Cargo Workspace dengan resolver versi 2.

Masukkan crate berikut sebagai anggota workspace:
- apps/api.
- apps/desktop/src-tauri.

Konfigurasikan pnpm workspace untuk desktop dan packages/contracts.

Pastikan konfigurasi workspace dapat berjalan pada Windows.

Jangan membuat package manager atau sistem build alternatif tanpa alasan teknis yang jelas.

## B. Setup Tauri v2 + React + TypeScript

Inisialisasi Tauri v2 dengan React, TypeScript, dan Vite.

Pastikan:
- Aplikasi dapat dibuka dalam development mode.
- React berhasil dirender.
- TypeScript dapat melakukan type checking.
- Tauri dapat memanggil satu contoh native command sederhana.
- Struktur folder mengikuti rancangan.
- Tidak ada dependency yang tidak diperlukan.

Buat tampilan awal sederhana yang menunjukkan:

Aplikasi Gudang

Status:
- Desktop Application: Running.
- API Server: Checking.
- Database: Checking.

Jangan membuat desain seluruh halaman aplikasi pada tahap ini.

## C. Setup Axum API Backend

Buat crate Rust di apps/api.

Gunakan dependency yang sesuai dan kompatibel, seperti:
- axum.
- tokio.
- serde.
- serde_json.
- sqlx.
- dotenvy.
- thiserror atau anyhow.
- tower-http.
- tracing.
- tracing-subscriber.

Gunakan versi stabil yang kompatibel dan hindari dependency yang tidak dibutuhkan.

Buat pemisahan:
- app.rs.
- lib.rs.
- main.rs.
- config.
- database.
- routes.
- errors.
- utils.

### API endpoints tahap awal

Implementasikan hanya:

GET /api/v1/health

Tujuan:
Memeriksa apakah API Server berjalan.

GET /api/v1/health/db

Tujuan:
Memeriksa konektivitas MySQL.

Response harus menggunakan format JSON yang konsisten.

Contoh health response:

{
  "success": true,
  "message": "API server is running",
  "data": {
    "status": "ok"
  }
}

Untuk database health check:
- Lakukan pemeriksaan koneksi database yang sesungguhnya.
- Jangan mengembalikan status connected hanya karena API Server berjalan.
- Gunakan HTTP status yang tepat jika database tidak tersedia.
- Jangan mengekspos connection string atau kredensial database.

### Standar kode API

Gunakan:
- Shared application state.
- Centralized error handling.
- Consistent JSON response.
- Structured logging.
- Modular router.
- Environment-based configuration.

Siapkan repository dan service layer sebagai pola untuk modul mendatang.

Namun, jangan membuat CRUD barang atau kategori sekarang.

## D. Integrasi Axum dengan Tauri

Ini merupakan salah satu bagian terpenting dari tahap pertama.

Axum harus bisa dijalankan dengan dua mode.

### Mode 1: Integrated Mode

Tauri menjalankan Axum melalui library API.

Ketika aplikasi desktop dibuka:
1. Tauri melakukan inisialisasi.
2. Konfigurasi aplikasi dibaca.
3. Axum API Server dijalankan.
4. API bind ke 127.0.0.1 dengan port yang dapat dikonfigurasi.
5. React dapat mengakses API melalui HTTP.
6. Ketika aplikasi ditutup, server harus dihentikan dengan graceful shutdown.

Jangan menjalankan Axum sebagai child process terpisah jika tidak diperlukan.

Gunakan mekanisme async runtime Tauri yang kompatibel dengan Tokio dan Axum.

Pastikan tidak ada pemblokiran main thread.

Gunakan port default 4317, tetapi sediakan konfigurasi agar dapat diubah.

Hindari port collision dan tampilkan error yang jelas apabila port sudah digunakan.

### Mode 2: Standalone Mode

apps/api harus tetap bisa dijalankan sebagai server mandiri menggunakan binary main.rs.

Contoh perintah:

cargo run -p gudang-api

Standalone Mode berguna untuk:
- Testing REST API.
- Pengembangan backend.
- Debugging.
- Persiapan deployment server terpisah.

Pastikan Integrated Mode dan Standalone Mode menggunakan router, service, konfigurasi, dan business logic yang sama.

### Keamanan komunikasi lokal

- Bind API ke 127.0.0.1, bukan 0.0.0.0.
- Jangan menggunakan CORS wildcard dengan credentials.
- Batasi origin sesuai kebutuhan Tauri.
- Jangan menaruh secret di React.
- Jangan mengekspos endpoint sensitif tanpa autentikasi ketika modul autentikasi nantinya dibuat.

## E. Setup MySQL + SQLx

Siapkan konfigurasi database.

Buat .env.example dengan variabel:

DATABASE_URL=
API_HOST=127.0.0.1
API_PORT=4317
RUST_LOG=info

Jangan membuat file .env dengan password database palsu.

Tambahkan .env ke .gitignore.

Buat:
- Database connection module.
- SQLx MySQL connection pool.
- Database configuration.
- Error handling koneksi.
- Health check database.

Gunakan MySQL 8.x.

Buat direktori migrations dan siapkan konfigurasi SQLx migrations.

Jangan membuat seluruh tabel aplikasi sekarang karena perancangan ERD dan PDM akan dikerjakan pada tahap berikutnya.

Jika MySQL belum tersedia:
- Tetap selesaikan scaffold.
- Dokumentasikan cara menyiapkan MySQL.
- Jangan mengklaim database berhasil terhubung jika belum diuji.
- Berikan instruksi yang jelas untuk melakukan verifikasi ketika MySQL tersedia.

## F. Frontend Library dan Struktur Dasar

Siapkan library berikut jika memang diperlukan untuk scaffold:

- React Router.
- TanStack Query.
- Zustand.
- Axios.
- React Hook Form.
- Zod.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.

Tidak perlu langsung mengimplementasikan seluruh fitur library.

Buat:
- Router dasar.
- API client.
- Query client.
- Global store dasar.
- Global error handling.
- Layout awal.
- Status indicator untuk API dan database.

Pisahkan server state dan client state.

Konfigurasi API base URL melalui environment configuration yang sesuai untuk Vite.

## G. Tauri Native Commands

Buat satu contoh command sederhana untuk memastikan komunikasi React dan Rust berjalan.

Siapkan struktur:
- commands/
- services/
- state/
- utils/

Siapkan konfigurasi penyimpanan data aplikasi menggunakan application data directory Tauri.

Belum perlu membuat sistem upload gambar barang.

Jangan memberikan permission filesystem yang terlalu luas. Gunakan capabilities sesuai kebutuhan.

---

# 5. DOKUMENTASI DAN INSTRUKSI AI CODING AGENT

Buat dokumentasi berikut:

## Root README.md

Berisi:
- Deskripsi project.
- Teknologi yang digunakan.
- Arsitektur.
- Persyaratan instalasi.
- Cara menjalankan project.
- Cara build aplikasi.
- Konfigurasi database.

## AGENTS.md

Berisi aturan umum untuk seluruh AI Coding Agent.

Minimal mencakup:
- Project overview.
- Technology stack.
- Project structure.
- Architecture rules.
- Naming conventions.
- Error handling conventions.
- Database access rules.
- Security rules.
- Testing requirements.
- Larangan membuat fitur di luar scope tanpa persetujuan.

## CLAUDE.md

Berisi instruksi untuk Claude Code.

Jika memungkinkan, jadikan AGENTS.md sebagai sumber aturan utama dan jangan menduplikasi seluruh isi secara berbeda.

## apps/desktop/AGENTS.md

Aturan khusus frontend dan Tauri.

## apps/api/AGENTS.md

Aturan khusus Axum, Rust, SQLx, dan database.

## Dokumentasi arsitektur

Buat:
- docs/architecture/SYSTEM-ARCHITECTURE.md
- docs/architecture/PROJECT-STRUCTURE.md
- docs/development/DEVELOPMENT-GUIDE.md
- docs/development/CODING-CONVENTION.md

Dokumentasi harus mencerminkan implementasi sebenarnya, bukan sekadar rencana.

---

# 6. BATASAN PENGERJAAN

SANGAT PENTING.

Jangan mengerjakan fitur berikut pada tahap pertama:

- Login lengkap.
- CRUD barang.
- CRUD kategori.
- Barang masuk.
- Barang keluar.
- Koreksi stok.
- Stock opname.
- Dashboard operasional.
- Laporan.
- Export Excel.
- Export PDF.
- Manajemen pengguna.
- Transaksi kasir.
- Sistem penjualan.
- Desain PDM lengkap.

Jangan membuat dummy business logic yang seolah-olah sudah berfungsi.

Fokus pada fondasi project dan integrasi teknologi.

Jangan mengubah arsitektur utama tanpa alasan teknis dan persetujuan.

Jika menemukan konflik antara rancangan dan kebutuhan teknis:
1. Identifikasi konflik.
2. Jelaskan dampaknya.
3. Usulkan solusi.
4. Jangan melakukan perubahan arsitektur besar secara diam-diam.

Jangan menghapus file atau konfigurasi yang sudah ada sebelum memeriksa dampaknya.

---

# 7. STANDAR KUALITAS

Terapkan ketentuan berikut:

1. Gunakan Rust stable.
2. Gunakan TypeScript strict mode.
3. Hindari penggunaan any tanpa alasan kuat.
4. Hindari duplikasi kode.
5. Pisahkan tanggung jawab setiap modul.
6. Gunakan error handling yang konsisten.
7. Jangan hardcode secret.
8. Jangan mengakses MySQL dari frontend.
9. Jangan menaruh business logic di komponen React.
10. Jangan membuat file kosong tanpa tujuan yang jelas.
11. Hindari dependency yang tidak diperlukan.
12. Pastikan seluruh dokumentasi sesuai dengan implementasi.

Gunakan penamaan yang konsisten dan mudah dipahami.

---

# 8. TESTING DAN VERIFIKASI

Setelah implementasi selesai, lakukan pemeriksaan berikut.

## Frontend

- pnpm install berhasil.
- TypeScript typecheck berhasil.
- Vite development server berhasil dijalankan.
- React berhasil dirender.

## Tauri

- Cargo check berhasil.
- Tauri berhasil menjalankan aplikasi.
- Native command dapat dipanggil dari React.

## API

- cargo check berhasil.
- API library dapat dikompilasi.
- Standalone API dapat dijalankan.
- GET /api/v1/health mengembalikan response yang benar.
- GET /api/v1/health/db melakukan pemeriksaan koneksi nyata.

## Integrasi

- Tauri dapat menjalankan Axum.
- React dapat mengakses API lokal.
- API tidak memblokir main thread.
- Port collision ditangani.
- Graceful shutdown berfungsi.

## Database

- SQLx menggunakan MySQL.
- Konfigurasi DATABASE_URL bekerja.
- Koneksi dapat diverifikasi jika MySQL tersedia.
- Tidak ada kredensial yang masuk Git.

Jalankan formatting dan linting yang sesuai:
- cargo fmt --check.
- cargo clippy jika konfigurasi sudah tersedia.
- pnpm lint jika script lint sudah disiapkan.
- pnpm typecheck.

Jangan menyatakan testing berhasil jika perintahnya belum benar-benar dijalankan.

Jika suatu pengujian tidak dapat dijalankan karena dependency, MySQL, atau lingkungan Windows belum tersedia, jelaskan secara spesifik.

---

# 9. ACCEPTANCE CRITERIA

Task dianggap selesai apabila:

[ ] pnpm workspace berfungsi.

[ ] Cargo workspace berfungsi.

[ ] Tauri v2 berhasil diinisialisasi.

[ ] React + TypeScript berhasil dijalankan.

[ ] Rust + Axum berhasil dikompilasi.

[ ] Axum tersedia sebagai library dan standalone binary.

[ ] Tauri dapat menjalankan Axum secara terintegrasi.

[ ] API health check berhasil.

[ ] Database health check sudah diimplementasikan.

[ ] SQLx MySQL connection pool sudah disiapkan.

[ ] Konfigurasi environment sudah tersedia.

[ ] Struktur folder sesuai rancangan.

[ ] Dokumentasi project tersedia.

[ ] AGENTS.md dan CLAUDE.md tersedia.

[ ] Tidak ada implementasi fitur bisnis di luar scope.

[ ] Semua hasil pengujian didokumentasikan.

---

# 10. CARA BEKERJA

Ikuti urutan pengerjaan berikut:

PHASE A — Repository Inspection

1. Periksa isi repository.
2. Identifikasi file yang sudah ada.
3. Periksa instalasi Node.js, pnpm, Rust, Cargo, dan Tauri prerequisites.
4. Identifikasi kemungkinan konflik konfigurasi.
5. Laporkan temuan awal.

PHASE B — Workspace Initialization

1. Buat Cargo Workspace.
2. Buat pnpm Workspace.
3. Siapkan direktori.
4. Siapkan konfigurasi dasar.

PHASE C — Desktop Initialization

1. Inisialisasi Tauri v2.
2. Setup React + TypeScript.
3. Setup Vite.
4. Buat tampilan awal.
5. Verifikasi komunikasi native command.

PHASE D — API Initialization

1. Buat Axum library.
2. Buat standalone binary.
3. Buat router.
4. Buat health check.
5. Setup SQLx.
6. Setup konfigurasi MySQL.

PHASE E — Tauri and Axum Integration

1. Integrasikan Axum ke lifecycle Tauri.
2. Setup API listener.
3. Setup graceful shutdown.
4. Hubungkan frontend dengan REST API.
5. Uji komunikasi.

PHASE F — Documentation

1. Buat AGENTS.md.
2. Buat CLAUDE.md.
3. Buat README.md.
4. Buat dokumentasi arsitektur.
5. Dokumentasikan cara menjalankan aplikasi.

PHASE G — Final Verification

1. Jalankan seluruh pemeriksaan.
2. Perbaiki error.
3. Verifikasi acceptance criteria.
4. Buat laporan hasil pekerjaan.

Jangan berhenti setelah hanya membuat struktur folder. Pastikan konfigurasi benar-benar berfungsi.

Namun, jangan melanjutkan ke pengembangan fitur gudang.

---

# 11. FINAL REPORT

Setelah selesai, berikan laporan dengan format:

## A. Project Structure
Jelaskan struktur folder final.

## B. Implemented Components
Daftar komponen yang berhasil dibuat.

## C. Technology Configuration
Jelaskan konfigurasi teknologi.

## D. Tauri and Axum Integration
Jelaskan bagaimana Axum dijalankan oleh Tauri.

## E. Database Configuration
Jelaskan cara mengatur MySQL dan DATABASE_URL.

## F. Testing Results
Buat tabel:
- Nama pengujian.
- Perintah.
- Status.
- Catatan.

## G. Running Instructions
Berikan perintah untuk:
- Install dependencies.
- Menjalankan development mode.
- Menjalankan standalone API.
- Menjalankan typecheck.
- Melakukan build aplikasi.

## H. Pending Requirements
Daftar pekerjaan yang belum dilakukan dan alasan.

## I. Recommendations
Berikan rekomendasi untuk tahap berikutnya.

---

# INSTRUKSI TERAKHIR

Bekerjalah seperti engineer yang bertanggung jawab terhadap fondasi project jangka panjang.

Prioritaskan correctness, maintainability, security, dan kesederhanaan arsitektur.

Jangan terburu-buru membuat banyak file tanpa fungsi.

Jangan mengarang hasil testing.

Jangan memperluas scope.

Mulai dari inspeksi repository, kemudian kerjakan setiap phase secara berurutan.

Jika menemukan keputusan teknis yang belum ditentukan dan dapat memengaruhi arsitektur secara signifikan, berhenti pada keputusan tersebut dan tanyakan terlebih dahulu.

Target akhir: sebuah project scaffold Aplikasi Gudang yang benar-benar dapat dijalankan, terstruktur, terdokumentasi, dan siap menerima pengembangan fitur pada tahap berikutnya.