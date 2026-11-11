# Database Documentation

Direktori ini berisi perancangan dan seed data untuk database MySQL 8.x pada Aplikasi Gudang.

## Struktur Direktori
- `design/`: Skema ERD, PDM, dan spesifikasi tabel database.
- `seeds/`: File SQL untuk data inisial / master data.

## Konfigurasi
Aplikasi menggunakan connection pool MySQL melalui SQLx di `apps/api`.
Konfigurasi koneksi diatur melalui file `.env`:
```env
DATABASE_URL=mysql://root:password@127.0.0.1:3306/gudang_db
```
Migration database dikelola langsung oleh SQLx CLI / folder `apps/api/migrations`.
