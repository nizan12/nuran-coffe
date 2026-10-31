import { NextResponse } from "next/server";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = buatClientServer();

    // Jalankan query produk dan pengaturan secara paralel
    const [produkRes, config] = await Promise.all([
      supabase
        .from("produk")
        .select("id, nama, harga, deskripsi, image, foto_url, kategori_id, kategori_rel:kategori_id(id, nama, slug)")
        .order("nama", { ascending: true }),
      ambilPengaturanPublik(),
    ]);

    if (produkRes.error) {
      return NextResponse.json({ error: produkRes.error.message }, { status: 500 });
    }

    const nonaktifIds = config.nonaktifIds || [];
    const normalized = normalisasiDaftarProduk(produkRes.data || []);
    const produkAktif = normalized.filter((p) => !nonaktifIds.includes(p.id));

    return NextResponse.json({ produk: produkAktif });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
