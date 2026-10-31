"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

const STORAGE_KEY = "nuran_terakhir_dilihat_v1";
const BATAS_JUMLAH = 6; // Batas jumlah produk terakhir dilihat (US-36)

export default function TerakhirDilihat({ produkSaatIni = null }) {
  const [daftar, setDaftar] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Simpan produk saat ini ke localStorage (US-36)
    if (produkSaatIni && produkSaatIni.id) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const filtered = list.filter((item) => String(item.id) !== String(produkSaatIni.id));
        const updated = [
          {
            id: produkSaatIni.id,
            nama: produkSaatIni.nama,
            harga: Number(produkSaatIni.harga) || 0,
            image: produkSaatIni.image || produkSaatIni.foto_url || "/produk/kopi.svg",
            kategori: produkSaatIni.kategori || "",
            harga_coret: produkSaatIni.harga_coret || null,
            stok: produkSaatIni.stok,
          },
          ...filtered,
        ].slice(0, BATAS_JUMLAH);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Gagal simpan ke localStorage:", err);
      }
    }

    // 2. Ambil dari localStorage tanpa produk saat ini
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const hasil = produkSaatIni?.id
        ? list.filter((item) => String(item.id) !== String(produkSaatIni.id))
        : list;
      setDaftar(hasil.slice(0, BATAS_JUMLAH));
    } catch {
      setDaftar([]);
    }
  }, [produkSaatIni?.id]);

  // 3. Sembunyikan bagian ini jika riwayat kosong (US-36)
  if (daftar.length === 0) {
    return null;
  }

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
        <span className="text-xs text-teks-lembut">Riwayat tersimpan di browser (Maks. {BATAS_JUMLAH})</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftar.slice(0, BATAS_JUMLAH).map((item) => (
          <KartuProduk key={item.id} produk={item} />
        ))}
      </div>
    </section>
  );
}
