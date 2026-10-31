-- ==============================================================================
-- Skema Database Katalog UMKM Kedai Kopi (Supabase / PostgreSQL)
-- ==============================================================================
-- Cara pakai:
-- 1. Buka Supabase Dashboard > SQL Editor > New query
-- 2. Tempel seluruh isi file ini
-- 3. Klik "Run" (Aman dijalankan ulang, semua tabel memakai IF NOT EXISTS)
-- ==============================================================================

-- ==============================================================================
-- 1. TABEL KATEGORI (Kelompok Menu Kopi & Camilan)
-- ==============================================================================
create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null unique,
  slug text not null unique,
  deskripsi text,
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 2. TABEL PRODUK (Katalog Menu Utama - Berelasi ke Kategori)
-- ==============================================================================
create table if not exists public.produk (
  id bigint generated always as identity primary key,
  nama text not null,
  harga integer not null check (harga >= 0),
  deskripsi text,
  foto_url text,
  image text,
  kategori_id bigint references public.kategori(id) on delete set null,
  harga_coret integer check (harga_coret is null or harga_coret >= 0),
  stok integer not null default 10,
  aktif boolean not null default true,
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);

-- Migrasi kolom tambahan jika tabel produk sudah dibuat sebelumnya
alter table public.produk add column if not exists image text;
alter table public.produk add column if not exists kategori_id bigint references public.kategori(id) on delete set null;
alter table public.produk add column if not exists harga_coret integer check (harga_coret is null or harga_coret >= 0);
alter table public.produk add column if not exists stok integer not null default 10;
alter table public.produk add column if not exists aktif boolean not null default true;
alter table public.produk add column if not exists urutan integer not null default 0;

-- Hapus view lama terlebih dahulu jika bergantung pada kolom kategori
drop view if exists public.klik_whatsapp_per_produk cascade;

-- Hapus kolom redundant `kategori` text (digantikan oleh relasi resmi `kategori_id`)
alter table public.produk drop column if exists kategori;

