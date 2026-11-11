# Standar Konvensi Kode (Coding Convention)

## 1. Rust Conventions
- Ikuti standar resmi `rustfmt`. Seluruh kode harus lolos `cargo fmt --check`.
- Wajib bebas dari warning `cargo clippy`.
- Gunakan error handling eksplisit dengan `Result<T, E>`. Hindari penggunaan `unwrap()` atau `expect()` pada runtime path produksi; gunakan hanya saat inisialisasi konfigurasi statis yang terjamin valid.
- Gunakan `tracing` (`info!`, `warn!`, `error!`, `debug!`) untuk seluruh aktivitas logging terstruktur, jangan menggunakan `println!`.
- Format JSON Response selalu konsisten menggunakan struct `ApiResponse<T>`.

## 2. TypeScript & React Conventions
- **TypeScript Strict Mode**: Selalu aktif (`strict: true` di `tsconfig.json`).
- Hindari penggunaan tipe `any`. Jika tipe belum dapat dipastikan, gunakan `unknown` dengan type-guard yang sesuai.
- Gunakan fungsional komponen React dengan hooks.
- Pisahkan presentational logic dari data fetching / state management (pisahkan query hooks ke folder `services/` atau `hooks/`).
- Komponen UI reusable ditempatkan di `src/components/ui/`.
- Fitur bisnis terisolasi dalam direktori `src/features/<feature_name>/`.

## 3. Git & Workspace Conventions
- Jangan melakukan commit terhadap file `.env`, artefak build (`target/`, `dist/`), atau cache `node_modules/`.
- Pastikan `pnpm typecheck` dan `cargo check --workspace` lolos sebelum membuat commit atau perubahan besar.
