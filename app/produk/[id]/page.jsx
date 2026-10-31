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
import { buatClientServer, normalisasiProduk, normalisasiDaftarProduk } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { ambilUlasanProduk } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = buatClientServer();
  const { data: rawProduk } = await supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .eq("id", id)
    .single();

  const produk = normalisasiProduk(rawProduk);

  if (!produk) {
    return {
      title: "Produk Tidak Ditemukan",
    };
  }

  const gambar = produk.image || produk.foto_url;

  return {
    title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
    description:
      produk.deskripsi ||
      `Beli ${produk.nama} di ${toko.nama}. Harga ${formatRupiah(produk.harga)}. Siap dipesan via WhatsApp.`,
    openGraph: {
      title: `${produk.nama} - ${formatRupiah(produk.harga)}`,
      description:
        produk.deskripsi ||
        `Beli ${produk.nama} di ${toko.nama}. Siap dipesan via WhatsApp.`,
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

  const { data: rawProduk, error } = await supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .eq("id", id)
    .single();

  const produk = normalisasiProduk(rawProduk);

  if (error || !produk) {
    notFound();
  }

  // Mengambil ulasan yang sudah disetujui (US-38)
  const ulasanList = await ambilUlasanProduk(id);

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

  return (
    <div className="py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        <GaleriFoto
          fotoUtama={produk.image || produk.foto_url}
          fotoList={[produk.foto_url, produk.image].filter(Boolean)}
          nama={produk.nama}
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          {/* Baris Kategori, Status Stok & Aksi Ikon (Bagikan, Favorit, Bandingkan) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <p className="text-sm font-semibold text-teks-lembut">{produk.kategori}</p>
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

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
              {formatRupiah(produk.harga)}
            </p>
            {adaDiskon && (
              <>
                <span className="text-base text-teks-lembut line-through">
                  {formatRupiah(produk.harga_coret)}
                </span>
                <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  Hemat {diskonPersen}%
                </span>
              </>
            )}
          </div>
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <div className="flex flex-col gap-3 pt-2">
            <TombolWhatsApp produk={produk} varianList={varianList} />
          </div>
        </div>
      </article>

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
