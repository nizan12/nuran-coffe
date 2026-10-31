import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";

export default function KartuProduk({ produk }) {
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
    <Link
      href={`/produk/${produk.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar transition hover:border-utama/50 hover:shadow-xs"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-permukaan">
        <img
          src={ambilFotoUtama(produk)}
          alt={produk.nama}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
            isHabis ? "opacity-60 grayscale" : ""
          }`}
        />

        {/* Badge Diskon / Promo (US-20) */}
        {adaDiskon && (
          <span className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-white shadow-xs">
            Hemat {diskonPersen}%
          </span>
        )}

        {/* Badge Status Stok (US-19) */}
        <span
          className={`absolute right-2 top-2 sm:right-2.5 sm:top-2.5 rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold backdrop-blur-sm ${
            isHabis
              ? "bg-red-600/90 text-white"
              : "bg-emerald-600/85 text-white"
          }`}
        >
          {isHabis ? "Stok Habis" : "Tersedia"}
        </span>

        {/* Tombol Bandingkan (US-37) & Tombol Favorit (US-24) */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 sm:bottom-2.5 sm:right-2.5 sm:gap-1.5">
          <TombolBandingkan produk={produk} ikonOnly className="!h-7.5 !w-7.5 sm:!h-8.5 sm:!w-8.5 !shadow-xs" />
          <TombolFavorit produk={produk} className="!h-7.5 !w-7.5 sm:!h-8.5 sm:!w-8.5 !shadow-xs" />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 gap-2">
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-teks-lembut truncate">{produk.kategori}</p>
          <h3 className="font-bold text-xs sm:text-sm leading-snug group-hover:text-utama line-clamp-2 mt-0.5">
            {produk.nama}
          </h3>
        </div>

        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1">
          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs sm:text-sm font-extrabold text-harga">
              {formatRupiah(produk.harga)}
            </span>
            {adaDiskon && (
              <span className="block truncate text-[10px] text-teks-lembut line-through">
                {formatRupiah(produk.harga_coret)}
              </span>
            )}
          </div>
          <TombolKeranjang produk={produk} className="h-8 px-2 sm:px-3 text-xs" />
        </div>
      </div>
    </Link>
  );
}
