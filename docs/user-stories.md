# User Story

Setiap user story diberi nomor. Pakai nomor ini di prompt ("kerjakan US-01") dan di pesan commit (`US-01: katalog dari database`).

## Wajib

### US-01 Katalog dari database

Sebagai pengunjung, saya ingin melihat semua produk toko dalam satu halaman, supaya saya tahu apa saja yang dijual.

Kriteria selesai:

- Halaman `/` menampilkan semua produk dari tabel `produk` di Supabase, bukan dari `lib/data-contoh.js`.
- Data diambil di sisi server.
- Setiap kartu menampilkan foto, kategori, nama, dan harga dalam format rupiah.
- Jika belum ada produk, halaman menampilkan pesan yang jelas.

### US-02 Detail produk

Sebagai pengunjung, saya ingin melihat detail satu produk, supaya saya yakin sebelum memesan.

Kriteria selesai:

- Halaman `/produk/[id]` menampilkan foto, kategori, nama, harga, dan deskripsi dari database.
- Produk yang tidak ada menampilkan halaman "tidak ditemukan".

### US-03 Pesan via WhatsApp

Sebagai pengunjung, saya ingin menekan satu tombol untuk memesan lewat WhatsApp, supaya saya tidak perlu mengetik ulang nama produk.

Kriteria selesai:

- Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor di `lib/toko.js`.
- Pesan sudah terisi otomatis dengan nama dan harga produk.
- Berfungsi di HP dan di laptop.

### US-04 Login admin

Sebagai admin, saya ingin masuk dengan email dan password, supaya hanya saya yang bisa mengelola toko.

Kriteria selesai:

- Login memakai Supabase Auth, diproses di server.
- Login berhasil mengarah ke `/admin`; login gagal menampilkan pesan yang jelas.
- Tombol "Keluar" mengakhiri sesi dan kembali ke halaman login.

### US-05 Ganti password

Sebagai admin, saya ingin mengganti password, supaya password bawaan tidak bisa dipakai orang lain.

Kriteria selesai:

- Form di `/admin/password` mengganti password admin yang sedang login.
- Password baru minimal 8 karakter dan harus sama dengan konfirmasinya.
- Menampilkan pesan berhasil atau pesan error yang jelas.

### US-06 Proteksi halaman admin

Sebagai admin, saya ingin halaman admin tertutup untuk orang lain, supaya data toko aman.

Kriteria selesai:

- Membuka halaman `/admin` mana pun tanpa login akan dialihkan ke `/admin/login`.
- Setiap aksi yang mengubah data memeriksa login di server.

## Bonus

### US-07 List Produk
Sebagai admin, saya ingin produk pada page `/admin` mengambil data dari database.

### US-08 Tambah produk

Sebagai admin, saya ingin menambah produk baru dari halaman admin. Kriteria: form di `/admin/produk/baru` menyimpan produk ke database, lalu kembali ke `/admin`.

### US-09 Ubah produk

Sebagai admin, saya ingin mengubah data produk. Kriteria: form di `/admin/produk/[id]/ubah` terisi data lama dan menyimpan perubahan ke database.

### US-10 Hapus produk

Sebagai admin, saya ingin menghapus produk. Kriteria: tombol "Hapus" meminta konfirmasi, lalu menghapus produk dari database.

### US-11 Filter kategori atau pencarian

Sebagai pengunjung, saya ingin menyaring produk berdasarkan kategori atau mencari nama produk.

### US-12 Pilih jumlah atau varian

Sebagai pengunjung, saya ingin memilih jumlah atau varian sebelum memesan, dan pilihan itu ikut tertulis di pesan WhatsApp.

### US-13 PWA

Sebagai pengunjung, saya ingin memasang katalog di layar HP seperti aplikasi. Ikon tersedia di `public/icons`.

### US-14 Deskripsi produk dibuat AI

Sebagai admin, saya ingin membuat deskripsi produk secara otomatis dengan AI (Gemini API) dari nama dan kategori produk.

Catatan: bonus US-08, US-09, dan US-10 hanya dihitung jika aksinya terlindungi login.

---

## Roadmap Pengembangan Bertahap (Phase per Phase)

Berikut adalah pembagian User Story dan Keamanan lanjutan yang dipecah per fase agar pengerjaan terarah, bertahap, dan terukur:

---

### Fase 1: Fondasi Katalog, Navigasi & SEO Dasar (Total: 45 Poin)
Fokus: Mempermudah penjelajahan katalog, navigasi produk, dan visibilitas di mesin pencari.

