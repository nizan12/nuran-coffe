import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat Supabase client untuk dipakai di sisi server
 * (Server Component, Server Action, Route Handler).
 * Jangan impor file ini dari komponen "use client".
 */
export function buatClientServer() {
  const url = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "placeholder-key";

  return createClient(url, key);
}

/**
 * Membuat Supabase client dengan sesi admin (cookie).
 * Dipakai untuk login, logout, ganti password, dan aksi yang mengubah data.
 * Memakai SUPABASE_PUBLISHABLE_KEY supaya RLS tetap berlaku.
 */
export async function buatClientSesi() {
  const url = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "placeholder-key";

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll dipanggil dari Server Component — abaikan.
          // Refresh sesi ditangani oleh proxy.js.
        }
      },
    },
  });
}

/**
 * Normalisasi data produk agar selalu memiliki `kategori` berupa teks nama kategori,
 * baik dibaca langsung dari relasi `kategori_id` maupun kolom legacy.
 */
export function normalisasiProduk(p) {
  if (!p) return p;
  const relNama = p.kategori_rel?.nama || p.kategori_rel?.name;
  const textNama = typeof p.kategori === "object" ? p.kategori?.nama : p.kategori;
  const finalNama = relNama || textNama || "Menu";
  const harga = Number(p.harga) || 0;
  let harga_coret = p.harga_coret ? Number(p.harga_coret) : null;
  let diskon_persen = p.diskon_persen ? Number(p.diskon_persen) : 0;

  if (harga_coret && harga_coret > harga && !diskon_persen) {
    diskon_persen = Math.round((1 - harga / harga_coret) * 100);
  } else if (diskon_persen && diskon_persen > 0 && !harga_coret && harga > 0) {
    harga_coret = Math.round(harga / (1 - diskon_persen / 100));
  }

  return {
    ...p,
    kategori: finalNama,
    kategori_nama: finalNama,
    kategori_slug: p.kategori_rel?.slug || (typeof p.kategori === "object" ? p.kategori?.slug : ""),
    harga_coret,
    diskon_persen,
  };
}

export function normalisasiDaftarProduk(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalisasiProduk);
}
