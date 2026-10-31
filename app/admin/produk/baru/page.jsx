import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatClientServer } from "@/lib/supabase";
import { tambahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

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
            Lengkapi rincian foto, harga jual, diskon promo, jumlah stok, dan pilihan varian menu.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-teks-lembut"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          <span>Kembali ke Daftar</span>
        </Link>
      </div>

      <FormProduk
        kategoriList={kategoriList || []}
        labelTombol="Simpan Produk Baru"
        action={tambahProduk}
      />
    </div>
  );
}
