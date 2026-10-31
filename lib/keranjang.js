import { ambilFotoUtama } from "@/lib/format";

const STORAGE_KEY = "nuran_keranjang_v1";

export function ambilKeranjang() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function simpanKeranjang(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("keranjang-updated", { detail: items }));
  } catch (err) {
    console.error("Gagal menyimpan keranjang:", err);
  }
}

export function tambahKeKeranjang(produk, jumlah = 1) {
  const items = ambilKeranjang();
  const index = items.findIndex((i) => i.id === produk.id);
  if (index >= 0) {
    items[index].jumlah += jumlah;
  } else {
    items.push({
      id: produk.id,
      nama: produk.nama,
      harga: Number(produk.harga) || 0,
      image: ambilFotoUtama(produk),
      jumlah: jumlah,
    });
  }
  simpanKeranjang(items);
}

export function ubahJumlahItem(id, jumlah) {
  let items = ambilKeranjang();
  if (jumlah <= 0) {
    items = items.filter((i) => i.id !== id);
  } else {
    items = items.map((i) => (i.id === id ? { ...i, jumlah } : i));
  }
  simpanKeranjang(items);
}

export function hapusDariKeranjang(id) {
  const items = ambilKeranjang().filter((i) => i.id !== id);
  simpanKeranjang(items);
}

export function kosongkanKeranjang() {
  simpanKeranjang([]);
}
