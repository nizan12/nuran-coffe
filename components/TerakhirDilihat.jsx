"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";
import {
  ambilProdukTerakhirDilihat,
  simpanProdukTerakhirDilihat,
  BATAS_JUMLAH,
} from "@/lib/terakhirDilihat";

/**
 * US-36: Terakhir dilihat
 * Menampilkan section 'Terakhir Dilihat' di beranda dan halaman detail produk.
 */
export default function TerakhirDilihat({ produkSaatIni = null }) {
  const [daftar, setDaftar] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Catat produk saat ini jika sedang di halaman detail
    if (produkSaatIni && produkSaatIni.id) {
      simpanProdukTerakhirDilihat(produkSaatIni, BATAS_JUMLAH);
    }

    // 2. Ambil daftar riwayat (kecualikan produk saat ini jika ada)
    const riwayat = ambilProdukTerakhirDilihat(produkSaatIni?.id, BATAS_JUMLAH);
    setDaftar(riwayat);

    // 3. Dengarkan event jika ada penambahan produk baru
    function handleUpdate() {
      const updated = ambilProdukTerakhirDilihat(produkSaatIni?.id, BATAS_JUMLAH);
      setDaftar(updated);
    }

    window.addEventListener("terakhir-dilihat-updated", handleUpdate);
    return () => window.removeEventListener("terakhir-dilihat-updated", handleUpdate);
  }, [produkSaatIni?.id]);

  return (
    <section
      id="terakhir-dilihat"
      aria-labelledby="judul-terakhir-dilihat"
      className="mt-12 border-t border-garis pt-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-utama/10 text-utama">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h2 id="judul-terakhir-dilihat" className="text-xl font-bold text-teks">
            Terakhir Dilihat
          </h2>
        </div>
        <span className="text-xs text-teks-lembut">
          Riwayat tersimpan di browser (Maks. {BATAS_JUMLAH})
        </span>
      </div>

      {mounted && daftar.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {daftar.slice(0, BATAS_JUMLAH).map((item) => (
            <KartuProduk key={item.id} produk={item} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-garis bg-permukaan/30 py-6 px-4 text-center">
          <p className="text-xs text-teks-lembut">
            Belum ada produk yang baru kamu lihat. Klik salah satu menu di atas untuk melihat detail seduhan!
          </p>
        </div>
      )}
    </section>
  );
}
