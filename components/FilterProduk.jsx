"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FilterProduk({ kategoriList }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kategoriAktif = searchParams.get("kategori") || "";
  const pencarianAktif = searchParams.get("cari") || "";
  const urutanAktif = searchParams.get("urutan") || "terbaru";
  const minHargaAktif = searchParams.get("minHarga") || "";
  const maxHargaAktif = searchParams.get("maxHarga") || "";

  const [cari, setCari] = useState(pencarianAktif);
  const [minHarga, setMinHarga] = useState(minHargaAktif);
  const [maxHarga, setMaxHarga] = useState(maxHargaAktif);

  function updateParams(params) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("halaman");
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
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

  function handleFilterHarga(e) {
    e.preventDefault();
    updateParams({ minHarga: minHarga.trim(), maxHarga: maxHarga.trim() });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Form Pencarian Produk (US-23) */}
        <form onSubmit={handleCari} className="flex gap-2">
          <input
            type="search"
            placeholder="Cari produk…"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-52"
          />
          <button
            type="submit"
            className="rounded-lg bg-utama px-3 py-2 text-sm font-semibold text-white hover:bg-utama-gelap cursor-pointer"
          >
            Cari
          </button>
        </form>

        {/* Filter Rentang Harga (US-24) */}
        <form onSubmit={handleFilterHarga} className="flex items-center gap-1.5 text-xs text-teks-lembut">
          <span>Harga:</span>
          <input
            type="number"
            placeholder="Min"
            value={minHarga}
            onChange={(e) => setMinHarga(e.target.value)}
            className="w-20 rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Maks"
            value={maxHarga}
            onChange={(e) => setMaxHarga(e.target.value)}
            className="w-20 rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-permukaan border border-garis px-2.5 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama cursor-pointer"
          >
            Filter
          </button>
          {(minHargaAktif || maxHargaAktif) && (
            <button
              type="button"
              onClick={() => {
                setMinHarga("");
                setMaxHarga("");
                updateParams({ minHarga: "", maxHarga: "" });
              }}
              className="text-xs text-red-500 hover:underline cursor-pointer"
              title="Reset filter harga"
            >
              Reset
            </button>
          )}
        </form>

        {/* Dropdown Urutan Produk (US-15) */}
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
            <option value="termurah">Harga: Termurah</option>
            <option value="termahal">Harga: Termahal</option>
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
