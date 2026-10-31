import { buatClientSesi, buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";

export async function GET() {
  const sesi = await buatClientSesi();
  const {
    data: { user },
  } = await sesi.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = buatClientServer();
  const { data: rawProduk, error } = await supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .order("id", { ascending: true });

  const daftarProduk = normalisasiDaftarProduk(rawProduk);

  if (error || !daftarProduk || daftarProduk.length === 0) {
    return new Response("Gagal mengambil data produk", { status: 500 });
  }

  // Buat header CSV
  const header = ["ID", "Nama Produk", "Kategori", "Harga", "Deskripsi", "Foto URL"];

  // Escape string untuk CSV
  function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  const baris = daftarProduk.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.nama),
    escapeCSV(p.kategori),
    p.harga,
    escapeCSV(p.deskripsi),
    escapeCSV(p.image || p.foto_url),
  ]);

  const csv = [header.join(","), ...baris.map((b) => b.join(","))].join("\r\n");

  const tanggal = new Date().toISOString().split("T")[0];
  const filename = `katalog-produk-${tanggal}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