#### US-15 Urutkan produk (5 poin)
- **Sebagai pengunjung**, saya ingin mengurutkan produk (harga terendah, harga tertinggi, terbaru, nama A-Z).
- **Kriteria selesai:** Terdapat dropdown / opsi sorting di katalog; urutan diterapkan di server/katalog tanpa merusak filter pencarian/kategori yang sedang aktif.

#### US-16 Paginasi atau muat lebih banyak (10 poin)
- **Sebagai pengunjung**, saya ingin melihat produk secara bertahap (halaman atau tombol 'Muat Lebih Banyak') agar halaman tidak berat saat produk bertambah banyak.
- **Kriteria selesai:** Menampilkan batas jumlah produk per halaman (misal 8 atau 12); tersedia tombol navigasi halaman atau tombol 'Muat Lebih Banyak' yang mulus.

#### US-17 Produk terkait di halaman detail (5 poin)
- **Sebagai pengunjung**, saya ingin melihat rekomendasi produk lain yang serupa/sekategori di bawah halaman detail produk.
- **Kriteria selesai:** Halaman `/produk/[id]` menampilkan 3-4 kartu produk lain dengan kategori sama (kecuali produk yang sedang dibuka).

#### US-22 Halaman Tentang dan kontak toko (5 poin)
- **Sebagai pengunjung**, saya ingin membaca profil toko, jam buka, dan peta/alamat lengkap di halaman khusus.
- **Kriteria selesai:** Halaman `/tentang` dibuat dengan informasi lengkap dari `lib/toko.js`, peta lokasi atau tautan Google Maps, serta navigasi menuju halaman tersebut.

#### US-23 Bagikan atau salin link produk (5 poin)
- **Sebagai pengunjung**, saya ingin membagikan link produk ke media sosial atau menyalin tautan produk dengan satu klik.
- **Kriteria selesai:** Tersedia tombol 'Salin Link' / 'Bagikan' di detail produk dengan feedback visual (misal tooltip 'Tautan disalin!').

#### US-26 Metadata SEO dan Open Graph (5 poin)
- **Sebagai pemilik toko**, saya ingin link produk yang dibagikan ke WhatsApp / medsos menampilkan pratinjau judul, deskripsi, dan foto produk yang rapi.
- **Kriteria selesai:** Dynamic metadata Next.js diimplementasikan pada halaman detail produk dan halaman utama dengan tag Open Graph lengkap.

#### US-27 sitemap.xml dan robots.txt (5 poin)
- **Sebagai pemilik toko**, saya ingin mesin pencari mengindeks halaman publik secara optimal.
- **Kriteria selesai:** File `app/sitemap.js` dan `app/robots.js` dibuat otomatis memuat rute publik dan daftar URL seluruh produk.

#### US-28 Halaman 404 dan loading kustom (5 poin)
- **Sebagai pengunjung**, saya ingin melihat tampilan loading yang halus serta halaman 404 yang ramah saat membuka halaman yang tidak ada.
- **Kriteria selesai:** Tersedia `app/not-found.jsx` dan `app/loading.jsx` dengan desain senada tema kopi toko.

---

### Fase 2: Visual Produk, Konversi & Interaksi Pembeli (Total: 70 Poin)
Fokus: Meningkatkan daya tarik produk dan mempermudah pemesanan banyak barang sekaligus.

#### US-18 Galeri beberapa foto produk (10 poin)
- **Sebagai pengunjung**, saya ingin melihat beberapa foto dari berbagai sudut pada produk.
- **Kriteria selesai:** Detail produk mendukung slider atau thumbnail foto yang bisa dipilih untuk memperbesar foto utama.

#### US-19 Status stok (5 poin)
- **Sebagai pengunjung**, saya ingin tahu apakah produk sedang ready atau habis sebelum memesan.
- **Kriteria selesai:** Label status stok ('Tersedia' / 'Stok Habis') tampil di kartu dan detail produk; tombol pesan nonaktif jika stok habis.

#### US-20 Harga coret dan badge (5 poin)
- **Sebagai pengunjung**, saya ingin melihat harga diskon (harga coret) dan badge khusus (seperti 'Favorit' atau 'Promo').
- **Kriteria selesai:** Produk dengan promo menampilkan harga coret dan persentase/badge promo yang mencolok namun elegan.

#### US-21 Keranjang, pesan semua via WhatsApp (15 poin)
- **Sebagai pengunjung**, saya ingin memasukkan beberapa produk ke keranjang belanja dan memesan semuanya sekaligus dalam satu pesan WhatsApp.
- **Kriteria selesai:** Drawer / halaman keranjang belanja lokal; dapat menambah/mengurangi qty; tombol checkout WhatsApp memformat seluruh daftar pesanan beserta total harga belanjaan.

