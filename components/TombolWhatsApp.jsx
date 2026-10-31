"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import TombolKeranjang from "@/components/TombolKeranjang";
import PilihVarianJumlah from "@/components/PilihVarianJumlah";

/**
 * US-03: Pesan via WhatsApp
 * - Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor di lib/toko.js
 *   (atau nomor dari pengaturan toko di database, US-43).
 * - Pesan sudah terisi otomatis dengan nama dan harga produk.
 * - Memakai link https://wa.me/ sehingga berfungsi di HP (aplikasi WhatsApp)
 *   dan di laptop (WhatsApp Web).
 */
export function buatLinkWhatsApp({ nomor, namaToko, namaProduk, harga, jumlah = 1, varian = "Regular" }) {
  const pesan =
    `Halo ${namaToko}, saya ingin memesan:\n\n` +
    `*${namaProduk}*\n` +
    `Varian: ${varian}\n` +
    `Harga: ${formatRupiah(harga)}\n` +
    `Jumlah: ${jumlah}\n` +
    `Total: ${formatRupiah(harga * jumlah)}\n\n` +
    `Terima kasih!`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default function TombolWhatsApp({ produk, varianList = [], nomorWhatsApp = null, namaToko = null }) {
  const nomor = nomorWhatsApp || toko.nomorWhatsApp;
  const nama = namaToko || toko.nama;

  const varianTersedia =
    Array.isArray(varianList) && varianList.length > 0
      ? varianList
      : [
          { id: "reg", nama: "Regular", harga_tambahan: 0 },
          { id: "lrg", nama: "Large", harga_tambahan: 4000 },
        ];

  const [jumlah, setJumlah] = useState(1);
  const [varianAktif, setVarianAktif] = useState(varianTersedia[0]);

  const hargaSatuan = (Number(produk.harga) || 0) + (Number(varianAktif?.harga_tambahan) || 0);
  const stokMaksimal =
    varianAktif?.stok !== null && varianAktif?.stok !== undefined
      ? Number(varianAktif.stok)
      : Number(produk.stok) || 10;
  const namaProduk =
    varianAktif?.nama && varianAktif.nama !== "Regular" ? `${produk.nama} (${varianAktif.nama})` : produk.nama;

  const isHabis =
    produk.stok === 0 || produk.status_stok === "habis" || produk.stok_habis === true || stokMaksimal <= 0;

  // Link WhatsApp berisi nama dan harga produk (US-03)
  const urlWhatsApp = buatLinkWhatsApp({
    nomor,
    namaToko: nama,
    namaProduk,
    harga: hargaSatuan,
    jumlah,
    varian: varianAktif?.nama || "Regular",
  });

  function catatKlik() {
    // US-40: pencatatan analitik tanpa menghalangi pembukaan WhatsApp
    try {
      const data = JSON.stringify({ produkId: produk.id, nama: namaProduk, harga: hargaSatuan, jumlah });
      navigator.sendBeacon?.("/api/analitik/klik", new Blob([data], { type: "application/json" }));
    } catch {}
  }

  if (isHabis) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Maaf, saat ini stok produk ini sedang habis.
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
      <PilihVarianJumlah
        varianTersedia={varianTersedia}
        varianAktif={varianAktif}
        onPilihVarian={(v) => {
          setVarianAktif(v);
          const batas = v.stok !== null && v.stok !== undefined ? Number(v.stok) : Number(produk.stok) || 10;
          if (batas > 0 && jumlah > batas) setJumlah(batas);
        }}
        jumlah={jumlah}
        onUbahJumlah={setJumlah}
        stokMaksimal={stokMaksimal}
        total={hargaSatuan * jumlah}
      />

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={catatKlik}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-utama px-5 py-3 font-semibold text-white shadow-xs transition hover:bg-utama-gelap"
        >
          Pesan via WhatsApp
        </a>
        <TombolKeranjang
          produk={{ ...produk, nama: namaProduk, harga: hargaSatuan, stok: stokMaksimal }}
          jumlah={jumlah}
          className="rounded-xl px-5 py-3 text-sm font-semibold"
          teks="+ Masukkan Keranjang"
        />
      </div>
    </div>
  );
}
