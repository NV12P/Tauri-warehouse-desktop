# apps/api/AGENTS.md — Backend & Database Guidelines

## Peran & Tanggung Jawab
Modul `apps/api` (`gudang-api`) bertanggung jawab atas:
- Penyediaan endpoint REST API berbasis Axum.
- Konektivitas database MySQL 8.x melalui SQLx Connection Pool.
- Centralized error handling dan validasi request.
- Dukungan *dual-mode*: library terintegrasi untuk Tauri dan executable standalone binary (`main.rs`).

## Aturan Khusus Backend
1. **Repository & Service Pattern**:
   - Logika bisnis dipusatkan pada service layer.
   - Akses data database dipusatkan pada repository layer.
2. **Koneksi Database (SQLx)**:
   - Gunakan `sqlx::MySqlPool` dengan konfigurasi pool batas maksimal (default 10) dan timeout aman.
   - Migrasi skema database ditempatkan di folder `migrations/`.
3. **Response Konsisten**:
   - Seluruh response JSON mengimplementasikan struct `ApiResponse<T>`.
   - Error ditangani melalui enum `AppError` yang mengimplementasikan `axum::response::IntoResponse`.
4. **Keamanan Jaringan**:
   - Bind server secara default ke `127.0.0.1`.
   - Hindari CORS wildcard terbuka jika menggunakan kredensial.
   - Jangan pernah mencatat (logging) raw password atau connection string sensitif.
