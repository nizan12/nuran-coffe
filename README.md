# ☕ Nuran Artisan Coffee

> Kelezatan Kopi Nusantara Pilihan & Pastry Panggang Segar, Diseduh Penuh Cerita.

Aplikasi katalog produk online untuk **Nuran Artisan Coffee** — kedai kopi artisan lokal di Batam Center yang menghadirkan seduhan biji kopi Nusantara pilihan, racikan minuman signature istimewa, serta pastry panggang segar. Pengunjung dapat melihat katalog, detail produk, lalu memesan langsung lewat WhatsApp.

🌐 **Live Demo:** [nuran-coffes.vercel.app](https://nuran-coffes.vercel.app)

---

## ✨ Fitur Utama

### 🛍️ Pengunjung (Publik)

| Fitur | Keterangan |
|-------|------------|
| **Katalog Produk** | Menampilkan semua produk dari database dengan foto, kategori, nama, dan harga |
| **Detail Produk** | Halaman detail dengan galeri foto, deskripsi, ulasan, dan produk terkait |
| **Pesan via WhatsApp** | Satu klik untuk pesan langsung ke WhatsApp toko dengan pesan otomatis |
| **Keranjang Belanja** | Kumpulkan beberapa produk dan pesan semua sekaligus dalam satu pesan WhatsApp |
| **Filter & Pencarian** | Saring produk berdasarkan kategori, pencarian nama, dan urutan (harga/terbaru) |
| **Halaman Kategori** | URL khusus per kategori (contoh: `/kategori/minuman-dingin`) |
| **Paginasi** | Navigasi halaman produk yang responsif |
| **Favorit** | Tandai produk favorit dengan ikon hati, tersimpan di browser |
| **Bandingkan Produk** | Bandingkan spesifikasi dan harga 2 produk secara berdampingan |
| **Terakhir Dilihat** | Daftar produk yang baru dikunjungi |
| **Ulasan & Rating** | Pengunjung bisa memberikan ulasan bintang dan komentar pada produk |
| **Varian Ukuran & Harga** | Pilih ukuran (Regular/Large) dengan harga berbeda |
| **Harga Diskon & Badge** | Harga coret dan badge promo pada produk diskon |
| **Status Stok** | Label "Tersedia" / "Stok Habis" pada setiap produk |
| **Banner Promo** | Slider promo interaktif di halaman utama |
| **Bagikan Produk** | Salin link atau bagikan produk ke media sosial |
| **Dark Mode** | Toggle tema terang/gelap dengan transisi halus |
| **PWA** | Bisa di-install di layar HP seperti aplikasi |
| **Asisten AI** | Widget chat AI untuk rekomendasi menu berdasarkan selera |
| **Halaman Tentang** | Profil toko, jam buka, alamat, dan peta lokasi |

### 🔐 Admin (Terproteksi Login)

| Fitur | Keterangan |
|-------|------------|
| **Dashboard** | Ringkasan statistik toko (total produk, produk aktif, kategori, pesanan WA) |
| **Produk Terpopuler** | Grafik produk terlaris berdasarkan klik pemesanan WhatsApp |
| **Kelola Produk** | Tambah, ubah, hapus produk dengan upload foto ke Supabase Storage |
| **Kelola Kategori** | CRUD kategori produk secara dinamis |
| **Aktif/Nonaktifkan** | Sembunyikan produk sementara tanpa menghapus |
| **Atur Urutan Tampil** | Tentukan produk mana yang tampil di baris teratas katalog |
| **Cari & Paginasi Admin** | Pencarian instan dan paginasi di tabel produk admin |
| **Banner Promo** | Kelola banner/slider promo di halaman utama |
| **Moderasi Ulasan** | Setujui atau hapus ulasan pengunjung sebelum tampil publik |
| **Ekspor/Impor CSV** | Unduh data produk ke CSV atau impor banyak produk sekaligus |
| **Pengaturan Toko** | Ubah nama toko, nomor WA, jam buka, alamat dari halaman admin |
| **Kelola Akun Admin** | Undang atau kelola akun admin lain |
| **Log Aktivitas** | Riwayat perubahan data (siapa, kapan, aksi apa) |
| **Ganti Password** | Form ganti password admin dengan validasi |
| **Deskripsi AI** | Generate deskripsi produk otomatis dengan Gemini API |

---

## 🛠️ Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| [Next.js](https://nextjs.org) | 16 | Framework React dengan App Router & Server Actions |
| [React](https://react.dev) | 19 | UI library |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first CSS framework |
| [Supabase](https://supabase.com) | - | Database PostgreSQL, Auth, dan Storage |
| [Vercel](https://vercel.com) | - | Hosting & deployment |

---

## 📁 Struktur Folder

```
app/
  page.jsx                  # Katalog publik (beranda)
  produk/[id]/page.jsx      # Detail produk
  kategori/[slug]/page.jsx  # Halaman per kategori
  tentang/page.jsx          # Halaman tentang toko
  admin/
    login/page.jsx          # Login admin
    page.jsx                # Dashboard admin & kelola produk
    password/page.jsx       # Ganti password
    kategori/page.jsx       # Kelola kategori
    banner/page.jsx         # Kelola banner promo
    ulasan/page.jsx         # Moderasi ulasan
    pengaturan/page.jsx     # Pengaturan toko
    pengguna/page.jsx       # Kelola akun admin
    aktivitas/page.jsx      # Log aktivitas
    produk/baru/page.jsx    # Tambah produk
    produk/[id]/ubah/...    # Ubah produk
    ekspor-csv/             # Ekspor data produk
    actions.js              # Server Actions (semua aksi admin)
components/                 # Komponen UI reusable (27 komponen)
lib/
  toko.js                   # Identitas toko & nomor WhatsApp
  supabase/                 # Koneksi Supabase (server-only)
  format.js                 # Format rupiah & utilitas
  pengaturanAdmin.js        # Pengaturan admin (urutan, nonaktif, analitik)
docs/                       # Dokumentasi proyek (PRD, user stories, dll.)
proxy.js                    # Proteksi rute /admin (middleware)
```

---

## 🚀 Memulai

### Prasyarat

- **Node.js** ≥ 20.9.0
- Akun **Supabase** (gratis)
- Akun **Vercel** (gratis, untuk deploy)

### Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/nizan12/nuran-coffe.git
   cd nuran-coffe
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Siapkan environment variables**

   Salin file `.env.example` menjadi `.env.local`, lalu isi nilainya:
   ```bash
   cp .env.example .env.local
   ```

   | Variabel | Keterangan |
   |----------|------------|
   | `SUPABASE_URL` | URL proyek Supabase |
   | `SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key Supabase |
   | `SUPABASE_SECRET_KEY` | Service role key Supabase |
   | `GEMINI_API_KEY` | *(Opsional)* API key Gemini untuk deskripsi AI |

   > ⚠️ **Jangan** gunakan awalan `NEXT_PUBLIC_` — semua variabel hanya diakses dari server.

4. **Siapkan database Supabase**

   Jalankan SQL di `docs/schema.sql` pada SQL Editor Supabase untuk membuat tabel dan RLS policies.

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔒 Keamanan

- **Server-only Supabase** — Semua akses database dilakukan di server (Server Component, Server Action, Route Handler). Tidak ada client Supabase di browser.
- **Proteksi rute** — Semua halaman `/admin/*` (kecuali `/admin/login`) dilindungi oleh `proxy.js` yang memeriksa sesi login.
- **Validasi server** — Setiap aksi yang mengubah data memeriksa autentikasi admin di server.
- **RLS aktif** — Row Level Security di Supabase tetap aktif untuk semua tabel.
- **Tanpa expose key** — Environment variables tidak dikirim ke browser.

---

## 📦 Deploy ke Vercel

1. Push repository ke GitHub
2. Import proyek di [vercel.com](https://vercel.com)
3. Tambahkan environment variables (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) di **Settings > Environment Variables**
4. Deploy otomatis setiap push ke branch `main`

---

## 📍 Informasi Toko

| | |
|---|---|
| **Nama** | Nuran Artisan Coffee |
| **Alamat** | Batam Center, Teluk Tering, Kepulauan Riau |
| **Jam Buka** | Setiap hari, 08.00–20.00 |
| **Pemesanan** | Via WhatsApp langsung dari katalog |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan UMKM Nuran Artisan Coffee.
