import { NextResponse } from "next/server";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const urutan = searchParams.get("urutan") || "";
    const cari = searchParams.get("cari") || "";
    const kategori = searchParams.get("kategori") || "";
    const halaman = Math.max(1, parseInt(searchParams.get("halaman") || searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || searchParams.get("per_page") || "100", 10));

    const supabase = buatClientServer();
    let query = supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, image, foto_url, stok, kategori_id, kategori, urutan, created_at, kategori_rel:kategori_id(id, nama, slug)", { count: "exact" });

    if (cari) {
      query = query.ilike("nama", `%${cari}%`);
    }

    if (kategori) {
      query = query.ilike("kategori", `%${kategori}%`);
    }

    // US-15: Pengurutan produk langsung di database Supabase via .order()
    if (urutan === "termurah" || urutan === "harga-asc") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal" || urutan === "harga-desc") {
      query = query.order("harga", { ascending: false });
    } else if (urutan === "terbaru") {
      query = query.order("created_at", { ascending: false });
    } else if (urutan === "nama") {
      query = query.order("nama", { ascending: true });
    } else {
      query = query
        .order("urutan", { ascending: true, nullsFirst: false })
        .order("nama", { ascending: true });
    }

    // US-16: Paginasi dengan .range() dan limit
    if (searchParams.has("halaman") || searchParams.has("page")) {
      const awal = (halaman - 1) * limit;
      const akhir = awal + limit - 1;
      query = query.range(awal, akhir);
    }

    const { data: rawProduk, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const config = await ambilPengaturanAdmin();
    const nonaktifIds = config.nonaktifIds || [];
    const normalized = normalisasiDaftarProduk(rawProduk || []);
    const produkAktif = normalized.filter((p) => !nonaktifIds.includes(p.id) && p.aktif !== false);

    return NextResponse.json({
      produk: produkAktif,
      total: count ?? produkAktif.length,
      halaman,
      limit,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
