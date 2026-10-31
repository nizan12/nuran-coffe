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
  let ids = [];

  if (sp.ids) {
    ids = sp.ids.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    if (sp.id1) ids.push(sp.id1);
    if (sp.id2) ids.push(sp.id2);
  }

  // Batas maksimal 2 produk (US-37)
  ids = ids.slice(0, 2);

  const supabase = buatClientServer();
  let produkBandingkan = [];

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

      {produkBandingkan.length < 2 ? (
        <div className="flex min-h-[35vh] flex-col items-center justify-center rounded-3xl border border-dashed border-garis bg-permukaan/40 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-utama/10 text-utama mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
              <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-teks">Pilih 2 Menu untuk Dibandingkan</h2>
          <p className="mt-1 max-w-sm text-xs text-teks-lembut">
            Silakan tekan tombol perbandingan pada kartu katalog menu untuk membandingkan 2 minuman atau makanan secara langsung.
          </p>
          <div className="mt-5">
            <Tombol href="/" varian="utama">
              Buka Katalog Menu
            </Tombol>
          </div>
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
