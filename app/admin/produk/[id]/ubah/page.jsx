import Link from "next/link";
import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatClientServer, normalisasiProduk } from "@/lib/supabase";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  const supabase = buatClientServer();
  const { data: rawProduk, error } = await supabase
    .from("produk")
    .select("*, kategori_rel:kategori_id(id, nama, slug)")
    .eq("id", id)
    .single();

  const produk = normalisasiProduk(rawProduk);

  if (error || !produk) {
    notFound();
  }

  const { data: varianList } = await supabase
    .from("varian")
    .select("*")
    .eq("produk_id", id)
    .order("id", { ascending: true });

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
            <span>Ubah Produk #{id}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teks">
              Ubah Data Produk
            </h1>
            <span className="rounded-lg bg-utama/10 border border-utama/20 px-2.5 py-0.5 text-xs font-bold text-utama">
              ID #{id}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-teks-lembut mt-1">
            Perbarui foto, harga promo, stok ketersediaan, atau pilihan varian menu.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/produk/${id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition shadow-2xs"
            title="Buka halaman menu di katalog pembeli"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-teks-lembut"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h4a.75.75 0 0 1 0 1.5h-4Z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 0 0 1.06 1.06l7.996-7.998v4.185a.75.75 0 0 0 1.5 0V4.75a.75.75 0 0 0-.75-.75h-5.25a.75.75 0 0 0 0 1.5h4.184l-7.99 7.99v.013Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Lihat di Toko</span>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-garis bg-permukaan px-3.5 py-2 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition"
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
            <span>Kembali</span>
          </Link>
        </div>
      </div>

      <FormProduk
        produk={produk}
        varianAwal={varianList || []}
        kategoriList={kategoriList || []}
        labelTombol="Simpan Perubahan"
        action={ubahProduk}
      />
    </div>
  );
}
