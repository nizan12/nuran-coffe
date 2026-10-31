"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { tambahProduk, buatDeskripsiAI } from "@/app/admin/actions";

export default function HalamanTambahProduk() {
  const [state, formAction, pending] = useActionState(tambahProduk, null);

  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [kategori, setKategori] = useState("");
  const [stok, setStok] = useState("10");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  // US-14: Integrasi generator deskripsi produk dengan AI Gemini di FormProduk
  async function handleBuatDeskripsiAI() {
    if (!nama.trim()) {
      setPesanAI({ error: "Isi nama produk terlebih dahulu sebelum membuat deskripsi AI." });
      return;
    }
    setLoadingAI(true);
    setPesanAI(null);
    try {
      const hasil = await buatDeskripsiAI({ nama, kategori });
      if (hasil?.error) {
        setPesanAI({ error: hasil.error });
      } else if (hasil?.deskripsi) {
        setDeskripsi(hasil.deskripsi);
        setPesanAI({ sukses: "Deskripsi berhasil dibuat otomatis oleh AI Gemini!" });
      }
    } catch (err) {
      setPesanAI({ error: "Gagal membuat deskripsi: " + err.message });
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 py-6 sm:py-8 max-w-4xl mx-auto">
      <NavAdmin />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-garis pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teks-lembut mb-1">
            <Link href="/admin" className="hover:text-utama transition">
              Admin
            </Link>
            <span>/</span>
            <span>Tambah Produk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teks">
            Tambah Menu / Produk Baru
          </h1>
          <p className="text-xs sm:text-sm text-teks-lembut mt-1">
            Lengkapi nama menu, harga, foto produk, dan buat deskripsi otomatis dengan AI.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition"
        >
          ← Kembali ke Daftar
        </Link>
      </div>

      {/* Form Tambah Produk (US-08, US-14, US-29, US-34) */}
      <form
        action={formAction}
        className="flex flex-col gap-5 rounded-3xl border border-garis bg-latar p-6 sm:p-8 shadow-xs"
      >
        {state?.error && !state?.errors && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-bold text-red-700">
            {state.error}
          </div>
        )}

        {/* 1. Nama Produk */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nama" className="text-sm font-semibold text-teks">
            Nama Produk *
          </label>
          <input
            id="nama"
            type="text"
            name="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Es Kopi Susu Gula Aren"
            required
            className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {state?.errors?.nama && (
            <p className="text-xs text-red-600 font-semibold">{state.errors.nama}</p>
          )}
        </div>

        {/* 2. Kategori Menu */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="kategori" className="text-sm font-semibold text-teks">
            Kategori Menu *
          </label>
          <input
            id="kategori"
            type="text"
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="Contoh: Kopi Dingin, Pastry, Non-Kopi"
            required
            className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>

        {/* 3. Harga Jual dan Jumlah Stok */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="harga" className="text-sm font-semibold text-teks">
              Harga Jual (Rp) *
            </label>
            <input
              id="harga"
              type="number"
              name="harga"
              min="100"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="Contoh: 20000"
              required
              className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            {state?.errors?.harga && (
              <p className="text-xs text-red-600 font-semibold">{state.errors.harga}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="stok" className="text-sm font-semibold text-teks">
              Jumlah Stok Tersedia *
            </label>
            <input
              id="stok"
              type="number"
              name="stok"
              min="0"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              placeholder="10"
              required
              className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Upload Foto Produk ke Supabase Storage (US-29) */}
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-garis p-4 bg-permukaan/30">
          <label htmlFor="file_gambar" className="text-sm font-semibold text-teks">
            Unggah Foto Produk (Maks. 5MB) — Supabase Storage (US-29)
          </label>
          <input
            id="file_gambar"
            type="file"
            name="file_gambar"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-xs text-teks file:mr-3 file:rounded-xl file:border-0 file:bg-utama file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-utama-gelap cursor-pointer"
          />
          <div className="flex flex-col gap-1 pt-1">
            <label htmlFor="foto_url" className="text-xs text-teks-lembut">
              Atau cantumkan URL foto langsung (pisahkan dengan koma jika lebih dari satu):
            </label>
            <input
              id="foto_url"
              type="text"
              name="foto_url"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="https://... atau /images/kopi.jpg"
              className="w-full rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>
        </div>

        {/* 5. Deskripsi Produk dengan Asisten AI Gemini (US-14) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="deskripsi" className="text-sm font-semibold text-teks">
              Deskripsi Produk *
            </label>
            <button
              type="button"
              onClick={handleBuatDeskripsiAI}
              disabled={loadingAI}
              className="inline-flex items-center gap-1.5 rounded-xl border border-garis bg-permukaan px-3 py-1.5 text-xs font-semibold text-utama hover:border-utama hover:bg-utama hover:text-white transition disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {loadingAI ? "✨ Sedang merangkai kata…" : "✨ Buat Deskripsi dengan AI"}
            </button>
          </div>

          <textarea
            id="deskripsi"
            name="deskripsi"
            rows={4}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tuliskan cerita rasa, aroma, atau klik 'Buat Deskripsi dengan AI' di atas…"
            required
            className="w-full rounded-2xl border border-garis bg-latar p-3.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none leading-relaxed"
          />

          {pesanAI?.error && (
            <p className="text-xs text-red-600 font-semibold">{pesanAI.error}</p>
          )}
          {pesanAI?.sukses && (
            <p className="text-xs text-emerald-600 font-semibold">{pesanAI.sukses}</p>
          )}
          {state?.errors?.deskripsi && (
            <p className="text-xs text-red-600 font-semibold">{state.errors.deskripsi}</p>
          )}
        </div>

        {/* 6. Tombol Submit Simpan Produk Baru */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-garis">
          <Link
            href="/admin"
            className="rounded-xl border border-garis bg-permukaan px-4 py-2.5 text-xs font-bold text-teks hover:border-teks transition"
          >
            Batal
          </Link>
          <Tombol type="submit" disabled={pending} className="px-5 py-2.5 text-xs font-bold">
            {pending ? "Menyimpan Produk…" : "Simpan Produk Baru"}
          </Tombol>
        </div>
      </form>
    </div>
  );
}
