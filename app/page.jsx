import KartuProduk from "@/components/KartuProduk";
import FilterProduk from "@/components/FilterProduk";
import Paginasi from "@/components/Paginasi";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import BannerPromo from "@/components/BannerPromo";
import { toko } from "@/lib/toko";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

const PRODUK_PER_HALAMAN = 6;

export default async function HalamanKatalog({ searchParams }) {
  const { kategori, cari, urutan, halaman } = await searchParams;

  let daftarProduk = [];
  let semuaProduk = [];
  let error = null;

  try {
    const supabase = buatClientServer();

    // Ambil semua produk beserta relasi kategori_id
    const { data, error: sbError } = await supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .order("created_at", { ascending: false });

    if (sbError) {
      throw sbError;
    }

    semuaProduk = normalisasiDaftarProduk(data ?? []);

    const pengaturan = await ambilPengaturanAdmin();
    const nonaktifIds = pengaturan.nonaktifIds || [];
    const urutanIds = pengaturan.urutanIds || [];

    // Filter di server: sembunyikan produk nonaktif dari publik (US-32)
    daftarProduk = semuaProduk.filter((p) => !nonaktifIds.includes(p.id));

    if (kategori) {
      daftarProduk = daftarProduk.filter((p) => p.kategori === kategori);
    }

    if (cari) {
      const kata = cari.toLowerCase();
      daftarProduk = daftarProduk.filter((p) =>
        p.nama.toLowerCase().includes(kata)
      );
    }

    // Urutkan produk (US-15 & US-47)
    if (urutan === "termurah") {
      daftarProduk.sort((a, b) => (Number(a.harga) || 0) - (Number(b.harga) || 0));
    } else if (urutan === "termahal") {
      daftarProduk.sort((a, b) => (Number(b.harga) || 0) - (Number(a.harga) || 0));
    } else if (urutan === "nama-asc") {
      daftarProduk.sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (urutanIds.length > 0) {
      // Terapkan urutan kustom prioritas admin (US-47)
      daftarProduk.sort((a, b) => {
        const idxA = urutanIds.indexOf(a.id);
        const idxB = urutanIds.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
    } else {
      // Default: terbaru
      daftarProduk.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }
  } catch (err) {
    console.error("Gagal mengambil data produk:", err);
    error = err.message || "Terjadi kesalahan saat mengambil data produk.";
  }

  // Ambil banner promo dari tabel `banner` Supabase jika ada (US-42)
  let daftarBanner = [];
  try {
    const supabase = buatClientServer();
    const { data: bannerData } = await supabase
      .from("banner")
      .select("*")
      .eq("aktif", true)
      .order("urutan", { ascending: true });
    if (bannerData && bannerData.length > 0) {
      daftarBanner = bannerData;
    }
  } catch { }

  // Hitung paginasi (US-16)
  const totalProduk = daftarProduk.length;
  const totalHalaman = Math.ceil(totalProduk / PRODUK_PER_HALAMAN) || 1;
  const halamanSekarang = Math.max(1, Math.min(Number(halaman) || 1, totalHalaman));
  const awal = (halamanSekarang - 1) * PRODUK_PER_HALAMAN;
  const akhir = awal + PRODUK_PER_HALAMAN;
  const produkDitampilkan = daftarProduk.slice(awal, akhir);

  // Kumpulkan kategori unik untuk filter (gabungkan dengan kategori admin US-31)
  const kategoriList = [
    ...new Set(semuaProduk.map((p) => p.kategori).filter(Boolean)),
  ].sort();

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      {/* Banner Promo Interaktif (US-42) */}
      <BannerPromo slides={daftarBanner} />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {!error && semuaProduk.length > 0 && (
          <FilterProduk kategoriList={kategoriList} />
        )}

        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">Gagal memuat produk</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="py-12 text-center text-teks-lembut">
            {kategori || cari ? "Tidak ada produk yang cocok" : "Belum ada produk"}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {produkDitampilkan.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            <Paginasi
              halamanSekarang={halamanSekarang}
              totalHalaman={totalHalaman}
              totalProduk={totalProduk}
              itemPerHalaman={PRODUK_PER_HALAMAN}
              params={{ kategori, cari, urutan }}
            />
          </>
        )}
      </section>

      {/* Bagian Terakhir Dilihat (US-36) */}
      <TerakhirDilihat />
    </>
  );
}
