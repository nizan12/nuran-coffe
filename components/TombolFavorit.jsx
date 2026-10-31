"use client";

import { useEffect, useState } from "react";
import { isFavorit, toggleFavorit } from "@/lib/favorit";

export default function TombolFavorit({ produk, className = "", ikonOnly = true }) {
  const [favorit, setFavorit] = useState(false);

  useEffect(() => {
    setFavorit(isFavorit(produk.id));

    function handleUpdate() {
      setFavorit(isFavorit(produk.id));
    }

    window.addEventListener("favorit-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("favorit-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [produk.id]);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const status = toggleFavorit(produk);
    setFavorit(status);
  }

  if (ikonOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-garis bg-permukaan shadow-xs transition hover:scale-110 hover:border-utama ${className}`}
        aria-label={favorit ? "Hapus dari favorit" : "Tambah ke favorit"}
        title={favorit ? "Tersimpan di Favorit" : "Simpan ke Favorit"}
      >
        {favorit ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-red-500 transition-transform"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.7"
            stroke="currentColor"
            className="h-4 w-4 text-teks-lembut hover:text-red-500 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-garis bg-permukaan px-4 py-2.5 text-sm font-semibold transition hover:border-utama ${className}`}
    >
      {favorit ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-red-500"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.7"
          stroke="currentColor"
          className="h-4 w-4 text-teks-lembut"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      )}
      <span>{favorit ? "Tersimpan di Favorit" : "Simpan ke Favorit"}</span>
    </button>
  );
}
