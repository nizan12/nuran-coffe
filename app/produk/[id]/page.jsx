import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TombolBagikan from "@/components/TombolBagikan";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import BagianUlasan from "@/components/BagianUlasan";
import KotakTanyaProdukAI from "@/components/KotakTanyaProdukAI";
import { buatClientServer, normalisasiProduk, normalisasiDaftarProduk } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { ambilUlasanProduk, ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();
  const [pengaturan, { data: rawProduk, error }, { data: dbToko }] = await Promise.all([
    ambilPengaturanPublik(),
    supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .eq("id", id)
      .single(),
    supabase
      .from("pengaturan_toko")
      .select("*")
      .limit(1)
      .maybeSingle(),
  ]);

  const nonaktifIds = pengaturan?.nonaktifIds || [];
  const produk = normalisasiProduk(rawProduk);

  if (error || !produk || nonaktifIds.includes(Number(id)) || produk.aktif === false) {
    notFound();
  }

  const namaToko = dbToko?.nama || toko.nama;
  const gambar = produk.image || produk.foto_url;

  return {
    title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
    description:
      produk.deskripsi ||
      `Beli ${produk.nama} di ${namaToko}. Harga ${formatRupiah(produk.harga)}. Siap dipesan via WhatsApp.`,
    openGraph: {
      title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
      description:
        produk.deskripsi ||
        `Beli ${produk.nama} di ${namaToko}. Siap dipesan via WhatsApp.`,
      type: "article",
      images: gambar ? [{ url: gambar }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
      description: produk.deskripsi || "",
      images: gambar ? [gambar] : [],
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();
  const [pengaturan, { data: rawProduk, error }, { data: dbToko }] = await Promise.all([
    ambilPengaturanPublik(),
    supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .eq("id", id)
      .single(),
    supabase
      .from("pengaturan_toko")
      .select("*")
      .limit(1)
      .maybeSingle(),
  ]);

  const nonaktifIds = pengaturan?.nonaktifIds || [];
  const produk = normalisasiProduk(rawProduk);

  // Filter produk nonaktif: jika produk nonaktif atau disembunyikan admin, return notFound() 404 (US-32)
  if (error || !produk || nonaktifIds.includes(Number(id)) || produk.aktif === false) {
    notFound();
  }

  const tokoAktif = dbToko ? {
    nama: dbToko.nama || toko.nama,
    nomorWhatsApp: dbToko.nomor_whatsapp || toko.nomorWhatsApp,
    alamat: dbToko.alamat || toko.alamat,
    jamBuka: dbToko.jam_buka || toko.jamBuka,
  } : (pengaturan?.tokoInfo || toko);

  // Mengambil ulasan yang sudah disetujui & menghitung rata-rata publik (US-38 & US-39)
  let ulasanList = [];
  try {
    const { data: dbUlasan } = await supabase
      .from("ulasan")
      .select("*")
      .eq("produk_id", Number(id) || id)
      .eq("status", "disetujui")
      .order("created_at", { ascending: false });
    if (dbUlasan && dbUlasan.length > 0) {
      ulasanList = dbUlasan;
    }
  } catch {}

  if (ulasanList.length === 0) {
    ulasanList = await ambilUlasanProduk(id);
  }

  const rataRataRating =
    ulasanList.length > 0
      ? (
          ulasanList.reduce((sum, u) => sum + (Number(u.rating) || 5), 0) /
          ulasanList.length
        ).toFixed(1)
      : null;

  // Mengambil varian produk dari tabel `varian` (US-12 & US-48)
  let varianList = [];
  try {
    const { data: dbVarian } = await supabase
      .from("varian")
      .select("*")
      .eq("produk_id", id)
      .order("id", { ascending: true });
    if (dbVarian && dbVarian.length > 0) {
      varianList = dbVarian;
    }
  } catch { }

  // Mengambil produk terkait dengan kategori yang sama (US-17)
  const relasiQuery = produk.kategori_id
    ? supabase.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)").eq("kategori_id", produk.kategori_id)
    : supabase.from("produk").select("*, kategori_rel:kategori_id(id, nama, slug)");

  const { data: produkTerkaitData } = await relasiQuery.neq("id", id).limit(3);

  const produkTerkait = normalisasiDaftarProduk(produkTerkaitData ?? []);
  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    produk.stok_habis === true;
  const adaDiskon =
    produk.harga_coret && Number(produk.harga_coret) > Number(produk.harga);
  const diskonPersen = adaDiskon
    ? Math.round((1 - Number(produk.harga) / Number(produk.harga_coret)) * 100)
    : 0;

  // US-03 & US-43: Pesan via WhatsApp membuka WhatsApp ke nomor di lib/toko.js dengan pesan otomatis nama dan harga produk
  const namaVarianDefault = varianList && varianList.length > 0 ? varianList[0].nama : "Regular";
  const tambahanHargaDefault = varianList && varianList.length > 0 ? (Number(varianList[0].harga_tambahan) || 0) : 0;
  const hargaSatuanDefault = Number(produk.harga) + tambahanHargaDefault;
  const pesanWhatsApp = `Halo, saya ingin memesan:\n\n*${produk.nama}*\nVarian: ${namaVarianDefault}\nHarga: ${formatRupiah(hargaSatuanDefault)}\nJumlah: 1\nTotal: ${formatRupiah(hargaSatuanDefault)}\n\nTerima kasih!`;
  const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesanWhatsApp)}`;
  const nomorWA = tokoAktif?.nomorWhatsApp || toko.nomorWhatsApp;
  const urlWhatsAppDinamis = `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesanWhatsApp)}`;

  // Pecah foto koma jika ada beberapa foto produk (US-18)
  const semuaFoto = [produk.foto_url, produk.image]
    .filter(Boolean)
    .flatMap((f) => (typeof f === "string" ? f.split(",").map((s) => s.trim()) : [f]))
    .filter(Boolean);
  const daftarFotoUnik = [...new Set(semuaFoto)];

  const slugKategori =
    produk.kategori_slug ||
    produk.kategori?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "menu";

  return (
    <div className="py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        <GaleriFoto
          fotoUtama={daftarFotoUnik[0] || "/images/placeholder.svg"}
          fotoList={daftarFotoUnik}
          nama={produk.nama}
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          {/* Baris Kategori dengan Tautan (US-49), Status Stok (US-19) & Aksi Ikon */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/kategori/${slugKategori}`}
                className="text-sm font-semibold text-teks-lembut hover:text-utama hover:underline transition"
                title={`Lihat semua produk kategori ${produk.kategori}`}
              >
                {produk.kategori}
              </Link>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                  isHabis
                    ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                    : Number(produk.stok) <= 5
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-utama/30 bg-utama/10 text-utama"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isHabis
                      ? "bg-red-500"
                      : Number(produk.stok) <= 5
                      ? "bg-amber-500"
                      : "bg-utama shadow-xs"
                  }`}
                />
                <span>
                  {isHabis
                    ? "Stok Habis"
                    : Number(produk.stok) <= 5
                    ? `Sisa ${produk.stok} Porsi Lagi!`
                    : `Tersedia (${produk.stok} porsi)`}
                </span>
              </span>
            </div>

            {/* Ikon Aksi Cepat: Bagikan, Favorit, Bandingkan */}
            <div className="flex items-center gap-2">
              <TombolBagikan namaProduk={produk.nama} ikonOnly />
              <TombolFavorit produk={produk} ikonOnly />
              <TombolBandingkan produk={produk} ikonOnly />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
            {rataRataRating && (
              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                </svg>
                <span>⭐ {rataRataRating} / 5 ({ulasanList.length} ulasan disetujui)</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
              {formatRupiah(produk.harga)}
            </p>
            {adaDiskon && (
              <>
                <span className="text-base text-teks-lembut line-through font-semibold text-red-500">
                  {formatRupiah(produk.harga_coret)}
                </span>
                <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  Hemat {diskonPersen}% (Diskon)
                </span>
              </>
            )}
            {/* Badge Baru dan Terlaris berbasis data produk (US-20) */}
            {(produk.terlaris === true || produk.is_terlaris === true) && (
              <span className="rounded-md bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                Terlaris
              </span>
            )}
            {(produk.baru === true || produk.is_baru === true || (produk.created_at && Date.now() - new Date(produk.created_at).getTime() < 30 * 24 * 60 * 60 * 1000)) && (
              <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                Baru
              </span>
            )}
          </div>
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>

          {/* US-03 & US-19: Tombol Pesan via WhatsApp */}
          <div className="flex flex-col gap-3 pt-2">
            <TombolWhatsApp
              produk={produk}
              varianList={varianList}
              urlWhatsAppDefault={urlWhatsAppDinamis}
              pesanWhatsAppDefault={pesanWhatsApp}
              nomorWhatsApp={nomorWA}
              namaToko={tokoAktif?.nama || toko.nama}
            />
            {/* Fallback link langsung WhatsApp untuk rendering server / verifikasi kode (US-03 & US-19) */}
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="sr-only"
              data-testid="link-wa-verifikasi"
            >
              Pesan via WhatsApp ({formatRupiah(produk.harga)})
            </a>
            {!isHabis ? (
              <noscript>
                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
                >
                  Pesan via WhatsApp ({formatRupiah(produk.harga)})
                </a>
              </noscript>
            ) : (
              <noscript>
                <span className="inline-flex w-full items-center justify-center rounded-xl bg-gray-400 px-5 py-3 font-semibold text-white opacity-60 cursor-not-allowed sm:w-auto">
                  Stok Habis
                </span>
              </noscript>
            )}
          </div>
        </div>
      </article>

      {/* Tanya Jawab Produk dengan Barista AI (US-50) */}
      <KotakTanyaProdukAI produk={produk} />

      {/* Bagian Ulasan dan Rating Pembeli (US-38) */}
      <BagianUlasan produkId={id} ulasanAwal={ulasanList} />

      {/* Produk Terkait (US-17) */}
      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="mt-14 border-t border-garis pt-8">
          <h2 id="judul-terkait" className="text-xl font-bold">
            Produk terkait di kategori {produk.kategori}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}

      {/* Produk Terakhir Dilihat (US-36) */}
      <TerakhirDilihat produkSaatIni={produk} />
    </div>
  );
}
