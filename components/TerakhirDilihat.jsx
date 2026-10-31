"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";
import { ambilTerakhirDilihat, catatProdukDilihat } from "@/lib/terakhirDilihat";

export default function TerakhirDilihat({ produkSaatIni = null }) {
  const [daftar, setDaftar] = useState([]);

  useEffect(() => {
    // Jika berada di halaman detail produk, catat produk saat ini
    if (produkSaatIni) {
      catatProdukDilihat(produkSaatIni);
    }

    setDaftar(ambilTerakhirDilihat(produkSaatIni?.id));

    function handleUpdate() {
      setDaftar(ambilTerakhirDilihat(produkSaatIni?.id));
    }

    window.addEventListener("terakhir-dilihat-updated", handleUpdate);
    return () => {
      window.removeEventListener("terakhir-dilihat-updated", handleUpdate);
    };
  }, [produkSaatIni?.id]);

  if (daftar.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir-dilihat" className="mt-12 border-t border-garis pt-8">
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
        <span className="text-xs text-teks-lembut">Riwayat tersimpan di browser</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftar.slice(0, 3).map((item) => (
          <KartuProduk key={item.id} produk={item} />
        ))}
      </div>
    </section>
  );
}
