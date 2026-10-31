import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";
import { toko } from "@/lib/toko";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const namaKategori = decodeURIComponent(slug).replace(/-/g, " ");

  return {
    title: `Kategori ${namaKategori} - ${toko.nama}`,
    description: `Daftar aneka pilihan menu ${namaKategori} di ${toko.nama}. Siap dipesan via WhatsApp.`,
  };
}

export default async function HalamanKategori({ params, searchParams }) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const urutan = sp.urutan || "";
  const decodedSlug = decodeURIComponent(slug);

  const supabase = buatClientServer();

  // US-15 & US-47: Query produk dengan pengurutan dinamis (urutan prioritas, harga termurah, harga termahal, terbaru)
  let query = supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)");

  if (urutan === "termurah") {
    query = query.order("harga", { ascending: true });
  } else if (urutan === "termahal") {
    query = query.order("harga", { ascending: false });
  } else if (urutan === "terbaru") {
    query = query.order("created_at", { ascending: false });
  } else {
    // US-47: Urutan default katalog publik berdasarkan kolom urutan di database
    query = query
      .order("urutan", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
  }

  // Jalankan query produk dan pengaturan publik secara paralel
  const [produkRes, pengaturan] = await Promise.all([
    query,
    ambilPengaturanPublik(),
  ]);

  if (produkRes.error || !produkRes.data) {
    notFound();
  }

  const daftarProduk = normalisasiDaftarProduk(produkRes.data);
  const nonaktifIds = pengaturan.nonaktifIds || [];

  // Filter produk aktif yang cocok dengan slug kategori
  const terfilter = daftarProduk.filter((p) => {
    if (nonaktifIds.includes(p.id) || p.aktif === false) return false;
    const kat = p.kategori || "";
    return (
      slugify(kat) === slugify(decodedSlug) ||
      kat.toLowerCase() === decodedSlug.toLowerCase() ||
      p.kategori_slug === decodedSlug
    );
  });

  // Jika kategori tidak memiliki produk atau tidak ditemukan, kembalikan 404 notFound (US-49)
  if (terfilter.length === 0) {
    notFound();
  }

  const namaKategoriTampil =
    terfilter[0]?.kategori || decodedSlug.replace(/-/g, " ");

  return (
    <div className="py-8 md:py-12">
      {/* Breadcrumb Navigasi */}
      <nav className="flex items-center gap-2 text-xs text-teks-lembut">
        <Link href="/" className="hover:text-utama transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-teks">Kategori</span>
        <span>/</span>
        <span className="font-bold text-utama capitalize">{namaKategoriTampil}</span>
      </nav>

      {/* Header Halaman Kategori */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-garis pb-6">
        <div>
          <h1 className="text-3xl font-extrabold capitalize tracking-tight text-teks sm:text-4xl">
            Menu {namaKategoriTampil}
          </h1>
          <p className="mt-2 text-sm text-teks-lembut">
            Menampilkan {terfilter.length} pilihan menu untuk kategori ini.
          </p>
        </div>

        {/* US-15: Navigasi Urutkan Produk */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-teks-lembut mr-1">Urutkan:</span>
          <Link
            href={`/kategori/${slug}`}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              !urutan ? "bg-utama text-white shadow-2xs" : "border border-garis bg-permukaan text-teks hover:border-utama"
            }`}
          >
            Terbaru
          </Link>
          <Link
            href={`/kategori/${slug}?urutan=termurah`}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              urutan === "termurah" ? "bg-utama text-white shadow-2xs" : "border border-garis bg-permukaan text-teks hover:border-utama"
            }`}
          >
            Terendah
          </Link>
          <Link
            href={`/kategori/${slug}?urutan=termahal`}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              urutan === "termahal" ? "bg-utama text-white shadow-2xs" : "border border-garis bg-permukaan text-teks hover:border-utama"
            }`}
          >
            Tertinggi
          </Link>
        </div>
      </div>

      {/* Grid Produk */}
      {terfilter.length === 0 ? (
        <div className="py-16 text-center text-teks-lembut">
          <p className="font-semibold text-teks">Belum Ada Produk di Kategori Ini</p>
          <p className="mt-1 text-xs">Silakan kembali ke katalog untuk melihat menu lainnya.</p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition"
          >
            Lihat Semua Menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {terfilter.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}
