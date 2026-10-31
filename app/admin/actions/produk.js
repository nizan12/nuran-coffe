"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import {
  ambilPengaturanAdmin,
  simpanPengaturanAdmin,
  catatLogAktivitas,
} from "@/lib/pengaturanAdmin";
import { unggahFotoLangsung } from "./upload";

/**
 * US-08 & US-34: Tambah produk dan validasi form di server
 */
export async function tambahProduk(prevState, formData) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi login sudah berakhir. Silakan login kembali." };
  }

  const nama = formData.get("nama")?.trim();
  const harga = parseInt(formData.get("harga"), 10);
  const kategori = formData.get("kategori")?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.trim() || null;
  const stok = parseInt(formData.get("stok") || "10", 10);
  const diskonPersen = parseInt(formData.get("diskon_persen") || "0", 10);
  const hargaCoret = parseInt(formData.get("harga_coret") || "0", 10);

  // Validasi form server ketat per field (US-34)
  const errors = {};
  if (!nama || nama.length < 3) {
    errors.nama = "Nama produk wajib diisi minimal 3 karakter.";
  } else if (nama.length > 100) {
    errors.nama = "Nama produk maksimal 100 karakter.";
  }

  if (isNaN(harga) || harga < 100) {
    errors.harga = "Harga minimal Rp 100.";
  } else if (harga > 100000000) {
    errors.harga = "Harga maksimal Rp 100.000.000.";
  }

  if (deskripsi && deskripsi.length > 1000) {
    errors.deskripsi = "Deskripsi maksimal 1000 karakter.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      error: Object.values(errors)[0],
      errors,
      fieldErrors: errors,
      values: { nama, harga, kategori, deskripsi, stok },
    };
  }

  // Upload file gambar ke Supabase Storage jika ada (US-29)
  const fileGambar = formData.get("file_gambar");
  let urlHasilUpload = null;
  if (fileGambar && typeof fileGambar === "object" && fileGambar.size > 0) {
    const uploadRes = await unggahFotoLangsung(formData);
    if (uploadRes?.url) {
      urlHasilUpload = uploadRes.url;
    }
  }

  const inputUrl = formData.get("foto_url");
  let daftarUrl = [];
  if (inputUrl && typeof inputUrl === "string") {
    daftarUrl = inputUrl.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (urlHasilUpload) {
    daftarUrl.unshift(urlHasilUpload);
  }

  const fotoFinal = daftarUrl.length > 0 ? daftarUrl.join(", ") : "/produk/kopi.svg";
  const supabaseServer = buatClientServer();

  // Cari atau buat kategori di tabel kategori Supabase
  let kategoriId = null;
  if (kategori) {
    const { data: katData } = await supabaseServer
      .from("kategori")
      .select("id")
      .ilike("nama", kategori)
      .maybeSingle();

    if (katData?.id) {
      kategoriId = katData.id;
    } else {
      const slug = kategori.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { data: katBaru } = await supabaseServer
        .from("kategori")
        .insert({ nama: kategori, slug, urutan: 99 })
        .select("id")
        .single();
      if (katBaru?.id) kategoriId = katBaru.id;
    }
  }

  const insertPayload = {
    nama,
    harga,
    deskripsi,
    foto_url: fotoFinal,
    stok: isNaN(stok) ? 10 : Math.max(0, stok),
    harga_coret: hargaCoret > harga ? hargaCoret : null,
    diskon_persen: diskonPersen > 0 ? diskonPersen : null,
    urutan: 99,
  };

  if (kategoriId !== null) {
    insertPayload.kategori = kategoriId;
    insertPayload.kategori_id = kategoriId;
  }

  const { data: produkBaru, error: insertError } = await supabaseServer
    .from("produk")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    return { error: "Gagal menyimpan produk: " + insertError.message };
  }

  // Simpan varian produk ke tabel varian Supabase (US-48)
  const varianJson = formData.get("varian_json");
  if (varianJson && produkBaru?.id) {
    try {
      const varianArray = JSON.parse(varianJson);
      if (Array.isArray(varianArray) && varianArray.length > 0) {
        const rows = varianArray.map((v) => ({
          produk_id: produkBaru.id,
          nama: String(v.nama || "Varian").trim(),
          harga_tambahan: Number(v.harga_tambahan) || 0,
          stok: v.stok !== null && v.stok !== undefined && !isNaN(Number(v.stok)) ? Number(v.stok) : null,
        }));
        await supabaseServer.from("varian").insert(rows);
      }
    } catch (e) {
      console.error("Gagal menyimpan varian:", e);
    }
  }

  await catatLogAktivitas("Tambah Produk", `Menambahkan produk "${nama}" (Rp ${harga})`);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

