# Skema Database Supabase / PostgreSQL (Katalog Kedai Kopi UMKM)

Database menggunakan Supabase (PostgreSQL) dengan Row Level Security (RLS) aktif pada seluruh tabel. Skema ini dirancang khusus dan efisien untuk operasional website katalog kedai kopi online.

---

## Daftar Tabel & View Inti

Berikut adalah 8 tabel dan 1 view utama yang benar-benar relevan untuk website ini:

### 1. `kategori`
Master kategori menu kedai kopi (misal: "Minuman", "Espresso Based", "Manual Brew", "Pastry", "Camilan").

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `nama` | text | Nama kategori menu unik |
| `slug` | text | Slug ramah URL unik |
| `deskripsi` | text | Deskripsi kategori |
| `urutan` | integer | Prioritas urutan tampil (default: 0) |
| `created_at` | timestamptz | Waktu dibuat otomatis |

---

### 2. `produk`
Daftar seluruh menu kopi, minuman, dan makanan/pastry yang dijual (berelasi resmi ke tabel `kategori`).

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `nama` | text | Nama menu / produk, wajib diisi |
| `harga` | integer | Harga dalam rupiah, minimal 0 |
| `deskripsi` | text | Penjelasan rasa dan komposisi produk |
| `foto_url` | text | Tautan URL foto utama |
| `image` | text | Kolom cadangan foto |
| `kategori_id` | bigint | Foreign Key ke `kategori(id)` (on delete set null) |
| `harga_coret` | integer | Harga sebelum diskon / promo coret |
| `stok` | integer | Stok produk (default: 10) |
| `aktif` | boolean | Status publikasi (true: tampil di katalog, false: draft) |
| `urutan` | integer | Posisi prioritas tampil |
| `created_at` | timestamptz | Waktu dibuat otomatis |

---

### 3. `varian`
Pilihan varian menu seperti ukuran kopi (Regular / Large), suhu (Panas / Dingin), atau opsi ekstra espresso shot.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `produk_id` | bigint | Foreign Key ke `produk(id)` (on delete cascade) |
| `nama` | text | Nama varian (contoh: "Large", "Ekstra Shot") |
| `harga_tambahan` | integer | Tambahan rupiah (misal: 4000) |
| `stok` | integer | Batas stok varian khusus |
| `created_at` | timestamptz | Waktu dibuat otomatis |

---

### 4. `banner`
Banner promosi dan pengumuman hero interaktif di bagian atas beranda.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `judul` | text | Judul utama penawaran |
| `subjudul` | text | Subjudul penjelas |
| `deskripsi` | text | Deskripsi penawaran |
| `badge` | text | Label badge (misal: "PROMO SPESIAL") |
| `tombol_teks` | text | Label tombol CTA |
| `foto_url` | text | URL gambar latar belakang/ilustrasi |
| `link_url` | text | Tautan tujuan (rute internal atau WhatsApp) |
| `tipe` | text | Ikon tema ('coffee', 'delivery', 'sparkle') |
| `bg_gradient` | text | Kelas gaya warna gradien |
| `is_external` | boolean | Membuka tab baru (true / false) |
| `aktif` | boolean | Status aktif slide banner |
| `urutan` | integer | Posisi urutan slide |
| `created_at` | timestamptz | Waktu dibuat otomatis |

---

### 5. `klik_whatsapp`
Log setiap klik tombol pemesanan WhatsApp oleh calon pembeli untuk analitik minat produk.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `produk_id` | bigint | Relasi ke `produk(id)` (on delete set null) |
| `nama_produk` | text | Nama menu saat dipesan |
| `harga` | integer | Harga satuan saat dipesan |
| `jumlah` | integer | Kuantitas yang dipesan |
| `sumber` | text | Tombol asal ('detail', 'katalog', 'keranjang') |
| `ip_address` | text | IP pengakses (opsional) |
| `created_at` | timestamptz | Waktu klik dicatat |

---

### 6. `klik_whatsapp_per_produk` (View)
View agregasi SQL untuk menyajikan peringkat produk terpopuler/terlaris di dashboard admin secara *real-time*.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `produk_id` | bigint | ID produk |
| `nama_produk` | text | Nama produk |
| `foto_url` | text | Foto produk |
| `kategori` | text | Kategori |
| `total_klik` | bigint | Total frekuensi pesanan |
| `total_jumlah` | numeric | Estimasi total porsi dipesan |
| `total_nilai` | numeric | Estimasi total nilai omzet rupiah |
| `klik_terakhir` | timestamptz | Waktu pemesanan terakhir |

---

### 7. `ulasan`
Ulasan bintang (1-5) dan review dari pelanggan untuk membangun kepercayaan calon pembeli.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `produk_id` | bigint | Relasi Foreign Key ke `produk(id)` |
| `nama` | text | Nama pelanggan |
| `rating` | integer | Nilai bintang 1 sampai 5 |
| `komentar` | text | Testimoni pelanggan |
| `disetujui` | boolean | Status moderasi untuk tampil di publik |
| `created_at` | timestamptz | Waktu pengiriman ulasan |

---

### 8. `pengaturan_toko`
Data profil kedai kopi, nomor WhatsApp pemesanan, jam buka, dan alamat toko fisik yang dapat diubah langsung dari admin.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `nama` | text | Nama resmi kedai kopi |
| `nomor_whatsapp` | text | Nomor WA tanpa simbol + (format internasional) |
| `alamat` | text | Alamat lengkap kedai kopi |
| `jam_buka` | text | Jam operasional buka kedai |
| `tagline` | text | Slogan toko |
| `deskripsi` | text | Profil cerita kedai kopi |
| `instagram` | text | Akun media sosial Instagram |
| `logo_url` | text | Logo toko |
| `created_at` | timestamptz | Waktu dibuat |
| `updated_at` | timestamptz | Waktu terakhir diubah |

---

### 9. `log_aktivitas`
Audit log rekam jejak operasional admin untuk keamanan data toko.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | bigint | Primary Key, auto increment |
| `admin_email` | text | Email admin pelaku aksi |
| `aksi` | text | Kategori aksi (misal: "Tambah Produk", "Login") |
| `rincian` | text | Rincian data yang diubah |
| `ip_address` | text | IP pengakses |
| `created_at` | timestamptz | Waktu aktivitas |

## Aturan Keamanan (Row Level Security)

Semua tabel memiliki **Row Level Security (RLS)** aktif:
- Publik dapat membaca katalog `produk`, `kategori`, `varian`, `banner`, dan `pengaturan_toko`.
- Publik hanya dapat membaca `ulasan` yang disetujui (`disetujui = true`).
- Publik dapat mencatatkan pesanan (`klik_whatsapp`) dan mengirim ulasan baru.
- Admin (terautentikasi) memiliki akses penuh terhadap mutasi produk, moderasi ulasan, dan audit log `log_aktivitas`.

Skrip SQL lengkap dapat disalin langsung dari [`docs/schema.sql`](file:///c:/laragon/www/Nuran-Coffe/docs/schema.sql).
