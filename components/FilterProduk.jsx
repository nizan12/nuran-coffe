"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FilterProduk({ kategoriList }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kategoriAktif = searchParams.get("kategori") || "";
  const pencarianAktif = searchParams.get("cari") || "";
  const urutanAktif = searchParams.get("urutan") || "terbaru";
  const [cari, setCari] = useState(pencarianAktif);

  function updateParams(params) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("halaman");
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
    });
    router.push(`/?${sp.toString()}`);
  }

  function handleCari(e) {
    e.preventDefault();
    updateParams({ cari: cari.trim() });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleCari} className="flex gap-2">
          <input
            type="search"
            placeholder="Cari produk…"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-56"
          />
          <button
            type="submit"
            className="rounded-lg bg-utama px-3 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-2">
          <label htmlFor="pilih-urutan" className="text-xs font-medium text-teks-lembut whitespace-nowrap">
            Urutkan:
          </label>
          <select
            id="pilih-urutan"
            value={urutanAktif}
            onChange={(e) => updateParams({ urutan: e.target.value })}
            className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks focus:border-utama focus:outline-none"
          >
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Harga: Terendah</option>
            <option value="termahal">Harga: Tertinggi</option>
            <option value="nama-asc">Nama: A — Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ kategori: "", cari: "" })}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            !kategoriAktif && !pencarianAktif
              ? "bg-utama text-white"
              : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
          }`}
        >
          Semua
        </button>
        {kategoriList.map((kat) => (
          <button
            key={kat}
            onClick={() => updateParams({ kategori: kat })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              kategoriAktif === kat
                ? "bg-utama text-white"
                : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
            }`}
          >
            {kat}
          </button>
        ))}
      </div>
    </div>
  );
}
