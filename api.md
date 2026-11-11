## Authentication

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Login dengan username + password |
| `POST` | `/api/v1/auth/logout` | Authenticated | Logout, cabut token |
| `GET` | `/api/v1/auth/me` | Authenticated | Info user yang login |
| `PUT` | `/api/v1/auth/password` | Authenticated | Ganti password |

## Kategori

| Method | Endpoint | Akses |
|---|---|---|
| `GET` | `/api/v1/categories` | Both roles |
| `POST` | `/api/v1/categories` | admin_gudang |
| `GET` | `/api/v1/categories/{id}` | Both roles |
| `PUT` | `/api/v1/categories/{id}` | admin_gudang |
| `DELETE` | `/api/v1/categories/{id}` | admin_gudang |

## Barang (Items/Products)

| Method | Endpoint | Akses |
|---|---|---|
| `GET` | `/api/v1/items` | Both roles |
| `GET` | `/api/v1/items/search` | Both roles |
| `POST` | `/api/v1/items` | admin_gudang |
| `GET` | `/api/v1/items/{id}` | Both roles |
| `PUT` | `/api/v1/items/{id}` | admin_gudang |
| `DELETE` | `/api/v1/items/{id}` | admin_gudang |

## Transaksi Gudang

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/v1/stock-transactions` | admin_gudang | List transaksi |
| `POST` | `/api/v1/stock-in` | admin_gudang | Barang masuk (draft) |
| `POST` | `/api/v1/stock-out` | admin_gudang | Barang keluar (draft) |
| `GET` | `/api/v1/stock-transactions/{id}` | admin_gudang | Detail transaksi |
| `PUT` | `/api/v1/stock-transactions/{id}` | admin_gudang | Edit draft |
| `POST` | `/api/v1/stock-transactions/{id}/confirm` | admin_gudang | Konfirmasi (stok berubah) |
| `POST` | `/api/v1/stock-transactions/{id}/cancel` | admin_gudang | Batalkan draft |

## Koreksi Stok

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/api/v1/stock-corrections` | admin_gudang | Buat koreksi (langsung confirmed) |
| `GET` | `/api/v1/stock-corrections/{id}` | admin_gudang | Detail koreksi |

## Riwayat Pergerakan Stok

| Method | Endpoint | Akses |
|---|---|---|
| `GET` | `/api/v1/stock-movements` | admin_gudang |
| `GET` | `/api/v1/stock-movements/{id}` | admin_gudang |

## Stock Opname

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/v1/stock-opnames` | admin_gudang | List opname |
| `POST` | `/api/v1/stock-opnames` | admin_gudang | Buat opname baru |
| `GET` | `/api/v1/stock-opnames/{id}` | admin_gudang | Detail opname |
| `PUT` | `/api/v1/stock-opnames/{id}/items` | admin_gudang | Update hitungan fisik |
| `POST` | `/api/v1/stock-opnames/{id}/confirm` | admin_gudang | Konfirmasi opname |
| `POST` | `/api/v1/stock-opnames/{id}/cancel` | admin_gudang | Batalkan opname |

## Dashboard & Laporan

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | admin_gudang | Ringkasan dashboard |
| `GET` | `/api/v1/reports/stock` | admin_gudang | Laporan stok saat ini |
| `GET` | `/api/v1/reports/stock-movements` | admin_gudang | Laporan pergerakan stok |
| `GET` | `/api/v1/reports/stock-in` | admin_gudang | Laporan barang masuk |
| `GET` | `/api/v1/reports/stock-out` | admin_gudang | Laporan barang keluar |
| `GET` | `/api/v1/reports/stock-opnames` | admin_gudang | Laporan stock opname |

## Export

| Method | Endpoint | Akses | Format |
|---|---|---|---|
| `GET` | `/api/v1/exports/stock/excel` | admin_gudang | .xlsx |
| `GET` | `/api/v1/exports/stock/pdf` | admin_gudang | .pdf |
| `GET` | `/api/v1/exports/stock-movements/excel` | admin_gudang | .xlsx |
| `GET` | `/api/v1/exports/stock-movements/pdf` | admin_gudang | .pdf |
| `GET` | `/api/v1/exports/stock-in/excel` | admin_gudang | .xlsx |
| `GET` | `/api/v1/exports/stock-in/pdf` | admin_gudang | .pdf |
| `GET` | `/api/v1/exports/stock-out/excel` | admin_gudang | .xlsx |
| `GET` | `/api/v1/exports/stock-out/pdf` | admin_gudang | .pdf |
| `GET` | `/api/v1/exports/stock-opnames/excel` | admin_gudang | .xlsx |
| `GET` | `/api/v1/exports/stock-opnames/pdf` | admin_gudang | .pdf |

## Manajemen Pengguna

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/v1/users` | admin_gudang | List karyawan |
| `POST` | `/api/v1/users` | admin_gudang | Buat akun baru |
| `GET` | `/api/v1/users/{id}` | admin_gudang | Detail karyawan |
| `PUT` | `/api/v1/users/{id}` | admin_gudang | Update data |
| `DELETE` | `/api/v1/users/{id}` | admin_gudang | Selalu 403 (no hard-delete) |
| `POST` | `/api/v1/users/{id}/deactivate` | admin_gudang | Nonaktifkan + cabut token |
| `POST` | `/api/v1/users/{id}/activate` | admin_gudang | Aktifkan kembali |

## Kasir (POS)

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/v1/kasir/sales` | admin_kasir | Riwayat penjualan sendiri |
| `POST` | `/api/v1/kasir/sales` | admin_kasir | Buat transaksi penjualan |
| `GET` | `/api/v1/kasir/sales/{id}` | admin_kasir | Detail penjualan sendiri |

> Kasir juga bisa pakai `GET /api/v1/items` dan `GET /api/v1/items/search` untuk cari produk.

**Total: 58 endpoints**