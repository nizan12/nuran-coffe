"use client";

import { useState, useEffect } from "react";

export default function GaleriFoto({ fotoUtama, fotoList = [], nama = "Produk" }) {
  // Kumpulkan semua foto unik yang valid
  const daftarSemuaFoto = [
    fotoUtama,
    ...(Array.isArray(fotoList) ? fotoList : []),
  ].filter(Boolean);

  // Jika terdapat string pemisah koma, pecah juga
  const fotoTersedia = [
    ...new Set(
      daftarSemuaFoto.flatMap((item) =>
        typeof item === "string" && item.includes(",")
          ? item.split(",").map((s) => s.trim())
          : item
      )
    ),
  ].filter(Boolean);

  const [indeksAktif, setIndeksAktif] = useState(0);
  const [modalBuka, setModalBuka] = useState(false);

  // Kunci scroll halaman belakang saat modal zoom foto terbuka
  useEffect(() => {
    if (modalBuka) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalBuka]);

  const fotoAktif = fotoTersedia[indeksAktif] || fotoUtama || "/images/placeholder.svg";

  function geserKiri() {
    setIndeksAktif((prev) => (prev === 0 ? fotoTersedia.length - 1 : prev - 1));
  }

  function geserKanan() {
    setIndeksAktif((prev) => (prev === fotoTersedia.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Foto Utama dengan Slider & Zoom */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-garis bg-permukaan">
        <img
          src={fotoAktif}
          alt={`${nama} - Foto ${indeksAktif + 1}`}
          onClick={() => setModalBuka(true)}
          className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Tombol Navigasi Slider jika foto lebih dari 1 */}
        {fotoTersedia.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                geserKiri();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-latar/85 p-2 text-teks shadow-md backdrop-blur transition hover:bg-latar hover:scale-110"
              aria-label="Foto Sebelumnya"
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
              onClick={(e) => {
                e.stopPropagation();
                geserKanan();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-latar/85 p-2 text-teks shadow-md backdrop-blur transition hover:bg-latar hover:scale-110"
              aria-label="Foto Selanjutnya"
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
            <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {indeksAktif + 1} / {fotoTersedia.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {fotoTersedia.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {fotoTersedia.map((foto, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndeksAktif(idx)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                idx === indeksAktif
                  ? "border-utama ring-2 ring-utama/20"
                  : "border-garis opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={foto}
                alt={`${nama} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal Zoom Pratinjau Foto Penuh */}
      {modalBuka && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalBuka(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
        >
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalBuka(false)}
              className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-black"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-3.5 w-3.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Tutup</span>
            </button>
            <img
              src={fotoAktif}
              alt={nama}
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
