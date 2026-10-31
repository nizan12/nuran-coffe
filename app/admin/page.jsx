import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { formatRupiah } from "@/lib/format";
import { imporProdukCSV, toggleProdukAktif } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Dashboard & Kelola Produk - Admin",
};

export default async function HalamanAdmin({ searchParams }) {
  const sp = (await searchParams) || {};
  const cari = sp.cari?.trim() || "";
  const halaman = Math.max(1, parseInt(sp.halaman, 10) || 1);
  const PRODUK_PER_HALAMAN = 8;
  const awal = (halaman - 1) * PRODUK_PER_HALAMAN;
  const akhir = awal + PRODUK_PER_HALAMAN - 1;

  const supabase = buatClientServer();

  // US-33: Cari produk dengan query database ilike dan paginasi dengan count exact
  let query = supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)", { count: "exact" });

  if (cari) {
    query = query.ilike("nama", `%${cari}%`);
  }

  const { data: rawProduk, count, error } = await query
    .order("urutan", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(awal, akhir);

  const totalAdminProduk = count || 0;
  const totalAdminHalaman = Math.ceil(totalAdminProduk / PRODUK_PER_HALAMAN) || 1;

  const pengaturan = await ambilPengaturanAdmin();
  const nonaktifIds = pengaturan.nonaktifIds || [];
  const urutanIds = pengaturan.urutanIds || [];
  const analitikKlik = pengaturan.analitikKlik || {};

  let daftarProduk = normalisasiDaftarProduk(rawProduk);

  // Terapkan kustomisasi urutan tampil (US-47)
  if (urutanIds.length > 0) {
    daftarProduk.sort((a, b) => {
      const idxA = urutanIds.indexOf(a.id);
      const idxB = urutanIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }

  // Hitung metrik ringkasan dashboard (US-30)
  const totalProduk = daftarProduk.length;
  const totalNonaktif = daftarProduk.filter((p) => nonaktifIds.includes(p.id)).length;
  const totalAktif = totalProduk - totalNonaktif;
  const totalKategori = new Set(daftarProduk.map((p) => p.kategori).filter(Boolean)).size;
  const totalHabis = daftarProduk.filter(
    (p) => p.stok === 0 || p.status_stok === "habis" || p.stok_habis === true
  ).length;

  // Hitung rincian jumlah produk per kategori (US-30)
  const produkPerKategori = {};
  daftarProduk.forEach((p) => {
    const kat = p.kategori || "Tanpa Kategori";
    produkPerKategori[kat] = (produkPerKategori[kat] || 0) + 1;
  });

  // Analisis Produk Terlaris / Paling Banyak Dipesan langsung dari tabel database (US-41)
  let listAnalitik = [];
  try {
    const { data: dbKlik } = await supabase
      .from("klik_whatsapp_per_produk")
      .select("*")
      .limit(5);

    if (dbKlik && dbKlik.length > 0) {
      listAnalitik = dbKlik.map((row) => ({
        id: row.produk_id,
        nama: row.nama_produk || "Produk",
        totalKlik: Number(row.total_klik) || 0,
        totalJumlah: Number(row.total_jumlah) || 0,
        totalNilai: Number(row.total_nilai) || 0,
      }));
    }
  } catch {}

  // Fallback query tabel klik_whatsapp jika view belum ada
  if (listAnalitik.length === 0) {
    try {
      const { data: rawKlik } = await supabase
        .from("klik_whatsapp")
        .select("produk_id, nama_produk, harga, jumlah");

      if (rawKlik && rawKlik.length > 0) {
        const grup = {};
        rawKlik.forEach((k) => {
          const pid = k.produk_id || k.nama_produk;
          if (!grup[pid]) {
            grup[pid] = { id: pid, nama: k.nama_produk, totalKlik: 0, totalJumlah: 0, totalNilai: 0 };
          }
          grup[pid].totalKlik += 1;
          grup[pid].totalJumlah += Number(k.jumlah) || 1;
          grup[pid].totalNilai += (Number(k.harga) || 0) * (Number(k.jumlah) || 1);
        });
        listAnalitik = Object.values(grup).sort((a, b) => b.totalKlik - a.totalKlik).slice(0, 5);
      }
    } catch {}
  }

  // Fallback ke analitikKlik pengaturan jika DB belum terisi
  if (listAnalitik.length === 0) {
    listAnalitik = Object.values(analitikKlik).sort(
      (a, b) => (b.totalKlik || 0) - (a.totalKlik || 0)
    ).slice(0, 5);
  }

  const maxKlik = listAnalitik[0]?.totalKlik || 1;
  const totalSeluruhKlik = listAnalitik.reduce((sum, item) => sum + (item.totalKlik || 0), 0);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      {/* Kartu Metrik Ringkasan Dashboard Admin (US-30) */}
      <section aria-labelledby="judul-ringkasan" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <h2 id="judul-ringkasan" className="sr-only">Ringkasan Statistik Toko</h2>
        
        <div className="rounded-2xl border border-garis bg-permukaan p-4">
          <p className="text-xs font-semibold text-teks-lembut">Total Produk</p>
          <p className="mt-1.5 text-2xl font-black text-teks">{totalProduk}</p>
          <span className="text-[11px] text-teks-lembut">Item di database</span>
        </div>

        <div className="rounded-2xl border border-garis bg-permukaan p-4">
          <p className="text-xs font-semibold text-teks-lembut">Produk Aktif</p>
          <p className="mt-1.5 text-2xl font-black text-emerald-600">{totalAktif}</p>
          <span className="text-[11px] text-teks-lembut">Tampil di katalog</span>
        </div>

        <div className="rounded-2xl border border-garis bg-permukaan p-4">
          <p className="text-xs font-semibold text-teks-lembut">Kategori Menu</p>
          <p className="mt-1.5 text-2xl font-black text-teks">{totalKategori}</p>
          <span className="text-[11px] text-teks-lembut">Varian kategori</span>
        </div>

        <div className="rounded-2xl border border-garis bg-permukaan p-4">
          <p className="text-xs font-semibold text-teks-lembut">Total Pesanan WA</p>
          <p className="mt-1.5 text-2xl font-black text-utama">{totalSeluruhKlik}</p>
          <span className="text-[11px] text-teks-lembut">Klik pemesanan tercatat</span>
        </div>
      </section>

      {/* Produk Terlaris / Paling Banyak Dipesan (US-41) */}
      <section aria-labelledby="judul-terlaris" className="rounded-2xl border border-garis bg-permukaan p-5">
        <div className="flex items-center justify-between border-b border-garis pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-utama/10 text-utama">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
              </svg>
            </div>
            <h2 id="judul-terlaris" className="text-base font-bold text-teks">
              Produk Terpopuler (Berdasarkan Klik WhatsApp)
            </h2>
          </div>
          <span className="text-xs text-teks-lembut">Paling diminati</span>
        </div>

        {listAnalitik.length === 0 ? (
          <div className="py-6 text-center text-xs text-teks-lembut">
            Belum ada klik pemesanan yang tercatat. Statistik akan otomatis terisi setiap kali pengunjung menekan tombol WhatsApp atau checkout keranjang.
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {listAnalitik.slice(0, 5).map((item, index) => {
              const persentase = Math.min(100, Math.round((item.totalKlik / maxKlik) * 100));
              return (
                <div key={item.id || index} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-latar border border-garis font-bold text-[10px] text-teks">
                        {index + 1}
                      </span>
                      <span className="font-bold text-teks">{item.nama}</span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-teks-lembut">
                      <span>{item.totalKlik}x pesanan</span>
                      <span className="font-bold text-harga">{formatRupiah(item.totalNilai || 0)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-latar border border-garis/50">
                    <div
                      className="h-full rounded-full bg-utama transition-all duration-500"
                      style={{ width: `${persentase}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Rincian Jumlah Produk per Kategori (US-30) */}
      <section aria-labelledby="judul-rincian-kategori" className="rounded-2xl border border-garis bg-permukaan p-5">
        <h2 id="judul-rincian-kategori" className="text-base font-bold text-teks mb-3">
          Rincian Jumlah Produk per Kategori
        </h2>
        {Object.keys(produkPerKategori).length === 0 ? (
          <p className="text-xs text-teks-lembut">Belum ada kategori yang tercatat.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(produkPerKategori).map(([kat, count]) => (
              <div key={kat} className="rounded-xl border border-garis bg-latar p-3">
                <p className="text-xs font-semibold text-teks-lembut truncate">{kat}</p>
                <p className="mt-1 text-xl font-black text-teks">
                  {count} <span className="text-xs font-normal text-teks-lembut">menu</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Header Bagian Tabel & Aksi Ekspor CSV (US-35) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Kelola Produk</h1>
          <p className="text-xs text-teks-lembut mt-0.5">
            Atur katalog, urutan prioritas, dan ekspor/impor data produk tokomu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Ekspor CSV (US-35) */}
          <a
            href="/admin/ekspor-csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-permukaan px-3 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition shadow-2xs"
            title="Unduh seluruh data produk ke file CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-teks-lembut">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 1 1.5 0v3.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V8.75Z" clipRule="evenodd" />
            </svg>
            <span>Ekspor CSV</span>
          </a>
          <Tombol href="/admin/produk/baru">+ Tambah Produk</Tombol>
        </div>
      </div>

      {/* Toolbar: Pencarian Produk (US-33) & Form Impor CSV (US-46) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-garis bg-permukaan p-4">
        {/* Form Cari Produk Admin (US-33) */}
        <form method="GET" action="/admin" className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="search"
            name="cari"
            defaultValue={cari}
            placeholder="Cari nama produk di database admin…"
            className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-utama px-3.5 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition cursor-pointer"
          >
            Cari
          </button>
          {cari && (
            <Link href="/admin" className="text-xs text-red-500 hover:underline">
              Reset
            </Link>
          )}
        </form>

        {/* Form Impor Produk CSV (US-46) */}
        <form
          action={imporProdukCSV}
          encType="multipart/form-data"
          className="flex flex-wrap items-center gap-2"
        >
          <label className="text-xs font-semibold text-teks-lembut whitespace-nowrap">
            Impor CSV:
          </label>
          <input
            type="file"
            name="file_csv"
            accept=".csv"
            required
            className="text-xs text-teks file:mr-2 file:rounded-lg file:border-0 file:bg-utama/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-utama hover:file:bg-utama/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-utama px-3 py-1 text-xs font-bold text-white hover:bg-utama-gelap transition cursor-pointer"
          >
            Unggah
          </button>
        </form>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">
          {cari ? `Tidak ada produk dengan kata kunci "${cari}".` : "Belum ada produk di database."}
        </p>
      ) : (
        <>
          <TabelProduk daftarProduk={daftarProduk} nonaktifIds={nonaktifIds} />

          {/* Navigasi Paginasi Admin (US-33) */}
          {totalAdminHalaman > 1 && (
            <div className="flex items-center justify-between border-t border-garis pt-4 text-xs text-teks-lembut">
              <span>
                Halaman {halaman} dari {totalAdminHalaman} (Total {totalAdminProduk} produk)
              </span>
              <div className="flex items-center gap-2">
                {halaman > 1 && (
                  <Link
                    href={`/admin?halaman=${halaman - 1}${cari ? `&cari=${encodeURIComponent(cari)}` : ""}`}
                    className="rounded-lg border border-garis bg-permukaan px-3 py-1.5 font-semibold text-teks hover:border-utama hover:text-utama"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {halaman < totalAdminHalaman && (
                  <Link
                    href={`/admin?halaman=${halaman + 1}${cari ? `&cari=${encodeURIComponent(cari)}` : ""}`}
                    className="rounded-lg border border-garis bg-permukaan px-3 py-1.5 font-semibold text-teks hover:border-utama hover:text-utama"
                  >
                    Selanjutnya →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
