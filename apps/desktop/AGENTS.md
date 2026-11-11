# apps/desktop/AGENTS.md — Frontend & Desktop Guidelines

## Peran & Tanggung Jawab
Modul `apps/desktop` bertanggung jawab atas:
- Antarmuka pengguna (UI) React + TypeScript.
- Integrasi desktop native dengan Tauri v2.
- Pengelolaan lifecycle API server lokal (integrated mode).
- Komunikasi dengan Axum REST API (127.0.0.1:4317).

## Aturan Khusus Frontend & Tauri
1. **No Direct DB Access**: Frontend tidak boleh mencoba menghubungi MySQL secara langsung.
2. **State Management**:
   - Pisahkan *server state* (via TanStack Query / fetch) dari *client state* (Zustand).
3. **Komponen & Desain**:
   - Letakkan reusable UI komponen di `src/components/ui/`.
   - Modul spesifik fitur wajib berada dalam `src/features/<feature-name>/`.
4. **Tauri Native Commands**:
   - Seluruh command didaftarkan melalui `src-tauri/src/commands/`.
   - Command harus bersifat asynchronous dan tidak boleh memblokir thread GUI.
5. **Port & Lifecycle**:
   - Port default REST API adalah `4317`.
   - Server Axum dijalankan secara asinkronus via `tauri::async_runtime::spawn` pada event `setup`.
   - Wajib mengirim sinyal graceful shutdown pada event `ExitRequested`.
