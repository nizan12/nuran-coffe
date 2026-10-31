import Link from "next/link";
import { notFound } from "next/navigation";
import { buatClientServer, normalisasiProduk } from "@/lib/supabase";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import Tombol from "@/components/Tombol";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandingkan Menu Produk",
  description: "Bandingkan 2 pilihan menu kopi atau camilan sebelum memesan.",
};

export default async function HalamanBandingkan({ searchParams }) {
  const sp = (await searchParams) || {};
  let rawIds = [];

  if (sp.ids) {
    rawIds = sp.ids.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    if (sp.id1) rawIds.push(String(sp.id1).trim());
    if (sp.id2) rawIds.push(String(sp.id2).trim());
  }

  // Pesan peringatan jika memilih lebih dari 2 produk (US-37)
  const melebihiBatas = rawIds.length > 2;
  const pesanBatas = melebihiBatas
    ? `Perhatian: Perbandingan dibatasi maksimal 2 produk. Anda memilih ${rawIds.length} produk, menampilkan 2 produk pertama.`
    : null;

  // Batas maksimal 2 produk (US-37)
  const ids = rawIds.slice(0, 2);

  const supabase = buatClientServer();
  let produkBandingkan = [];

  // Ambil semua produk untuk UI pemilihan 2 produk (US-37)
  const { data: semuaData } = await supabase
    .from("produk")
    .select("id, nama, harga, kategori")
    .order("nama", { ascending: true });
  const semuaProduk = semuaData || [];

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .in("id", ids);

    if (error || !data || data.length === 0) {
      notFound();
    }

    produkBandingkan = data.map(normalisasiProduk);
  }

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-teks-lembut mb-4">
        <Link href="/" className="hover:text-utama transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-teks">Bandingkan Produk</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teks">
            Perbandingan Menu Pilihan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-teks-lembut">
            Bandingkan harga, stok, dan komposisi 2 pilihan menu kopi favoritmu berdampingan (Maks. 2 produk).
          </p>
        </div>
        <Tombol href="/" varian="garis">
          ← Kembali ke Katalog
        </Tombol>
      </div>

      {/* Pesan Peringatan Melebihi 2 Produk (US-37) */}
      {pesanBatas && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-3.5 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-amber-600">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>{pesanBatas}</span>
        </div>
      )}

      {/* UI Pemilih 2 Produk Langsung di Halaman (US-37) */}
      <div className="mb-6 rounded-2xl border border-garis bg-permukaan/50 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-teks mb-2.5">Pilih 2 Menu untuk Dibandingkan:</h2>
        <form method="GET" action="/bandingkan" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label htmlFor="select-p1" className="sr-only">Menu Pertama</label>
            <select
              id="select-p1"
              name="id1"
              defaultValue={ids[0] || ""}
              className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs font-medium text-teks focus:border-utama focus:outline-none"
              required
            >
              <option value="">-- Pilih Menu Pertama --</option>
              {semuaProduk.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({formatRupiah(p.harga)})
                </option>
              ))}
            </select>
          </div>

          <span className="text-center font-extrabold text-xs text-teks-lembut sm:px-1">VS</span>

          <div className="flex-1">
            <label htmlFor="select-p2" className="sr-only">Menu Kedua</label>
            <select
              id="select-p2"
              name="id2"
              defaultValue={ids[1] || ""}
              className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs font-medium text-teks focus:border-utama focus:outline-none"
              required
            >
              <option value="">-- Pilih Menu Kedua --</option>
              {semuaProduk.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({formatRupiah(p.harga)})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition shadow-xs"
          >
            Bandingkan
          </button>
        </form>
      </div>

      {produkBandingkan.length < 2 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-3xl border border-dashed border-garis bg-permukaan/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-utama/10 text-utama mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-teks">Pilih 2 Menu pada Form di Atas</h2>
          <p className="mt-1 max-w-sm text-xs text-teks-lembut">
            Pilih dua menu pada dropdown di atas atau tekan tombol bandingkan pada kartu katalog menu.
          </p>
        </div>
      ) : (
        /* Tabel Komparasi Berdampingan 2 Produk (US-37) */
        <div className="overflow-x-auto rounded-3xl border border-garis bg-latar shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-permukaan border-b border-garis">
              <tr>
                <th className="p-4 sm:p-5 w-1/3 text-xs font-bold text-teks-lembut uppercase tracking-wider">
                  Kriteria
                </th>
                {produkBandingkan.map((p) => (
                  <th key={p.id} className="p-4 sm:p-5 w-1/3 font-bold text-teks">
                    <div className="flex flex-col items-center text-center gap-2">
                      <img
                        src={ambilFotoUtama(p)}
                        alt={p.nama}
                        className="h-28 w-28 rounded-2xl object-cover border border-garis shadow-2xs"
                      />
                      <Link
                        href={`/produk/${p.id}`}
                        className="font-extrabold text-sm hover:text-utama transition line-clamp-2"
                      >
                        {p.nama}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-garis text-xs">
              <tr>
                <td className="p-4 font-bold text-teks-lembut bg-permukaan/30">Harga Satuan</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="p-4 text-center font-black text-harga text-base">
                    {formatRupiah(p.harga)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-teks-lembut bg-permukaan/30">Kategori Menu</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="p-4 text-center font-semibold text-teks">
                    {p.kategori || "Menu"}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-teks-lembut bg-permukaan/30">Ketersediaan Stok</td>
                {produkBandingkan.map((p) => {
                  const habis = p.stok === 0 || p.status_stok === "habis";
                  return (
                    <td key={p.id} className="p-4 text-center font-semibold">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          habis ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-700"
                        }`}
                      >
                        {habis ? "Habis" : `Tersedia (${p.stok || 10} porsi)`}
                      </span>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-4 font-bold text-teks-lembut bg-permukaan/30">Deskripsi Rasa & Bahan</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="p-4 text-center text-teks-lembut leading-relaxed">
                    {p.deskripsi || "—"}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-teks-lembut bg-permukaan/30">Aksi Pemesanan</td>
                {produkBandingkan.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <Tombol href={`/produk/${p.id}`} varian="utama" className="w-full text-xs font-bold py-2">
                      Lihat & Pesan WhatsApp
                    </Tombol>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
