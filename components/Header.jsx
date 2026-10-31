"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toko } from "@/lib/toko";
import KeranjangDrawer from "@/components/KeranjangDrawer";
import ModalFavorit from "@/components/ModalFavorit";
import TombolTema from "@/components/TombolTema";

// US-25: Mode gelap dengan switch tema dan penyimpanan preferensi di localStorage
function TombolToggleTema() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const darkAktif = document.documentElement.classList.contains("dark");
    setIsDark(darkAktif);
  }, []);

  function handleToggleTema() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-garis bg-permukaan opacity-50" />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleTema}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-garis bg-permukaan text-teks transition-all hover:border-utama hover:text-utama hover:scale-105 cursor-pointer"
      aria-label="Tombol toggle terang/gelap"
      title="Tombol toggle terang/gelap (Mode Gelap)"
    >
      <span className="sr-only">Tombol toggle terang/gelap</span>
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-4 w-4 text-amber-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-4 w-4 text-teks-lembut"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      )}
    </button>
  );
}

export default function Header({ namaToko = null }) {
  const displayNama = namaToko || toko.nama;

  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-40 backdrop-blur-md bg-latar/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {displayNama}
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-4 text-sm font-medium">
          <Link href="/" className="text-teks hover:text-utama hidden xs:inline">
            Katalog
          </Link>
          <Link href="/favorit" className="text-teks-lembut hover:text-utama hidden sm:inline">
            Favorit
          </Link>
          <Link href="/keranjang" className="text-teks-lembut hover:text-utama hidden sm:inline">
            Keranjang
          </Link>
          <Link href="/tentang" className="text-teks-lembut hover:text-utama hidden sm:inline">
            Tentang Toko
          </Link>
          <ModalFavorit />
          <KeranjangDrawer />
          <TombolTema />
        </nav>
      </div>
    </header>
  );
}