/**
 * US-09 & US-34: Ubah produk
 */
export async function ubahProduk(prevState, formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) {
    return { error: "Sesi login sudah berakhir. Silakan login kembali." };
  }

  const id = formData.get("id");
  const nama = formData.get("nama")?.trim();
  const harga = parseInt(formData.get("harga"), 10);
  const kategori = formData.get("kategori")?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.trim() || null;
  const stok = parseInt(formData.get("stok") || "10", 10);

  const errors = {};
  if (!nama || nama.length < 3) errors.nama = "Nama produk minimal 3 karakter.";
  if (isNaN(harga) || harga < 100) errors.harga = "Harga minimal Rp 100.";

  if (Object.keys(errors).length > 0) {
    return { error: Object.values(errors)[0], errors, fieldErrors: errors };
  }

  const supabaseServer = buatClientServer();

  let kategoriId = null;
  if (kategori) {
    if (!isNaN(Number(kategori))) {
      kategoriId = Number(kategori);
    } else {
      const { data: katData } = await supabaseServer
        .from("kategori")
        .select("id")
        .ilike("nama", kategori)
        .maybeSingle();

      if (katData?.id) {
        kategoriId = katData.id;
      } else {
        const slug = kategori.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const { data: katBaru } = await supabaseServer
          .from("kategori")
          .insert({ nama: kategori, slug, urutan: 99 })
          .select("id")
          .single();
        if (katBaru?.id) kategoriId = katBaru.id;
      }
    }
  }

  const updatePayload = {
    nama,
    harga,
    deskripsi,
    stok: isNaN(stok) ? 10 : Math.max(0, stok),
  };

  if (kategoriId !== null) {
    updatePayload.kategori = kategoriId;
    updatePayload.kategori_id = kategoriId;
  }

  const { error } = await supabaseServer
    .from("produk")
    .update(updatePayload)
    .eq("id", Number(id));

  if (error) {
    return { error: "Gagal menyimpan perubahan: " + error.message };
  }

  // Perbarui varian produk di tabel varian Supabase (US-48)
  const varianJson = formData.get("varian_json");
  if (varianJson) {
    try {
      const varianArray = JSON.parse(varianJson);
      if (Array.isArray(varianArray)) {
        await supabaseServer.from("varian").delete().eq("produk_id", Number(id));
        if (varianArray.length > 0) {
          const rows = varianArray.map((v) => ({
            produk_id: Number(id),
            nama: String(v.nama || "Varian").trim(),
            harga_tambahan: Number(v.harga_tambahan) || 0,
            stok: v.stok !== null && v.stok !== undefined && !isNaN(Number(v.stok)) ? Number(v.stok) : null,
          }));
          await supabaseServer.from("varian").insert(rows);
        }
      }
    } catch (e) {
      console.error("Gagal perbarui varian:", e);
    }
  }

  await catatLogAktivitas("Ubah Produk", `Memperbarui produk ID #${id} (${nama})`);
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/");
  redirect("/admin");
}

/**
 * US-10: Hapus produk
 */
