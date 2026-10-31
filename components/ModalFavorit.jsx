"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ambilFavorit, toggleFavorit, bersihkanFavorit } from "@/lib/favorit";
import { tambahKeKeranjang } from "@/lib/keranjang";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";

export default function ModalFavorit() {
  const [buka, setBuka] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState([]);
  const [notifDitambahkan, setNotifDitambahkan] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(ambilFavorit());

    function handleUpdate(e) {
      setItems(e.detail || ambilFavorit());
    }

    window.addEventListener("favorit-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("favorit-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (buka) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [buka]);

  function handlePindahkanSemua() {
    if (items.length === 0) return;
    items.forEach((item) => {
      tambahKeKeranjang(item, 1);
    });
    setNotifDitambahkan(true);
    setTimeout(() => setNotifDitambahkan(false), 2500);
  }

  function handleKosongkan() {
    if (confirm("Hapus semua item dari daftar favorit kamu?")) {
      bersihkanFavorit();
      setItems([]);
    }
  }

  return (
    <>
      {/* Tombol Trigger Header */}
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="relative inline-flex items-center gap-2 rounded-xl border border-garis bg-permukaan px-3 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
        aria-label="Lihat Produk Favorit"
        title="Daftar Favorit Saya"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4 text-red-500"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="hidden sm:inline text-xs font-bold tracking-tight">Favorit</span>
        {items.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-utama px-1.5 text-[11px] font-extrabold text-white">
            {items.length}
          </span>
        )}
      </button>

      {/* Backdrop & Drawer/Modal Favorit via React Portal */}
      {buka && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          onClick={() => setBuka(false)}
        >
          <div
            className="flex h-full w-full max-w-full sm:max-w-md flex-col bg-latar border-l border-garis shadow-2xl transition-transform duration-200 ease-out animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-garis px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-teks">Favorit Saya</h2>
                  <p className="text-xs text-teks-lembut">
                    {items.length === 0
                      ? "Belum ada item tersimpan"
                      : `${items.length} produk tersimpan di browser`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBuka(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-teks-lembut hover:bg-permukaan hover:text-teks transition"
                aria-label="Tutup Favorit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Notifikasi feedback */}
            {notifDitambahkan && (
              <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-utama/10 border border-utama/20 px-3 py-2 text-xs font-semibold text-utama">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Semua produk favorit berhasil dimasukkan ke keranjang!</span>
              </div>
            )}

            {/* Action Bar jika ada item */}
            {items.length > 0 && (
              <div className="flex items-center justify-between px-5 pt-3 text-xs">
                <button
                  type="button"
                  onClick={handlePindahkanSemua}
                  className="inline-flex items-center gap-1.5 font-bold text-utama hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.358 4H18.25a.75.75 0 0 1 .737.896l-1.5 7.5A.75.75 0 0 1 16.75 13H6.467l-.28 1.401A1.75 1.75 0 0 1 4.47 16H3.25a.75.75 0 0 1 0-1.5h1.22a.25.25 0 0 0 .248-.2l1.62-8.1A.75.75 0 0 1 7.076 5.5H16.14l-1.2 6H6.67l-.89-4.453A.75.75 0 0 1 5.358 6.5l-.24-1.2L4.872 4H1.75A.75.75 0 0 1 1 1.75Z" />
                    <path d="M6 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  + Keranjang Semua
                </button>
                <button
                  type="button"
                  onClick={handleKosongkan}
                  className="font-medium text-teks-lembut hover:text-red-500 transition-colors"
                >
                  Kosongkan
                </button>
              </div>
            )}

            {/* List Item Favorit */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-permukaan border border-garis text-teks-lembut">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 text-base font-bold text-teks">Belum Ada Favorit</p>
                  <p className="mt-1.5 max-w-xs text-xs text-teks-lembut leading-relaxed">
                    Tandai produk yang kamu sukai dengan menekan ikon hati pada katalog untuk menyimpannya di sini.
                  </p>
                  <button
                    type="button"
                    onClick={() => setBuka(false)}
                    className="mt-5 rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition"
                  >
                    Jelajahi Menu
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-3.5 rounded-2xl border border-garis bg-permukaan p-3.5 transition-all hover:border-utama/40 hover:shadow-xs"
                    >
                      <Link
                        href={`/produk/${item.id}`}
                        onClick={() => setBuka(false)}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-garis bg-latar"
                      >
                        <img
                          src={ambilFotoUtama(item.image)}
                          alt={item.nama}
                          onError={(e) => {
                            e.currentTarget.src = "/images/placeholder.svg";
                          }}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/produk/${item.id}`}
                          onClick={() => setBuka(false)}
                          className="block truncate text-sm font-bold text-teks hover:text-utama transition-colors"
                        >
                          {item.nama}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs font-extrabold text-harga">
                            {formatRupiah(item.harga)}
                          </span>
                          {item.kategori && (
                            <span className="rounded bg-latar border border-garis px-1.5 py-0.5 text-[10px] font-semibold text-teks-lembut">
                              {item.kategori}
                            </span>
                          )}
                        </div>

                        {/* Aksi Bar */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              tambahKeKeranjang(item, 1);
                              setNotifDitambahkan(true);
                              setTimeout(() => setNotifDitambahkan(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-utama/10 border border-utama/20 px-2.5 py-1 text-[11px] font-bold text-utama hover:bg-utama hover:text-white transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3 w-3"
                            >
                              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                            </svg>
                            <span>Keranjang</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleFavorit(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-teks-lembut hover:text-red-500 transition-colors"
                            title="Hapus dari favorit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            <div className="border-t border-garis bg-permukaan/50 p-4">
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="w-full rounded-xl border border-garis bg-permukaan py-2.5 text-center text-xs font-bold text-teks hover:border-utama hover:text-utama transition-colors"
              >
                Tutup Favorit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