#### US-24 Favorit tersimpan di browser (10 poin)
- **Sebagai pengunjung**, saya ingin menandai produk favorit dengan ikon hati dan menyimpannya di browser.
- **Kriteria selesai:** Tombol wishlist/favorit tersimpan di LocalStorage; ada halaman atau modal untuk melihat seluruh produk favorit yang disimpan.

#### US-25 Mode gelap (10 poin)
- **Sebagai pengunjung**, saya ingin beralih antara tema terang dan tema gelap (Dark Mode).
- **Kriteria selesai:** Toggle tema di navbar; preferensi tersimpan di local storage/cookie dan mendukung transisi halus tanpa kedip.

#### US-36 Terakhir dilihat (5 poin)
- **Sebagai pengunjung**, saya ingin melihat daftar produk yang baru saja saya buka sebelumnya.
- **Kriteria selesai:** Section 'Terakhir Dilihat' muncul di bagian bawah halaman katalog/detail berdasarkan riwayat penjelajahan di browser.

#### US-42 Banner promo di beranda (10 poin)
- **Sebagai pengunjung**, saya ingin melihat banner promo interaktif atau pengumuman khusus di halaman utama.
- **Kriteria selesai:** Banner hero atau slider promo di bagian atas katalog beranda yang menarik dan responsif di HP.

---

### Fase 3: Penguatan Operasional & Inventaris Admin (Total: 90 Poin)
Fokus: Mempercepat admin dalam mengelola katalog, kategori, dan impor/ekspor data.

*(Catatan: US-29 Upload foto ke Supabase Storage (15 poin) telah selesai diimplementasikan).*

#### US-30 Dashboard ringkasan admin (10 poin)
- **Sebagai admin**, saya ingin melihat ringkasan statistik toko (total produk, jumlah kategori, produk habis, dsb) saat pertama kali masuk admin.
- **Kriteria selesai:** Kartu metrik di `/admin` menampilkan angka ringkasan riil dari database.

#### US-31 Kelola kategori (15 poin)
- **Sebagai admin**, saya ingin menambah, mengubah, dan menghapus kategori produk secara dinamis.
- **Kriteria selesai:** Halaman khusus manajemen kategori di `/admin/kategori` dengan operasi CRUD terhubung ke tabel kategori.

#### US-32 Aktif atau nonaktifkan produk (10 poin)
- **Sebagai admin**, saya ingin menyembunyikan sementara produk yang belum siap tanpa harus menghapusnya.
- **Kriteria selesai:** Switch / tombol status 'Aktif / Nonaktif'; produk nonaktif tidak muncul di katalog pengunjung publik.

#### US-33 Cari dan paginasi di list admin (10 poin)
- **Sebagai admin**, saya ingin mencari dan menavigasi daftar produk di admin dengan cepat.
- **Kriteria selesai:** Tabel admin dilengkapi kolom search instan dan navigasi halaman / pagination.

#### US-34 Validasi form admin di server (10 poin)
- **Sebagai admin**, saya ingin form produk dicek secara ketat di server (ukuran foto, format harga, batas panjang teks).
- **Kriteria selesai:** Server Action mengembalikan validasi error yang spesifik jika input tidak memenuhi kriteria.

#### US-35 Ekspor produk ke CSV (10 poin)
- **Sebagai admin**, saya ingin mengunduh seluruh data produk ke file CSV untuk laporan atau backup.
- **Kriteria selesai:** Tombol 'Ekspor CSV' di halaman admin yang langsung mengunduh file `.csv` terformat rapi.

#### US-46 Impor produk dari CSV (15 poin)
- **Sebagai admin**, saya ingin mengunggah file CSV untuk memasukkan banyak produk sekaligus.
- **Kriteria selesai:** Form upload file CSV di admin yang memvalidasi dan menginput banyak baris produk ke database.

#### US-47 Atur urutan tampil produk (10 poin)
- **Sebagai admin**, saya ingin menentukan produk mana yang tampil di baris teratas katalog.
- **Kriteria selesai:** Input / opsi urutan posisi tampilan produk di admin yang disimpan ke database.

---

### Fase 4: Tata Kelola Akun, Toko & Analitik Konversi (Total: 60 Poin)
Fokus: Tracking efektivitas jualan serta manajemen profil toko dan akun admin.

#### US-40 Catat klik pesan WhatsApp (10 poin)
- **Sebagai pemilik toko**, saya ingin mencatat setiap kali pengunjung menekan tombol pesan WhatsApp.
- **Kriteria selesai:** Event klik tercatat di database atau tabel analitik sederhana untuk mengukur minat pelanggan.

#### US-41 Produk terlaris di dashboard (10 poin)
- **Sebagai admin**, saya ingin melihat daftar produk yang paling sering diklik / dipesan di dashboard.
- **Kriteria selesai:** Grafik atau daftar peringkat produk teratas berdasarkan data klik pemesanan.

