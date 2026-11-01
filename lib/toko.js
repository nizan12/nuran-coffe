// Identitas toko. Ganti dengan data usahamu (lihat lembar kustomisasi).
export const toko = {
  nama: "Nuran Artisan Coffee",
  tagline: "Kelezatan Kopi Nusantara Pilihan & Pastry Panggang Segar, Diseduh Penuh Cerita.",
  deskripsi:
    "Kedai kopi artisan lokal yang menghadirkan seduhan biji kopi Nusantara pilihan, racikan minuman signature istimewa, serta pastry panggang segar yang siap menemani setiap momen santaimu.",
  // Format internasional tanpa tanda + dan tanpa angka 0 di depan. Contoh: 6281234567890
  nomorWhatsApp: "6285156670861",
  alamat: "Batam Center, Teluk Tering, Kepulauan Riau",
  jamBuka: "Setiap hari, 08.00–20.00",
};

/**
 * US-03 & US-12: Pesan via WhatsApp
 * Membuka WhatsApp ke nomor di lib/toko.js dengan pesan otomatis berisi nama, varian, jumlah, dan harga produk.
 */
export function buatLinkWhatsApp(namaProduk, hargaProduk, varian = "Regular", jumlah = 1) {
  const hargaTeks =
    typeof hargaProduk === "number"
      ? `Rp ${hargaProduk.toLocaleString("id-ID")}`
      : String(hargaProduk || "");
  const total = typeof hargaProduk === "number" ? `Rp ${(hargaProduk * jumlah).toLocaleString("id-ID")}` : hargaTeks;
  const pesan = `Halo, saya ingin memesan:\n\n*${namaProduk}*\nVarian: ${varian}\nHarga: ${hargaTeks}\nJumlah: ${jumlah}\nTotal: ${total}\n\nTerima kasih!`;
  return `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
}
