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
  const maxStok =
    produk.stok !== undefined && produk.stok !== null ? Number(produk.stok) : 999;
  const index = items.findIndex((i) => i.id === produk.id);
  if (index >= 0) {
    const existingStok = items[index].stok !== undefined && items[index].stok !== null ? items[index].stok : maxStok;
    items[index].jumlah = Math.min(items[index].jumlah + jumlah, existingStok);
    items[index].stok = existingStok;
  } else {
    items.push({
      id: produk.id,
      nama: produk.nama,
      harga: Number(produk.harga) || 0,
      image: ambilFotoUtama(produk),
      jumlah: Math.min(jumlah, maxStok),
      stok: maxStok,
    });
  }
  simpanKeranjang(items);
}

export function ubahJumlahItem(id, jumlah) {
  let items = ambilKeranjang();
  if (jumlah <= 0) {
    items = items.filter((i) => i.id !== id);
  } else {
    items = items.map((i) => {
      if (i.id === id) {
        const batas = i.stok !== undefined && i.stok !== null ? Number(i.stok) : 999;
        return { ...i, jumlah: Math.min(jumlah, batas) };
      }
      return i;
    });
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