#### US-43 Pengaturan toko dari admin (15 poin)
- **Sebagai admin**, saya ingin mengubah nama toko, nomor WhatsApp, jam buka, dan alamat langsung dari halaman admin tanpa menyentuh kode.
- **Kriteria selesai:** Halaman pengaturan toko di `/admin/pengaturan` yang menyimpan data toko ke database Supabase.

#### US-44 Kelola akun admin (15 poin)
- **Sebagai super admin**, saya ingin mengundang atau mengelola akun admin lain yang boleh login.
- **Kriteria selesai:** Halaman manajemen admin untuk melihat dan menambah user admin baru.

#### US-45 Log aktivitas admin (10 poin)
- **Sebagai admin**, saya ingin riwayat perubahan data (siapa menambah/mengubah produk) tercatat.
- **Kriteria selesai:** Tabel audit log di admin yang mencatat timestamp, user, dan aksi yang dilakukan.

---

### Fase 5: Fitur Interaktif Lanjutan & AI (Total: 80 Poin)
Fokus: Fitur pintar untuk membantu keputusan beli pelanggan.

#### US-37 Bandingkan 2 produk (15 poin)
- **Sebagai pengunjung**, saya ingin membandingkan spesifikasi dan harga dari 2 produk berdampingan.
- **Kriteria selesai:** Modal atau halaman pembanding 2 produk secara side-by-side.

#### US-38 Ulasan dan rating (15 poin)
- **Sebagai pengunjung**, saya ingin memberikan dan melihat ulasan bintang serta komentar di produk.
- **Kriteria selesai:** Form ulasan di detail produk dan tampilan rata-rata rating bintang.

#### US-39 Moderasi ulasan di admin (10 poin)
- **Sebagai admin**, saya ingin menyetujui atau menghapus ulasan pembeli sebelum tampil di publik.
- **Kriteria selesai:** Halaman moderasi ulasan di admin dengan aksi 'Setujui' atau 'Tolak/Hapus'.

#### US-48 Varian harga per ukuran (15 poin)
- **Sebagai pengunjung**, saya ingin memilih ukuran kopi (misal: Regular / Large) dengan harga berbeda.
- **Kriteria selesai:** Pilihan varian pada kartu/detail produk yang otomatis menyesuaikan total harga ke WhatsApp.

#### US-49 Halaman per kategori (10 poin)
- **Sebagai pengunjung**, saya ingin membuka URL khusus per kategori (misal `/kategori/minuman-dingin`).
- **Kriteria selesai:** Rute dinamis `/kategori/[slug]` yang menampilkan produk khusus kategori tersebut dengan SEO title yang sesuai.

#### US-50 Asisten AI tanya jawab produk (15 poin)
- **Sebagai pengunjung**, saya ingin bertanya ke bot AI mengenai rekomendasi menu kopi berdasarkan selera saya.
- **Kriteria selesai:** Widget chat AI di pojok halaman yang menjawab pertanyaan menu berdasarkan data katalog toko.

---

### Fase 6: Standar Keamanan Lanjutan (Total: 60 Poin)
Fokus: Hardening aplikasi untuk standar produksi live.

#### K-6 Header keamanan di aplikasi live (10 poin)
- **Kriteria:** Konfigurasi security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security) di `next.config.js` atau `proxy.js`.

#### K-7 Tanpa dangerouslySetInnerHTML atau eval berbahaya (5 poin)
- **Kriteria:** Kode bersih dari manipulasi DOM berbahaya atau injeksi XSS.

#### K-8 /admin tidak diindeks mesin pencari (10 poin)
- **Kriteria:** Konfigurasi `robots.txt` dan meta tag `noindex, nofollow` khusus seluruh rute `/admin/*`.

#### K-9 Error tidak membocorkan stack trace (5 poin)
- **Kriteria:** Pesan error ke pengguna disanitasi, tidak menampilkan internal error code atau stack trace database.

#### K-10 Dependensi tanpa kerentanan kritis (5 poin)
- **Kriteria:** Hasil `npm audit` bersih dari kerentanan severity critical / high.

#### K-11 Content-Security-Policy ketat (10 poin)
- **Kriteria:** Header CSP aktif membatasi sumber script, style, image (Supabase), dan koneksi hanya ke domain terpercaya.

#### K-12 Rate limit login atau form (10 poin)
- **Kriteria:** Proteksi rate-limiting pada percobaan login admin untuk mencegah serangan brute force.

#### K-13 Tanpa console.log data sensitif (5 poin)
- **Kriteria:** Tidak ada logging email, password, token, atau informasi sensitif di log konsol browser/server.

