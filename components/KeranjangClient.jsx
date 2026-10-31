"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ambilKeranjang,
  ubahJumlahItem,
  simpanKeranjang,
} from "@/lib/keranjang";
import { formatRupiah } from "@/lib/format";
import { toko as defaultToko } from "@/lib/toko";
import Tombol from "@/components/Tombol";

export default function KeranjangClient({ toko = null }) {
  const tokoInfo = toko || defaultToko;
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(ambilKeranjang());

    function handleUpdate() {
      setItems(ambilKeranjang());
    }

    window.addEventListener("keranjang-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("keranjang-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  function handleUbah(id, delta) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const jumlahBaru = item.jumlah + delta;
    ubahJumlahItem(id, jumlahBaru);
    setItems(ambilKeranjang());
  }

  function handleHapus(id) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    simpanKeranjang(updated);
  }

  // Hitung total dengan benar (US-21)
  const totalHarga = items.reduce(
    (sum, item) => sum + (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
    0
  );
  const totalItem = items.reduce((sum, item) => sum + (Number(item.jumlah) || 1), 0);

  // Buat pesan WhatsApp untuk seluruh item keranjang menggunakan info toko dari database (US-21 & US-43)
  function handleCheckoutWhatsApp() {
    if (items.length === 0) return;

    let pesan = `Halo ${tokoInfo.nama}, saya ingin memesan menu berikut:\n\n`;
    items.forEach((item, idx) => {
      const subtotal = (Number(item.harga) || 0) * (Number(item.jumlah) || 1);
      pesan += `${idx + 1}. *${item.nama}* x${item.jumlah} = ${formatRupiah(subtotal)}\n`;
    });
    pesan += `\n*Total Belanja:* ${formatRupiah(totalHarga)}`;
    pesan += `\n\nMohon konfirmasi ketersediaan dan cara pembayaran. Terima kasih!`;

    const nomorWA = tokoInfo?.nomorWhatsApp || defaultToko.nomorWhatsApp;
    const urlWA = `https://wa.me/${nomorWA}?text=${encoded}`;

    // Catat klik analitik pemesanan keranjang async non-blocking (US-40)
    try {
      const payload = JSON.stringify({
        produkId: items[0]?.id || 1,
        nama: `Keranjang (${items.length} menu)`,
        harga: totalHarga,
        jumlah: totalItem,
      });
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/analitik/klik", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/analitik/klik", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}

    window.open(urlWA, "_blank", "noopener,noreferrer");
  }

  if (!mounted) {
    return (
      <div className="py-12 text-center text-sm text-teks-lembut">
        Memuat keranjang belanja…
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-teks-lembut mb-4">
        <Link href="/" className="hover:text-utama transition">
          Beranda
        </Link>
        <span>/</span>
        <span className="font-semibold text-teks">Keranjang Belanja</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teks">
            Keranjang Pesanan Menu
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-teks-lembut">
            Kelola menu pilihanmu sebelum mengirim pesanan langsung ke WhatsApp {tokoInfo.nama}.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setItems([]);
              simpanKeranjang([]);
            }}
            className="text-xs text-red-600 hover:underline cursor-pointer"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-dashed border-garis bg-permukaan/40 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-utama dark:bg-emerald-950/40 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-teks">Keranjang Belanja Masih Kosong</h2>
          <p className="mt-1 max-w-sm text-xs text-teks-lembut">
            Yuk pilih kopi favorit atau camilan lezat dari katalog kami dan masukkan ke keranjang belanja.
          </p>
          <div className="mt-5">
            <Tombol href="/" varian="utama">
              Jelajahi Menu Kopi
            </Tombol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Daftar Item Keranjang */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {items.map((item) => {
              const subtotal = (Number(item.harga) || 0) * (Number(item.jumlah) || 1);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-garis bg-latar p-3.5 shadow-2xs"
                >
                  <img
                    src={item.image || "/images/placeholder.svg"}
                    alt={item.nama}
                    className="h-16 w-16 rounded-xl object-cover border border-garis shrink-0 bg-permukaan"
                  />

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produk/${item.id}`}
                      className="block truncate text-sm font-bold text-teks hover:text-utama transition"
                    >
                      {item.nama}
                    </Link>
                    <p className="text-xs font-semibold text-harga mt-0.5">
                      {formatRupiah(item.harga)}
                    </p>

                    {/* Kontrol Ubah Jumlah (+ / -) dan Hapus (US-21) */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-garis bg-permukaan">
                        <button
                          type="button"
                          onClick={() => handleUbah(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center text-xs font-bold text-teks hover:bg-garis transition cursor-pointer"
                          title="Kurangi jumlah"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-teks">
                          {item.jumlah}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUbah(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center text-xs font-bold text-teks hover:bg-garis transition cursor-pointer"
                          title="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleHapus(item.id)}
                        className="text-xs text-red-500 hover:underline cursor-pointer ml-2"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-teks">
                      {formatRupiah(subtotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ringkasan Belanja & Tombol WhatsApp (US-21) */}
          <div className="lg:col-span-5 rounded-3xl border border-garis bg-permukaan p-5 sm:p-6 shadow-xs flex flex-col gap-4 sticky top-24">
            <h2 className="text-base font-bold text-teks border-b border-garis pb-3">
              Ringkasan Pesanan
            </h2>

            <div className="flex flex-col gap-2 text-xs text-teks-lembut">
              <div className="flex justify-between">
                <span>Total Jumlah Menu:</span>
                <span className="font-bold text-teks">{totalItem} porsi</span>
              </div>
              <div className="flex justify-between">
                <span>Nomor WhatsApp Toko:</span>
                <span className="font-bold text-teks">{tokoInfo.nomorWhatsApp}</span>
              </div>
              <div className="border-t border-garis pt-3 mt-1 flex justify-between items-center text-sm">
                <span className="font-bold text-teks">Total Belanja:</span>
                <span className="text-xl font-black text-harga">{formatRupiah(totalHarga)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              className="mt-2 w-full rounded-2xl bg-utama py-3.5 px-4 text-center text-xs font-extrabold text-white shadow-xs hover:bg-utama-gelap transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Pesan Semua via WhatsApp</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
