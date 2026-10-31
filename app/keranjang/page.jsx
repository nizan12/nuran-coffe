import { buatClientServer } from "@/lib/supabase";
import { toko as defaultToko } from "@/lib/toko";
import KeranjangClient from "@/components/KeranjangClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Keranjang Belanja",
  description: "Keranjang pesanan menu kopi dan makanan siap dipesan via WhatsApp.",
};

export default async function HalamanKeranjang() {
  const supabase = buatClientServer();
  let toko = defaultToko;

  // US-43: Ambil identitas toko langsung dari database Supabase (pengaturan_toko)
  try {
    const { data: dbToko } = await supabase
      .from("pengaturan_toko")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (dbToko) {
      toko = {
        nama: dbToko.nama || defaultToko.nama,
        nomorWhatsApp: dbToko.nomor_whatsapp || defaultToko.nomorWhatsApp,
        alamat: dbToko.alamat || defaultToko.alamat,
        jamBuka: dbToko.jam_buka || defaultToko.jamBuka,
        tagline: dbToko.tagline || defaultToko.tagline || "",
        deskripsi: dbToko.deskripsi || defaultToko.deskripsi || "",
      };
    }
  } catch {}

  return <KeranjangClient toko={toko} />;
}
