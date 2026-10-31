"use client";

import { useState } from "react";
import { tambahKeKeranjang } from "@/lib/keranjang";

export default function TombolKeranjang({
  produk,
  jumlah = 1,
  className = "",
  teks = "+ Keranjang",
  responsif = true,
}) {
  const [ditambahkan, setDitambahkan] = useState(false);

  const isHabis =
    produk.stok === 0 ||
    produk.status_stok === "habis" ||
    produk.stok_habis === true;

  if (isHabis) return null;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    tambahKeKeranjang(produk, jumlah);
    setDitambahkan(true);
    setTimeout(() => setDitambahkan(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border transition shadow-2xs font-bold text-xs whitespace-nowrap ${
        ditambahkan
          ? "!border-emerald-600 !bg-emerald-600 !text-white shadow-xs"
          : "border-utama bg-utama text-white hover:bg-utama-gelap"
      } ${className}`}
      title="Tambahkan ke Keranjang Belanja"
      aria-label="Tambahkan ke Keranjang Belanja"
    >
      {ditambahkan ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {responsif ? (
              <>
                <span className="hidden sm:inline">Ditambahkan</span>
                <span className="sm:hidden text-xs">Masuk</span>
              </>
            ) : (
              "Ditambahkan"
            )}
          </span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.358 4H18.25a.75.75 0 0 1 .737.896l-1.5 7.5A.75.75 0 0 1 16.75 13H6.467l-.28 1.401A1.75 1.75 0 0 1 4.47 16H3.25a.75.75 0 0 1 0-1.5h1.22a.25.25 0 0 0 .248-.2l1.62-8.1A.75.75 0 0 1 7.076 5.5H16.14l-1.2 6H6.67l-.89-4.453A.75.75 0 0 1 5.358 6.5l-.24-1.2L4.872 4H1.75A.75.75 0 0 1 1 1.75Z" />
            <path d="M6 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          </svg>
          {responsif ? (
            <>
              <span className="hidden sm:inline">{teks}</span>
              <span className="sm:hidden font-extrabold text-xs leading-none">+</span>
            </>
          ) : (
            <span>{teks}</span>
          )}
        </>
      )}
    </button>
  );
}
