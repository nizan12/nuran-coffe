// DATA CONTOH: hanya untuk tampilan awal sebelum terhubung ke database.
// Nama kolom sama persis dengan tabel "produk" di docs/schema.sql.
// Setelah US-01 selesai, halaman tidak lagi memakai file ini.

export const produkContoh = [
  {
    id: 1,
    nama: "Es Kopi Susu Aren Narun",
    harga: 22000,
    deskripsi:
      "Perpaduan espresso ganda dari biji kopi pilihan nusantara, susu segar lembut, dan gula aren organik cair. Signature terfavorit dengan rasa legit dan creamy yang seimbang.",
    foto_url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
    kategori: "Signature Coffee",
  },
  {
    id: 2,
    nama: "Caffe Latte Creamy",
    harga: 26000,
    deskripsi:
      "Espresso kaya rasa yang dipadukan dengan susu murni berbusa halus (microfoam). Memberikan sensasi rasa kopi lembut yang menenangkan setiap tegukan.",
    foto_url: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=800&auto=format&fit=crop",
    kategori: "Espresso Based",
  },
  {
    id: 3,
    nama: "Americano Dingin (Iced Americano)",
    harga: 20000,
    deskripsi:
      "Dua shot espresso segar disajikan dengan air murni dan es kristal. Pilihan tepat untuk penikmat kopi hitam bersih beraroma kuat tanpa rasa manis.",
    foto_url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop",
    kategori: "Espresso Based",
  },
  {
    id: 4,
    nama: "Manual Brew V60 Gayo Arabika",
    harga: 30000,
    deskripsi:
      "Seduhan tangan metode pour-over V60 menggunakan biji kopi Arabika Gayo Aceh pilihan. Memunculkan aroma bunga melati, acidity buah segar, dan aftertaste manis karamel yang bersih.",
    foto_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
    kategori: "Manual Brew",
  },
  {
    id: 5,
    nama: "Matcha Latte Uji Premium",
    harga: 28000,
    deskripsi:
      "Teh hijau matcha murni berkualitas tinggi dipadukan dengan susu segar manis lembut. Cocok dinikmati dingin maupun hangat untuk suasana santai bebas kafein tinggi.",
    foto_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop",
    kategori: "Non-Kopi",
  },
  {
    id: 6,
    nama: "Butter Croissant Panggang",
    harga: 24000,
    deskripsi:
      "Pastry renyah keemasan dengan mentega harum, lembut berlapis di bagian dalam. Dipanggang hangat setiap hari sebagai teman paling pas mendampingi kopi favoritmu.",
    foto_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
    kategori: "Camilan & Pastry",
  },
];

export function cariProdukContoh(id) {
  return produkContoh.find((produk) => String(produk.id) === String(id));
}
