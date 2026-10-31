import { NextResponse } from "next/server";
import { buatClientServer } from "@/lib/supabase";
import { catatKlikProduk } from "@/lib/pengaturanAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { produkId, nama, harga, jumlah } = body || {};

    if (produkId) {
      const pid = Number(produkId);
      const supabase = buatClientServer();

      // US-40: Simpan data klik pemesanan ke tabel database klik_whatsapp (produk_id, nama, harga, jumlah, waktu created_at)
      await supabase.from("klik_whatsapp").insert({
        produk_id: isNaN(pid) ? null : pid,
        nama_produk: String(nama || "Produk").slice(0, 100),
        harga: Number(harga) || 0,
        jumlah: Math.max(1, Number(jumlah) || 1),
        sumber: "detail",
        created_at: new Date().toISOString(),
      });

      // Cadangan penyimpanan internal
      await catatKlikProduk({
        produkId,
        nama: nama || "Produk",
        harga: Number(harga) || 0,
        jumlah: Number(jumlah) || 1,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
