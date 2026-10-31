"use client";

import { ambilFotoUtama } from "@/lib/format";

const STORAGE_KEY = "nuran_bandingkan_v1";

export function ambilProdukBandingkan() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function simpanProdukBandingkan(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("bandingkan-updated", { detail: items }));
  } catch (err) {
    console.error("Gagal menyimpan produk bandingkan:", err);
  }
}

export function toggleBandingkan(produk) {
  const items = ambilProdukBandingkan();
  const index = items.findIndex((i) => i.id === produk.id);

  if (index >= 0) {
    const updated = items.filter((i) => i.id !== produk.id);
    simpanProdukBandingkan(updated);
    return false;
  }

  if (items.length >= 2) {
    // Ganti item tertua jika sudah 2
    const updated = [items[1], formatProduk(produk)];
    simpanProdukBandingkan(updated);
    return true;
  }

  const updated = [...items, formatProduk(produk)];
  simpanProdukBandingkan(updated);
  return true;
}

export function isBandingkan(id) {
  const items = ambilProdukBandingkan();
  return items.some((i) => i.id === id);
}

export function kosongkanBandingkan() {
  simpanProdukBandingkan([]);
}

function formatProduk(p) {
  return {
    id: p.id,
    nama: p.nama,
    harga: Number(p.harga) || 0,
    kategori: p.kategori || "",
    deskripsi: p.deskripsi || "Tidak ada deskripsi",
    image: ambilFotoUtama(p),
  };
}