-- ==============================================================================
-- 3. TABEL VARIAN PRODUK (Pilihan Ukuran, Suhu, Rasa, Ekstra Shot)
-- ==============================================================================
create table if not exists public.varian (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  harga_tambahan integer not null default 0,
  stok integer default null,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. TABEL BANNER (Slide Promosi & Pengumuman Beranda)
-- ==============================================================================
create table if not exists public.banner (
  id bigint generated always as identity primary key,
  judul text not null,
  subjudul text,
  deskripsi text,
  badge text default 'PROMO SPESIAL',
  tombol_teks text default 'Pesan via WhatsApp',
  foto_url text,
  link_url text default '/',
  tipe text default 'coffee',
  bg_gradient text default 'from-emerald-950 via-utama-gelap to-utama',
  is_external boolean not null default false,
  aktif boolean not null default true,
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 5. TABEL KLIK WHATSAPP (Analitik Pemesanan WhatsApp Pengunjung)
-- ==============================================================================
create table if not exists public.klik_whatsapp (
  id bigint generated always as identity primary key,
  produk_id bigint references public.produk(id) on delete set null,
  nama_produk text not null,
  harga integer not null default 0,
  jumlah integer not null default 1,
  sumber text default 'detail',
  ip_address text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 6. VIEW KLIK WHATSAPP PER PRODUK (Peringkat Menu Terlaris di Dashboard Admin)
-- ==============================================================================
create or replace view public.klik_whatsapp_per_produk as
select 
  coalesce(p.id, k.produk_id) as produk_id,
  coalesce(p.nama, k.nama_produk) as nama_produk,
  p.foto_url,
  kat.nama as kategori,
  count(k.id) as total_klik,
  coalesce(sum(k.jumlah), 0) as total_jumlah,
  coalesce(sum(k.harga * k.jumlah), 0) as total_nilai,
  max(k.created_at) as klik_terakhir
from public.klik_whatsapp k
left join public.produk p on k.produk_id = p.id
left join public.kategori kat on p.kategori_id = kat.id
group by coalesce(p.id, k.produk_id), coalesce(p.nama, k.nama_produk), p.foto_url, kat.nama
order by total_klik desc;

-- ==============================================================================
-- 7. TABEL ULASAN (Review Bintang & Testimoni Pelanggan)
-- ==============================================================================
create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  komentar text not null,
  disetujui boolean not null default true,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 8. TABEL PENGATURAN TOKO (Profil, Kontak WA, Jam Buka, Lokasi)
-- ==============================================================================
create table if not exists public.pengaturan_toko (
  id bigint generated always as identity primary key,
  nama text not null,
  nomor_whatsapp text not null,
  alamat text,
  jam_buka text,
  tagline text,
  deskripsi text,
  instagram text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 9. TABEL LOG AKTIVITAS (Audit Trail Admin)
-- ==============================================================================
create table if not exists public.log_aktivitas (
  id bigint generated always as identity primary key,
  admin_email text,
  aksi text not null,
  rincian text,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- INDEKS PERFORMA
-- ==============================================================================
create index if not exists idx_produk_kategori_id on public.produk(kategori_id);
create index if not exists idx_produk_aktif on public.produk(aktif);
create index if not exists idx_varian_produk on public.varian(produk_id);
create index if not exists idx_ulasan_produk on public.ulasan(produk_id, disetujui);
create index if not exists idx_klik_wa_produk on public.klik_whatsapp(produk_id);
create index if not exists idx_banner_aktif on public.banner(aktif, urutan);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- ==============================================================================
alter table public.kategori enable row level security;
alter table public.produk enable row level security;
alter table public.varian enable row level security;
alter table public.banner enable row level security;
alter table public.klik_whatsapp enable row level security;
alter table public.ulasan enable row level security;
alter table public.pengaturan_toko enable row level security;
alter table public.log_aktivitas enable row level security;

-- Hapus kebijakan lama jika ada agar aman dijalankan berulang
drop policy if exists "admin_semua_kategori" on public.kategori;
drop policy if exists "publik_baca_kategori" on public.kategori;
drop policy if exists "admin_baca_produk" on public.produk;
drop policy if exists "admin_tambah_produk" on public.produk;
drop policy if exists "admin_ubah_produk" on public.produk;
drop policy if exists "admin_hapus_produk" on public.produk;
drop policy if exists "admin_semua_varian" on public.varian;
drop policy if exists "publik_baca_varian" on public.varian;
drop policy if exists "admin_semua_banner" on public.banner;
drop policy if exists "publik_baca_banner" on public.banner;
drop policy if exists "admin_semua_klik_wa" on public.klik_whatsapp;
drop policy if exists "publik_tambah_klik_wa" on public.klik_whatsapp;
drop policy if exists "admin_semua_ulasan" on public.ulasan;
drop policy if exists "publik_baca_ulasan" on public.ulasan;
drop policy if exists "publik_tambah_ulasan" on public.ulasan;
drop policy if exists "admin_semua_pengaturan" on public.pengaturan_toko;
drop policy if exists "publik_baca_pengaturan" on public.pengaturan_toko;
drop policy if exists "admin_semua_log" on public.log_aktivitas;

-- 1. Kategori
create policy "publik_baca_kategori" on public.kategori for select using (true);
create policy "admin_semua_kategori" on public.kategori for all to authenticated using (true) with check (true);

-- 2. Produk
create policy "admin_baca_produk" on public.produk for select to authenticated using (true);
create policy "admin_tambah_produk" on public.produk for insert to authenticated with check (true);
create policy "admin_ubah_produk" on public.produk for update to authenticated using (true) with check (true);
create policy "admin_hapus_produk" on public.produk for delete to authenticated using (true);

-- 3. Varian
create policy "publik_baca_varian" on public.varian for select using (true);
create policy "admin_semua_varian" on public.varian for all to authenticated using (true) with check (true);

-- 4. Banner
create policy "publik_baca_banner" on public.banner for select using (true);
create policy "admin_semua_banner" on public.banner for all to authenticated using (true) with check (true);

-- 5. Klik WhatsApp
create policy "publik_tambah_klik_wa" on public.klik_whatsapp for insert with check (true);
create policy "admin_semua_klik_wa" on public.klik_whatsapp for all to authenticated using (true) with check (true);

-- 6. Ulasan
create policy "publik_baca_ulasan" on public.ulasan for select using (disetujui = true);
create policy "publik_tambah_ulasan" on public.ulasan for insert with check (true);
create policy "admin_semua_ulasan" on public.ulasan for all to authenticated using (true) with check (true);

-- 7. Pengaturan Toko
create policy "publik_baca_pengaturan" on public.pengaturan_toko for select using (true);
create policy "admin_semua_pengaturan" on public.pengaturan_toko for all to authenticated using (true) with check (true);

-- 8. Log Aktivitas
create policy "admin_semua_log" on public.log_aktivitas for all to authenticated using (true) with check (true);

-- ==============================================================================
-- DATA AWAL (SEED DATA - Hanya dimasukkan bila tabel masing-masing masih kosong)
-- ==============================================================================

-- A. Kategori Awal Kedai Kopi
insert into public.kategori (nama, slug, deskripsi, urutan)
select * from (values
  ('Minuman', 'minuman', 'Aneka kopi espresso, racikan susu, dan olahan teh segar.', 1),
  ('Espresso Based', 'espresso-based', 'Kopi murni ekstraksi mesin profesional dengan aroma pekat.', 2),
  ('Manual Brew', 'manual-brew', 'Seduhan kopi single origin nusantara dengan metode pour over v60.', 3),
  ('Camilan', 'camilan', 'Kudapan gurih dan renyah pendamping ngopi.', 4),
  ('Pastry', 'pastry', 'Pastry panggang hangat freshly baked setiap hari.', 5)
) as data_kategori (nama, slug, deskripsi, urutan)
where not exists (select 1 from public.kategori);

-- B. Banner Promosi Awal
insert into public.banner (judul, subjudul, deskripsi, badge, tombol_teks, link_url, tipe, bg_gradient, is_external, aktif, urutan)
select * from (values
  (
    'Diskon 20% Aneka Kopi Robusta & Arabika',
    'Sangrai Nusantara Pilihan',
    'Biji kopi pilihan sangrai nusantara, siap dipesan langsung dan diantar segar ke tempat Anda.',
    'PROMO SPESIAL',
    'Pesan via WhatsApp',
    'https://wa.me/6285156670861?text=Halo%2C%20saya%20tertarik%20dengan%20Promo%20Diskon%2020%25%20Kopi.',
    'coffee',
    'from-emerald-950 via-utama-gelap to-utama',
    true,
    true,
    1
  ),
  (
    'Bebas Biaya Kirim Area Batam Center',
    'Gratis Ongkir Khusus Pelanggan Lokal',
    'Pesan menu kopi dan camilan favorit tanpa minimum order untuk area terdekat toko kami.',
    'GRATIS ONGKIR',
    'Lihat Lokasi & Jam Buka',
    '/tentang',
    'delivery',
    'from-amber-950 via-stone-900 to-amber-900',
    false,
    true,
    2
  ),
  (
    'Es Kopi Susu Aren Gula Melaka',
    'Menu Favorit Baru',
    'Perpaduan espresso mantap, susu creamy, dan manis legit gula aren murni khas nusantara.',
    'MENU BARU',
    'Jelajahi Menu Minuman',
    '/?kategori=Minuman',
    'sparkle',
    'from-stone-950 via-stone-900 to-emerald-950',
    false,
    true,
    3
  )
) as data_banner (judul, subjudul, deskripsi, badge, tombol_teks, link_url, tipe, bg_gradient, is_external, aktif, urutan)
where not exists (select 1 from public.banner);

-- C. Pengaturan Toko Awal
insert into public.pengaturan_toko (nama, nomor_whatsapp, alamat, jam_buka, tagline, deskripsi, instagram)
select * from (values
  (
    'Narun Artisan Coffee',
    '6285156670861',
    'Batam Center, Teluk Tering, Kepulauan Riau',
    'Setiap hari, 08.00–20.00',
    'Kelezatan Kopi Nusantara Pilihan & Pastry Panggang Segar, Diseduh Penuh Cerita.',
    'Kedai kopi artisan lokal yang menghadirkan seduhan biji kopi Nusantara pilihan, racikan minuman signature istimewa, serta pastry panggang segar yang siap menemani setiap momen santaimu.',
    '@naruncoffee'
  )
) as data_toko (nama, nomor_whatsapp, alamat, jam_buka, tagline, deskripsi, instagram)
where not exists (select 1 from public.pengaturan_toko);
