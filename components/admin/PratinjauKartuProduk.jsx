"use client";

/**
 * Sub-komponen FormProduk: Live Preview kartu produk di katalog
 * Menampilkan pratinjau real-time kartu produk seperti tampil di halaman pembeli
 */
import { formatRupiah } from "@/lib/format";

export default function PratinjauKartuProduk({
  nama,
  harga,
  hargaCoret,
  diskonPersen,
  stok,
  kategori,
  deskripsi,
  daftarFoto,
}) {
  return (
    <div className="rounded-3xl border border-garis bg-permukaan/40 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-garis pb-2">
        <span className="text-xs font-bold text-teks flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-utama">
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
          </svg>
          <span>Pratinjau di Katalog Pembeli</span>
        </span>
        <span className="text-[10px] text-teks-lembut bg-latar border border-garis rounded-md px-1.5 py-0.5 font-medium">
          Live Preview
        </span>
      </div>

      <div className="mx-auto max-w-[260px] overflow-hidden rounded-2xl border border-garis bg-latar shadow-sm">
        <div className="relative aspect-square w-full overflow-hidden bg-permukaan">
          <img
            src={daftarFoto[0] || "/images/placeholder.svg"}
            alt={nama || "Pratinjau"}
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.svg";
            }}
            className="h-full w-full object-cover"
          />
          {diskonPersen && Number(diskonPersen) > 0 ? (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Hemat {diskonPersen}%
            </span>
          ) : null}
          <span
            className={`absolute right-2.5 top-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-xs ${
              Number(stok) <= 0 ? "bg-red-600/90" : "bg-emerald-600/85"
            }`}
          >
            {Number(stok) <= 0 ? "Stok Habis" : "Tersedia"}
          </span>
        </div>

        <div className="p-3">
          <p className="text-[11px] font-medium text-teks-lembut truncate">{kategori || "Kategori Menu"}</p>
          <h4 className="font-bold text-sm text-teks truncate mt-0.5">
            {nama || "Nama Menu Kopi"}
          </h4>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-harga">
              {harga ? formatRupiah(Number(harga)) : "Rp 0"}
            </span>
            {hargaCoret && Number(hargaCoret) > Number(harga) && (
              <span className="text-xs text-teks-lembut line-through">
                {formatRupiah(Number(hargaCoret))}
              </span>
            )}
          </div>
          <p className="text-[11px] text-teks-lembut line-clamp-2 mt-1.5">
            {deskripsi || "Deskripsi aroma & rasa kopi Anda akan tampil di sini..."}
          </p>
        </div>
      </div>
    </div>
  );
}
