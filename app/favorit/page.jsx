"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ambilFavorit, simpanFavorit } from "@/lib/favorit";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";

export default function HalamanFavorit() {
  const [daftarFavorit, setDaftarFavorit] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDaftarFavorit(ambilFavorit());

    function handleUpdate() {
      setDaftarFavorit(ambilFavorit());
    }

    window.addEventListener("favorit-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("favorit-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  function handleHapus(id, e) {
    e.preventDefault();
    e.stopPropagation();
    const updated = daftarFavorit.filter((p) => p.id !== id);
    setDaftarFavorit(updated);
    simpanFavorit(updated);
  }

  if (!mounted) {
    return (
      <div className="py-12 text-center text-sm text-teks-lembut">
        Memuat produk favorit…
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-teks-lembut mb-4">
        <Link href="/" className="hover:text-utama transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-teks">Menu Favorit</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teks">
            Menu Kopi & Camilan Favorit
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-teks-lembut">
            Daftar menu yang telah kamu tandai dan tersimpan di browser ini ({daftarFavorit.length} menu).
          </p>
        </div>
        {daftarFavorit.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setDaftarFavorit([]);
              simpanFavorit([]);
            }}
            className="text-xs text-red-600 hover:underline cursor-pointer"
          >
            Kosongkan Semua Favorit
          </button>
        )}
      </div>

      {daftarFavorit.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-dashed border-garis bg-permukaan/40 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500 dark:bg-red-950/40 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-teks">Belum Ada Menu Favorit</h2>
          <p className="mt-1 max-w-sm text-xs text-teks-lembut">
            Tandai menu kopi atau camilan yang kamu sukai dengan menekan ikon hati pada kartu katalog untuk menyimpannya di sini.
          </p>
          <div className="mt-5">
            <Tombol href="/" varian="utama">
              Jelajahi Menu Kopi
            </Tombol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {daftarFavorit.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar transition hover:border-utama/50 hover:shadow-xs"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-permukaan">
                <img
                  src={item.image || "/images/placeholder.svg"}
                  alt={item.nama}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => handleHapus(item.id, e)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-xs hover:scale-110 transition cursor-pointer"
                  title="Hapus dari favorit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-between p-3.5 gap-2">
                <div>
                  <span className="text-[11px] font-medium text-teks-lembut truncate block">
                    {item.kategori || "Menu"}
                  </span>
                  <Link
                    href={`/produk/${item.id}`}
                    className="mt-0.5 line-clamp-1 text-xs font-bold text-teks hover:text-utama transition"
                  >
                    {item.nama}
                  </Link>
                  <p className="mt-1 text-sm font-extrabold text-harga">
                    {formatRupiah(item.harga)}
                  </p>
                </div>

                <Link
                  href={`/produk/${item.id}`}
                  className="rounded-xl border border-garis bg-permukaan py-1.5 text-center text-xs font-bold text-teks hover:border-utama hover:text-utama transition"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
