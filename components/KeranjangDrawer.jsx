"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ambilKeranjang,
  ubahJumlahItem,
  hapusDariKeranjang,
  kosongkanKeranjang,
} from "@/lib/keranjang";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function KeranjangDrawer() {
  const [buka, setBuka] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState([]);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    setMounted(true);
    setItems(ambilKeranjang());

    function handleUpdate(e) {
      setItems(e.detail || ambilKeranjang());
    }

    window.addEventListener("keranjang-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("keranjang-updated", handleUpdate);
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

  const totalItem = items.reduce((sum, item) => sum + item.jumlah, 0);
  const subtotal = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

  function checkoutWhatsApp() {
    if (items.length === 0) return;

    let pesan = `Halo *${toko.nama}*, saya ingin memesan:\n\n`;

    items.forEach((item, index) => {
      pesan += `${index + 1}. *${item.nama}*\n   ${item.jumlah}x @ ${formatRupiah(item.harga)} = ${formatRupiah(item.harga * item.jumlah)}\n`;
    });

    pesan += `\n*Total Belanja: ${formatRupiah(subtotal)}*`;

    if (catatan.trim()) {
      pesan += `\n\nCatatan:\n"${catatan.trim()}"`;
    }

    pesan += `\n\nMohon info ketersediaan pesanan dan instruksi pembayaran. Terima kasih!`;

    items.forEach((item) => {
      try {
        fetch("/api/analitik/klik", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            produkId: item.id,
            nama: item.nama,
            harga: item.harga,
            jumlah: item.jumlah,
          }),
        });
      } catch {}
    });

    const url = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {/* Trigger Button Navbar */}
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="relative inline-flex items-center gap-2 rounded-xl bg-utama px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-utama-gelap"
        aria-label="Buka Keranjang Belanja"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <span className="hidden sm:inline">Keranjang</span>
        {totalItem > 0 && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-utama">
            {totalItem}
          </span>
        )}
      </button>

      {/* Drawer Overlay via React Portal */}
      {buka && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setBuka(false)}
        >
          {/* Drawer Body */}
          <div
            className="flex h-full w-full max-w-full sm:max-w-md flex-col bg-latar p-6 shadow-2xl transition-transform border-l border-garis animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-garis pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-utama/10 text-utama">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-teks">Keranjang Belanja</h2>
                  <p className="text-xs text-teks-lembut">{totalItem} menu terpilih</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="rounded-lg p-2 text-teks-lembut transition hover:bg-permukaan hover:text-teks"
                aria-label="Tutup Keranjang"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* List Item Keranjang */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center text-teks-lembut">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-permukaan text-teks-lembut">
                    <svg
                      className="h-8 w-8 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 font-bold text-teks">Keranjang Masih Kosong</p>
                  <p className="mt-1 text-xs text-teks-lembut max-w-xs">
                    Pilih menu kopi atau camilan favorit Anda di katalog lalu klik tambah keranjang.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-garis bg-permukaan p-3.5"
                    >
                      <img
                        src={ambilFotoUtama(item.image)}
                        alt={item.nama}
                        onError={(e) => {
                          e.currentTarget.src = "/images/placeholder.svg";
                        }}
                        className="h-16 w-16 rounded-xl object-cover bg-latar border border-garis"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-bold text-sm text-teks">{item.nama}</h3>
                        <p className="text-xs font-bold text-harga mt-0.5">
                          {formatRupiah(item.harga)}
                        </p>

                        {/* Selector Quantity */}
                        <div className="mt-2 inline-flex items-center rounded-lg border border-garis bg-latar">
                          <button
                            type="button"
                            onClick={() => ubahJumlahItem(item.id, item.jumlah - 1)}
                            className="px-2.5 py-0.5 text-sm font-bold text-teks-lembut transition hover:text-utama"
                            aria-label="Kurang satu"
                          >
                            −
                          </button>
                          <span className="min-w-[1.8rem] text-center text-xs font-bold text-teks">
                            {item.jumlah}
                          </span>
                          <button
                            type="button"
                            onClick={() => ubahJumlahItem(item.id, item.jumlah + 1)}
                            className="px-2.5 py-0.5 text-sm font-bold text-teks-lembut transition hover:text-utama"
                            aria-label="Tambah satu"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => hapusDariKeranjang(item.id)}
                        className="rounded-lg p-2 text-teks-lembut transition hover:bg-red-50 hover:text-red-600"
                        title="Hapus dari keranjang"
                        aria-label="Hapus item"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-garis pt-4">
                {/* Catatan Pemesanan */}
                <div className="mb-3">
                  <label htmlFor="catatan-keranjang" className="text-xs font-semibold text-teks">
                    Catatan Pesanan (opsional):
                  </label>
                  <input
                    id="catatan-keranjang"
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Less sugar / antarkan ke meja depan"
                    className="mt-1 w-full rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
                  />
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between pb-3">
                  <span className="text-xs font-medium text-teks-lembut">Total Belanja:</span>
                  <span className="text-xl font-extrabold text-harga">{formatRupiah(subtotal)}</span>
                </div>

                {/* Checkout via WhatsApp */}
                <button
                  type="button"
                  onClick={checkoutWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-utama py-3 text-sm font-bold text-white shadow-md transition hover:bg-utama-gelap"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-2.001-.462-1.637-.678-2.688-2.348-2.769-2.458-.08-.109-.658-.876-.658-1.67 0-.795.418-1.185.566-1.345.148-.16.323-.2.431-.2.109 0 .218.001.313.006.102.005.238-.039.373.285.14.337.478 1.164.52 1.249.043.085.072.185.015.298-.057.113-.086.183-.171.284-.086.102-.18.227-.257.305-.086.086-.176.18-.076.352.1.172.443.731.95 1.183.654.582 1.206.762 1.378.848.172.086.273.072.375-.045.102-.117.435-.508.55-.682.115-.174.23-.145.388-.086.158.058 1.002.472 1.174.558.172.086.287.129.33.201.043.072.043.418-.101.823z" />
                  </svg>
                  <span>Pesan Semua via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={kosongkanKeranjang}
                  className="mt-2.5 block w-full text-center text-xs text-teks-lembut hover:text-red-600 transition"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

