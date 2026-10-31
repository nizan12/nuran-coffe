"use client";

const STORAGE_KEY = "nuran_terakhir_dilihat_v1";

export function ambilTerakhirDilihat(kecualiId = null) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (kecualiId) {
      return list.filter((item) => String(item.id) !== String(kecualiId));
    }
    return list;
  } catch {
    return [];
  }
}

export function catatProdukDilihat(produk) {
  if (typeof window === "undefined" || !produk || !produk.id) return;
  try {
    const list = ambilTerakhirDilihat();
    const filtered = list.filter((item) => String(item.id) !== String(produk.id));
    const updated = [
      {
        id: produk.id,
        nama: produk.nama,
        harga: Number(produk.harga) || 0,
        image: produk.image || produk.foto_url || "/produk/kopi.svg",
        kategori: produk.kategori || "",
        harga_coret: produk.harga_coret || null,
        stok: produk.stok,
      },
      ...filtered,
    ].slice(0, 6); // Simpan maksimal 6 produk terakhir

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("terakhir-dilihat-updated"));
  } catch (err) {
    console.error("Gagal mencatat produk terakhir dilihat:", err);
  }
}
