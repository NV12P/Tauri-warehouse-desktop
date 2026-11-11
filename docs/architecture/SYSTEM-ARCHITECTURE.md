# Arsitektur Sistem — Aplikasi Gudang

## 1. Ikhtisar Arsitektur
Aplikasi Gudang dirancang menggunakan pendekatan **Monorepo** dengan pemisahan tegas antara antarmuka pengguna (Frontend), native desktop runtime (Tauri v2), dan server logika bisnis (Axum REST API).

```
+--------------------------------------------------------------------+
|                      Aplikasi Desktop (Tauri v2)                   |
|                                                                    |
|  +------------------------------+   HTTP/JSON    +--------------+  |
|  |     Frontend (React + TS)    | ------------> | Axum Server  |  |
|  |  (UI, State, Query Client)   | (127.0.0.1)   | (REST API)   |  |
|  +------------------------------+               +-------+------+  |
|                 | (Native IPC)                          |          |
|                 v                                       |          |
|  +------------------------------+                       |          |
|  |  Tauri Native Core (Rust)    |                       | (SQLx)   |
|  |  (Window, Lifecycle, Tray)   |                       |          |
|  +------------------------------+                       |          |
+---------------------------------------------------------|----------+
                                                          v
                                                 +-----------------+
                                                 | MySQL 8.x DB    |
                                                 | (InnoDB/Pool)   |
                                                 +-----------------+
```

## 2. Modus Operasional API (Dual-Mode)
1. **Integrated Mode (Desktop Application)**
   - Saat desktop dibuka, Tauri menginisialisasi pustaka `gudang-api` secara in-process melalui async runtime Tokio.
   - Server mendengarkan port lokal `127.0.0.1:4317`.
   - Saat aplikasi ditutup, sinyal shutdown dikirimkan untuk membersihkan koneksi secara graceful.

2. **Standalone Mode (Server Mandiri)**
   - Dapat dijalankan secara terpisah melalui perintah:
     ```bash
     cargo run -p gudang-api
     ```
   - Sangat berguna untuk pengujian REST API, automated testing, dan persiapan arsitektur multi-device / server sentral di masa depan tanpa mengubah kode logika bisnis.

## 3. Database Layer
- Database menggunakan **MySQL 8.x** dengan engine **InnoDB** dan charset **utf8mb4**.
- Pengelolaan koneksi dikendalikan oleh pool koneksi `SQLx` asinkronus dengan timeout terukur.
- Komponen frontend tidak memiliki akses langsung ke database.