export async function hapusProduk(formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  if (!id) return;

  const supabaseServer = buatClientServer();
  await supabaseServer.from("produk").delete().eq("id", Number(id));
  await catatLogAktivitas("Hapus Produk", `Menghapus produk ID #${id}`);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

/**
 * US-32: Aktif atau nonaktifkan produk
 * Memperbarui kolom `aktif` di tabel produk database dan menyinkronkan nonaktifIds
 */
export async function toggleProdukAktif(formData) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  if (!id) return;

  const supabaseServer = buatClientServer();

  // Ambil data produk saat ini dari database
  const { data: produkDb } = await supabaseServer
    .from("produk")
    .select("aktif, nama")
    .eq("id", Number(id))
    .single();

  const statusAktifSaatIni = produkDb?.aktif !== false;
  const statusAktifBaru = !statusAktifSaatIni;

  // 1. Update kolom `aktif` di database Supabase (US-32)
  await supabaseServer
    .from("produk")
    .update({ aktif: statusAktifBaru })
    .eq("id", Number(id));

  // 2. Sinkronkan nonaktifIds
  const pengaturan = await ambilPengaturanAdmin();
  let nonaktifIds = Array.isArray(pengaturan.nonaktifIds) ? [...pengaturan.nonaktifIds] : [];
  if (statusAktifBaru) {
    nonaktifIds = nonaktifIds.filter((item) => String(item) !== String(id));
  } else {
    if (!nonaktifIds.includes(Number(id))) nonaktifIds.push(Number(id));
  }
  await simpanPengaturanAdmin({ ...pengaturan, nonaktifIds });

  await catatLogAktivitas(
    "Ubah Status Tampil",
    `Produk ID #${id} (${produkDb?.nama || "Menu"}) diubah menjadi ${statusAktifBaru ? "Aktif" : "Nonaktif (Draft)"}`
  );

  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/");
}

export const toggleStatusProduk = toggleProdukAktif;

/**
 * US-48: Aksi kelola varian produk di server
 */
export async function tambahVarian(formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir." };

  const produkId = formData.get("produk_id");
  const nama = formData.get("nama")?.trim();
  const hargaTambahan = parseInt(formData.get("harga_tambahan") || "0", 10);
  const stok = formData.get("stok") ? parseInt(formData.get("stok"), 10) : null;

  if (!produkId || !nama) return { error: "Data varian tidak lengkap." };

  const supabaseServer = buatClientServer();
  await supabaseServer.from("varian").insert({
    produk_id: Number(produkId),
    nama,
    harga_tambahan: isNaN(hargaTambahan) ? 0 : hargaTambahan,
    stok: isNaN(stok) ? null : stok,
  });

  revalidatePath(`/produk/${produkId}`);
  revalidatePath(`/admin/produk/${produkId}/ubah`);
  return { sukses: true };
}

export async function hapusVarian(formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) return { error: "Sesi login berakhir." };

  const varianId = formData.get("varian_id");
  const produkId = formData.get("produk_id");
  if (!varianId) return { error: "ID varian tidak valid." };

  const supabaseServer = buatClientServer();
  await supabaseServer.from("varian").delete().eq("id", Number(varianId));

  if (produkId) {
    revalidatePath(`/produk/${produkId}`);
    revalidatePath(`/admin/produk/${produkId}/ubah`);
  }
  return { sukses: true };
}

/**
 * US-47: Atur urutan tampil produk
 */
export async function simpanUrutanProduk(urutanIds) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  if (!Array.isArray(urutanIds)) return { error: "Format data salah." };

  const supabaseServer = buatClientServer();
  try {
    for (let index = 0; index < urutanIds.length; index++) {
      await supabaseServer
        .from("produk")
        .update({ urutan: index + 1 })
        .eq("id", Number(urutanIds[index]));
    }
  } catch {}

  const pengaturan = await ambilPengaturanAdmin();
  await simpanPengaturanAdmin({ ...pengaturan, urutanIds });
  await catatLogAktivitas("Atur Urutan Produk", `Memperbarui kolom urutan produk (${urutanIds.length} item).`);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function tambahStokCepat(formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    return { error: "Sesi login berakhir." };
  }

  const id = formData.get("id");
  const jumlah = parseInt(formData.get("jumlah"), 10);
  const mode = formData.get("mode") || "tambah";

  if (!id || isNaN(jumlah)) {
    return { error: "Data stok tidak valid." };
  }

  try {
    const supabaseServer = buatClientServer();
    const { data: p } = await supabaseServer
      .from("produk")
      .select("stok, nama")
      .eq("id", id)
      .single();

    let stokBaru = jumlah;
    if (mode === "tambah") {
      stokBaru = Math.max(0, (p?.stok || 0) + jumlah);
    }

    await supabaseServer.from("produk").update({ stok: stokBaru }).eq("id", id);
    await catatLogAktivitas("Ubah Stok", `Mengubah stok produk "${p?.nama || id}" menjadi ${stokBaru}`);
    revalidatePath("/admin");
    revalidatePath(`/produk/${id}`);
    return { sukses: true, stokBaru };
  } catch (err) {
    return { error: err.message || "Gagal mengubah stok." };
  }
}
