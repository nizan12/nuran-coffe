"use client";

import { useState } from "react";

export default function TombolBagikan({ namaProduk, className = "", ikonOnly = false }) {
  const [tersalin, setTersalin] = useState(false);

  async function handleBagikan() {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: namaProduk,
          text: `Cek ${namaProduk} di katalog toko kami:`,
          url: url,
        });
        return;
      } catch (err) {
        // Jika dibatalkan user atau tidak didukung, fallback ke clipboard
        if (err.name === "AbortError") return;
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setTersalin(true);
        setTimeout(() => setTersalin(false), 2500);
      }
    } catch (err) {
      console.error("Gagal menyalin ke clipboard:", err);
    }
  }

  if (ikonOnly) {
    return (
      <button
        type="button"
        onClick={handleBagikan}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-garis bg-permukaan transition hover:scale-110 hover:border-utama ${
          tersalin
            ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950/40"
            : "text-teks-lembut hover:text-utama"
        } ${className}`}
        aria-label={tersalin ? "Tautan berhasil disalin" : "Bagikan produk ini"}
        title={tersalin ? "Tautan Berhasil Disalin!" : "Bagikan / Salin Tautan"}
      >
        {tersalin ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-green-600"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBagikan}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
        tersalin
          ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-600 shadow-sm"
          : "border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
      }`}
      title="Salin tautan atau bagikan produk"
    >
      {tersalin ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-green-600"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.8"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
          />
        </svg>
      )}
      <span>{tersalin ? "Tautan Berhasil Disalin!" : "Bagikan / Salin Link"}</span>
    </button>
  );
}
