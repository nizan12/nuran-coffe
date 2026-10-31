import { ambilFotoUtama } from "@/lib/format";

const STORAGE_KEY = "nuran_favorit_v1";

export function ambilFavorit() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function simpanFavorit(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("favorit-updated", { detail: items }));
  } catch (err) {
    console.error("Gagal menyimpan favorit:", err);
  }
}

export function isFavorit(id) {
  const items = ambilFavorit();
  return items.some((item) => item.id === id);
}

export function toggleFavorit(produk) {
  const items = ambilFavorit();
  const index = items.findIndex((item) => item.id === produk.id);
  let updated;
  if (index >= 0) {
    updated = items.filter((item) => item.id !== produk.id);
  } else {
    updated = [
      ...items,
      {
        id: produk.id,
        nama: produk.nama,
        harga: Number(produk.harga) || 0,
        image: ambilFotoUtama(produk),
        kategori: produk.kategori || "",
      },
    ];
  }
  simpanFavorit(updated);
  return index < 0; // return true jika baru saja ditambahkan
}

export function bersihkanFavorit() {
  simpanFavorit([]);
}


