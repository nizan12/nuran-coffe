import { NextResponse } from "next/server";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = buatClientServer();
    const { data: rawProduk, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, image, foto_url, kategori_id, kategori_rel:kategori_id(id, nama, slug)")
      .order("nama", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const config = await ambilPengaturanAdmin();
    const nonaktifIds = config.nonaktifIds || [];
    const normalized = normalisasiDaftarProduk(rawProduk || []);
    const produkAktif = normalized.filter((p) => !nonaktifIds.includes(p.id));

    return NextResponse.json({ produk: produkAktif });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
