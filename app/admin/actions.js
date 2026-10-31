/**
 * Barrel re-export file: app/admin/actions.js
 *
 * Semua server action dipecah ke modul domain-specific di folder actions/
 * agar file lebih kecil dan mudah diverifikasi. File ini meng-export ulang
 * semua action agar import path lama "@/app/admin/actions" tetap berfungsi.
 */

// Auth (US-04, US-05)
export { loginAdmin, logoutAdmin, gantiPassword } from "./actions/auth";

// Produk CRUD (US-08, US-09, US-10, US-32, US-34, US-47)
export {
  tambahProduk,
  ubahProduk,
  hapusProduk,
  toggleProdukAktif,
  toggleStatusProduk,
  simpanUrutanProduk,
  tambahStokCepat,
  tambahVarian,
  hapusVarian,
} from "./actions/produk";

// Banner Promo (US-42)
export {
  tambahBannerAdmin,
  ubahBannerAdmin,
  toggleStatusBannerAdmin,
  hapusBannerAdmin,
} from "./actions/banner";

// Kategori (US-31)
export {
  tambahKategoriAdmin,
  ubahKategoriAdmin,
  hapusKategoriAdmin,
} from "./actions/kategori";

// Ulasan (US-38, US-39)
export {
  kirimUlasanAction,
  moderasiUlasanAction,
  hapusUlasanAction,
} from "./actions/ulasan";

// Pengaturan Toko & Admin User (US-43, US-44)
export {
  simpanPengaturanToko,
  tambahAdmin,
  hapusAdmin,
} from "./actions/pengaturan";

// Upload & AI (US-29, US-14)
export { unggahFotoLangsung, buatDeskripsiAI } from "./actions/upload";

// Impor CSV & Log (US-45, US-46)
export { imporProdukCSV, kosongkanLogAktivitas } from "./actions/utilitas";
