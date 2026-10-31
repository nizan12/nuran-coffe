"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";

export default function TombolWhatsApp({ produk, varianList = [] }) {
  const [jumlah, setJumlah] = useState(1);

  const varianTersedia = Array.isArray(varianList) && varianList.length > 0
    ? varianList
    : [
        { id: "reg", nama: "Regular", harga_tambahan: 0 },
        { id: "lrg", nama: "Large", harga_tambahan: 4000 },
      ];

  const [varianAktif, setVarianAktif] = useState(varianTersedia[0]);

  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    produk.stok_habis === true;

  const tambahanHarga = Number(varianAktif?.harga_tambahan) || 0;
  const hargaSatuan = (Number(produk.harga) || 0) + tambahanHarga;
  const total = hargaSatuan * jumlah;

  const namaVarian =
    varianAktif?.nama && varianAktif.nama !== "Regular"
      ? `${produk.nama} (${varianAktif.nama})`
      : produk.nama;

  const pesan = `Halo, saya ingin memesan:\n\n*${namaVarian}*\nVarian: ${varianAktif?.nama || "Regular"}\nHarga: ${formatRupiah(hargaSatuan)}\nJumlah: ${jumlah}\nTotal: ${formatRupiah(total)}\n\nTerima kasih!`;
  const url = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  const produkUntukKeranjang = {
    ...produk,
    nama: namaVarian,
    harga: hargaSatuan,
  };

  if (isHabis) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 p-3 text-center text-sm font-semibold text-red-700 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-600">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>Maaf, saat ini stok produk ini sedang habis.</span>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-400 sm:w-auto"
        >
          Stok Habis
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Pemilih Varian Produk (US-12 & US-48) */}
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
                onClick={() => setVarianAktif(v)}
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

      {/* Pemilih Jumlah */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Jumlah:</span>
        <div className="inline-flex items-center rounded-lg border border-garis bg-latar">
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.max(1, j - 1))}
            className="px-3 py-1.5 text-lg font-semibold text-teks-lembut hover:text-utama disabled:opacity-40"
            disabled={jumlah <= 1}
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-bold">{jumlah}</span>
          <button
            type="button"
            onClick={() => setJumlah((j) => j + 1)}
            className="px-3 py-1.5 text-lg font-semibold text-teks-lembut hover:text-utama"
          >
            +
          </button>
        </div>
        <span className="text-sm text-teks-lembut">
          Total: <span className="font-bold text-harga">{formatRupiah(total)}</span>
        </span>
      </div>

      {/* Tombol Pesan WhatsApp & Masukkan Keranjang */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            try {
              fetch("/api/analitik/klik", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  produkId: produk.id,
                  nama: namaVarian,
                  harga: hargaSatuan,
                  jumlah,
                }),
              });
            } catch {}
          }}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap shadow-xs transition"
        >
          Pesan via WhatsApp
        </a>
        <TombolKeranjang
          produk={produkUntukKeranjang}
          jumlah={jumlah}
          className="py-3 px-5 text-sm rounded-xl font-semibold"
          teks="+ Masukkan Keranjang"
        />
      </div>
    </div>
  );
}
