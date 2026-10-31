import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Dashboard & Kelola Produk - Admin",
};

export default async function HalamanAdmin() {
  const supabase = buatClientServer();
  const { data: rawProduk, error } = await supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .order("created_at", { ascending: false });

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

  // Analisis Produk Terlaris / Paling Banyak Dipesan (US-41)
  const listAnalitik = Object.values(analitikKlik).sort(
    (a, b) => (b.totalKlik || 0) - (a.totalKlik || 0)
  );
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

      {/* Header Bagian Tabel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Kelola Produk</h1>
          <p className="text-xs text-teks-lembut mt-0.5">
            Atur katalog, urutan prioritas, dan ekspor/impor data produk tokomu.
          </p>
        </div>
        <Tombol href="/admin/produk/baru">+ Tambah Produk</Tombol>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">Belum ada produk di database.</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} nonaktifIds={nonaktifIds} />
      )}
    </div>
  );
}
