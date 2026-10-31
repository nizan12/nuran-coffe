import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatClientServer } from "@/lib/supabase";
import { tambahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Tambah Produk Baru - Admin",
};

export default async function HalamanTambahProduk() {
  const supabase = buatClientServer();
  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("id, nama")
    .order("urutan", { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-6 sm:py-8 max-w-5xl mx-auto">
      <NavAdmin />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-garis pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-teks-lembut mb-1">
            <Link href="/admin" className="hover:text-utama transition">
              Admin
            </Link>
            <span>/</span>
            <span>Tambah Produk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teks">
            Tambah Menu / Produk Baru
          </h1>
          <p className="text-xs sm:text-sm text-teks-lembut mt-1">
            Lengkapi nama menu, harga, foto produk, dan buat deskripsi otomatis dengan AI.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition"
        >
          ← Kembali ke Daftar
        </Link>
      </div>

      {/* Form Tambah Produk Terpadu memakai pilihan tabel kategori (US-08, US-14, US-29, US-31, US-34) */}
      <FormProduk
        kategoriList={kategoriList || []}
        action={tambahProduk}
      />
    </div>
  );
}
