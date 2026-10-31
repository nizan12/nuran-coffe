"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toko } from "@/lib/toko";

const PROMO_SLIDES = [
  {
    id: 1,
    badge: "PROMO SPESIAL",
    judul: "Diskon 20% Aneka Kopi Robusta & Arabika",
    deskripsi:
      "Biji kopi pilihan sangrai nusantara, siap dipesan langsung dan diantar segar ke tempat Anda.",
    tombolTeks: "Pesan via WhatsApp",
    link: `https://wa.me/${toko.nomorWhatsApp}?text=Halo%20${encodeURIComponent(toko.nama)}%2C%20saya%20tertarik%20dengan%20Promo%20Diskon%2020%25%20Kopi.`,
    isExternal: true,
    bgGradient: "from-emerald-950 via-utama-gelap to-utama",
    type: "coffee",
  },
  {
    id: 2,
    badge: "GRATIS ONGKIR",
    judul: "Bebas Biaya Kirim Area Batam Center",
    deskripsi:
      "Pesan menu kopi dan camilan favorit tanpa minimum order untuk area terdekat toko kami.",
    tombolTeks: "Lihat Lokasi & Jam Buka",
    link: "/tentang",
    isExternal: false,
    bgGradient: "from-amber-950 via-stone-900 to-amber-900",
    type: "delivery",
  },
  {
    id: 3,
    badge: "MENU BARU",
    judul: "Es Kopi Susu Aren Gula Melaka",
    deskripsi:
      "Perpaduan espresso mantap, susu creamy, dan manis legit gula aren murni khas nusantara.",
    tombolTeks: "Jelajahi Menu Minuman",
    link: "/?kategori=Minuman",
    isExternal: false,
    bgGradient: "from-stone-950 via-stone-900 to-emerald-950",
    type: "sparkle",
  },
];

function RenderSlideIcon({ type }) {
  if (type === "coffee") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 text-emerald-300"
      >
        <path d="M19.5 6.75h-2.128A7.502 7.502 0 0 0 4.5 12c0 3.842 2.89 7.01 6.643 7.447A8.257 8.257 0 0 0 12 19.5c.34 0 .674-.02 1.002-.061A7.498 7.498 0 0 0 19.5 12v-.75H21a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-2.25-2.25h-1.5Zm0 3.75V8.25H21a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-1.5ZM3.75 21a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" />
      </svg>
    );
  }
  if (type === "delivery") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 text-amber-300"
      >
        <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM15 9.75h3.693a2.25 2.25 0 0 1 1.95 1.125l2.25 3.75a2.25 2.25 0 0 1 .357 1.25V18a1.5 1.5 0 0 1-1.5 1.5h-1.875a3.375 3.375 0 0 1-6.75 0h-3.75a3.375 3.375 0 0 1-6.75 0H1.5A1.5 1.5 0 0 1 0 18v-3a1.5 1.5 0 0 1 1.5-1.5H15V9.75Z" />
        <path d="M4.875 19.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75ZM17.625 19.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-amber-300"
    >
      <path
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function BannerPromo({ slides }) {
  const activeSlides = (Array.isArray(slides) && slides.length > 0)
    ? slides.map((s) => ({
        id: s.id,
        badge: s.badge || "PROMO SPESIAL",
        judul: s.judul,
        deskripsi: s.deskripsi || s.subjudul || "",
        tombolTeks: s.tombol_teks || s.tombolTeks || "Pesan via WhatsApp",
        link: s.link_url || s.link || "/",
        isExternal: s.is_external ?? s.isExternal ?? false,
        bgGradient: s.bg_gradient || s.bgGradient || "from-emerald-950 via-utama-gelap to-utama",
        type: s.tipe || s.type || "coffee",
      }))
    : PROMO_SLIDES;

  const [indeks, setIndeks] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndeks((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[indeks] || activeSlides[0];

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-garis shadow-sm">
      <div
        className={`relative flex min-h-[220px] flex-col justify-between bg-gradient-to-r ${slide.bgGradient} p-6 sm:p-10 text-white transition-all duration-500`}
      >
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold tracking-wider backdrop-blur-xs">
              {slide.badge}
            </span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              <RenderSlideIcon type={slide.type} />
            </div>
          </div>

          <h3 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl text-white">
            {slide.judul}
          </h3>

          <p className="mt-2 text-sm text-white/85 sm:text-base leading-relaxed">
            {slide.deskripsi}
          </p>

          <div className="mt-5">
            {slide.isExternal ? (
              <a
                href={slide.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-utama-gelap shadow-md transition hover:bg-white/90 hover:scale-105"
              >
                <span>{slide.tombolTeks}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h4a.75.75 0 0 1 0 1.5h-4Z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M6.194 12.753a.75.75 0 0 0 1.06 1.06L16.2 4.862V8.25a.75.75 0 0 0 1.5 0V3a.75.75 0 0 0-.75-.75h-5.25a.75.75 0 0 0 0 1.5h3.388L6.194 12.753Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            ) : (
              <Link
                href={slide.link}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-utama-gelap shadow-md transition hover:bg-white/90 hover:scale-105"
              >
                <span>{slide.tombolTeks}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Indikator Slider & Navigasi */}
        <div className="relative z-10 mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {PROMO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndeks(i)}
                className={`h-2 rounded-full transition-all ${
                  i === indeks ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide promo ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() =>
                setIndeks((prev) => (prev === 0 ? PROMO_SLIDES.length - 1 : prev - 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition hover:bg-white/30"
              aria-label="Promo Sebelumnya"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIndeks((prev) => (prev + 1) % PROMO_SLIDES.length)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xs transition hover:bg-white/30"
              aria-label="Promo Selanjutnya"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
