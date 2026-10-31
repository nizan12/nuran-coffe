import { NextResponse } from "next/server";
import { catatKlikProduk } from "@/lib/pengaturanAdmin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { produkId, nama, harga, jumlah } = body || {};

    if (produkId) {
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
