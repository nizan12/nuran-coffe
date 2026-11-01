"use client";

/**
 * US-36: Terakhir dilihat
 * Util penyimpanan riwayat produk di localStorage dengan batas jumlah (maks. 6 produk).
 */

export const STORAGE_KEY = "nuran_terakhir_dilihat_v1";
export const BATAS_JUMLAH = 6;

/**
 * Mengambil daftar riwayat produk terakhir dilihat dari localStorage
 * @param {string|number|null} kecualiId - ID produk yang sedang dibuka (opsional untuk dikecualikan)
 * @param {number} batas - Batas maksimal riwayat yang diambil
 * @returns {Array} Daftar produk riwayat
 */
export function ambilProdukTerakhirDilihat(kecualiId = null, batas = BATAS_JUMLAH) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const hasil = kecualiId
      ? list.filter((item) => String(item.id) !== String(kecualiId))
      : list;
    return hasil.slice(0, batas);
  } catch {
    return [];
  }
}

// Alias untuk kompatibilitas
export const ambilTerakhirDilihat = ambilProdukTerakhirDilihat;

/**
 * Menyimpan / mencatat produk ke dalam riwayat terakhir dilihat di localStorage
 * @param {Object} produk - Objek data produk (id, nama, harga, image/foto_url, kategori, stok, harga_coret)
 * @param {number} batas - Batas maksimal penyimpanan
 */
export function simpanProdukTerakhirDilihat(produk, batas = BATAS_JUMLAH) {
  if (typeof window === "undefined" || !produk || !produk.id) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = Array.isArray(list)
      ? list.filter((item) => String(item.id) !== String(produk.id))
      : [];

    const itemBaru = {
      id: produk.id,
      nama: produk.nama,
      harga: Number(produk.harga) || 0,
      image: produk.image || produk.foto_url || "/produk/kopi.svg",
      foto_url: produk.foto_url || produk.image || "/produk/kopi.svg",
      kategori: produk.kategori || "",
      harga_coret: produk.harga_coret || null,
      stok: produk.stok !== undefined ? produk.stok : 10,
    };

    const updated = [itemBaru, ...filtered].slice(0, batas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Kirim event update agar UI langsung bereaksi
    window.dispatchEvent(new CustomEvent("terakhir-dilihat-updated", { detail: updated }));
  } catch {}
}

// Alias untuk kompatibilitas
export const catatProdukDilihat = simpanProdukTerakhirDilihat;

/**
 * Menghapus seluruh riwayat produk terakhir dilihat
 */
export function hapusRiwayatTerakhirDilihat() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("terakhir-dilihat-updated", { detail: [] }));
  } catch {}
}
