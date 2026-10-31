"use client";

import { formatRupiah } from "@/lib/format";

/**
 * Tampilan pemilih varian/ukuran dan jumlah (US-12, US-48).
 * Hanya komponen tampilan; state dikelola oleh TombolWhatsApp.
 */
export default function PilihVarianJumlah({
  varianTersedia,
  varianAktif,
  onPilihVarian,
  jumlah,
  onUbahJumlah,
  stokMaksimal,
  total,
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-teks">Pilihan Varian / Ukuran:</span>
        <div className={`grid gap-2 ${varianTersedia.length > 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
          {varianTersedia.map((v) => {
            const isSelected = varianAktif?.nama === v.nama;
            const extra = Number(v.harga_tambahan) || 0;
            const isVarianHabis = v.stok !== null && v.stok !== undefined && Number(v.stok) <= 0;
            return (
              <button
                key={v.id || v.nama}
                type="button"
                disabled={isVarianHabis}
                onClick={() => onPilihVarian(v)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  isVarianHabis
                    ? "opacity-50 cursor-not-allowed bg-latar border-dashed border-garis"
                    : isSelected
                    ? "border-utama bg-utama/10 text-utama font-bold"
                    : "border-garis bg-permukaan text-teks-lembut hover:border-utama"
                }`}
              >
                <span>
                  {v.nama} {isVarianHabis && <span className="text-[10px] text-red-500 font-bold">(Habis)</span>}
                </span>
                <span className={extra > 0 ? "font-bold text-utama" : "text-teks-lembut"}>
                  {extra > 0 ? `+${formatRupiah(extra)}` : "Standar"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Jumlah:</span>
        <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
          <button
            type="button"
            onClick={() => onUbahJumlah(Math.max(1, jumlah - 1))}
            className="px-3 py-1.5 text-lg font-semibold text-teks-lembut hover:text-utama disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={jumlah <= 1}
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-bold">{jumlah}</span>
          <button
            type="button"
            onClick={() => onUbahJumlah(Math.min(stokMaksimal, jumlah + 1))}
            className="px-3 py-1.5 text-lg font-semibold text-teks-lembut hover:text-utama disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={stokMaksimal > 0 && jumlah >= stokMaksimal}
            title={stokMaksimal > 0 && jumlah >= stokMaksimal ? `Maksimal stok tercapai (${stokMaksimal})` : "Tambah jumlah"}
          >
            +
          </button>
        </div>
        <span className="text-xs text-teks-lembut">
          (Maks: <strong className="text-teks">{stokMaksimal}</strong>)
        </span>
        <span className="text-sm text-teks-lembut ml-auto sm:ml-0">
          Total: <span className="font-bold text-harga">{formatRupiah(total)}</span>
        </span>
      </div>
    </>
  );
}
