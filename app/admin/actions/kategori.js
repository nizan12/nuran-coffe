"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import {
  ambilPengaturanAdmin,
  simpanPengaturanAdmin,
  catatLogAktivitas,
} from "@/lib/pengaturanAdmin";

/**
 * US-31: Kelola Kategori (Tambah, Ubah, Hapus)
 */
export async function tambahKategoriAdmin(arg1, arg2) {
  const formData =
    arg2 && typeof arg2.get === "function"
      ? arg2
      : arg1 && typeof arg1.get === "function"
      ? arg1
      : null;

  if (!formData) return { error: "Form data tidak valid." };

  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const namaKategori = formData.get("nama")?.trim();
  if (!namaKategori || namaKategori.length < 2) {
    return { error: "Nama kategori minimal 2 karakter." };
  }

  const slug = namaKategori.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const supabaseServer = buatClientServer();
  await supabaseServer.from("kategori").insert({ nama: namaKategori, slug, urutan: 1 });

  const pengaturan = await ambilPengaturanAdmin();
  const kategoriList = Array.isArray(pengaturan.kategoriList) ? [...pengaturan.kategoriList] : [];
  if (!kategoriList.includes(namaKategori)) {
    kategoriList.push(namaKategori);
    await simpanPengaturanAdmin({ ...pengaturan, kategoriList });
  }

  await catatLogAktivitas("Tambah Kategori", `Menambahkan kategori "${namaKategori}"`);
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  return { sukses: "Kategori baru berhasil ditambahkan." };
}

export async function ubahKategoriAdmin(formData) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  const nama = (
    formData.get("nama") ||
    formData.get("namaBaru") ||
    formData.get("nama_baru")
  )?.trim();
  const namaBaru = nama;
  const nama_lama = (
    formData.get("nama_lama") ||
    formData.get("namaLama") ||
    formData.get("namaOld")
  )?.trim();
  const oldKat = nama_lama;

  if (!nama || nama.length < 2) {
    return { error: "Nama kategori baru minimal 2 karakter." };
  }

  const slug = namaBaru.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const supabaseServer = buatClientServer();

  if (id) {
    await supabaseServer.from("kategori").update({ nama: namaBaru, slug }).eq("id", Number(id));
  } else if (oldKat) {
    await supabaseServer.from("kategori").update({ nama: namaBaru, slug }).eq("nama", oldKat);
  }

  if (oldKat) {
    try {
      await supabaseServer.from("produk").update({ kategori: namaBaru }).eq("kategori", oldKat);
    } catch {}
  }

  const pengaturan = await ambilPengaturanAdmin();
  const kategoriList = (pengaturan.kategoriList || []).map((k) => (k === oldKat ? namaBaru : k));
  await simpanPengaturanAdmin({ ...pengaturan, kategoriList });

  await catatLogAktivitas("Ubah Kategori", `Mengubah kategori "${oldKat || id}" menjadi "${namaBaru}"`);
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
  return { sukses: "Kategori berhasil diperbarui." };
}

export async function hapusKategoriAdmin(formData) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const nama = formData.get("nama");
  const id = formData.get("id");
  if (!nama && !id) return;

  const supabaseServer = buatClientServer();

  // Cegah hapus jika kategori masih dipakai produk (US-31)
  const queryCek = id
    ? supabaseServer.from("produk").select("id", { count: "exact", head: true }).eq("kategori_id", Number(id))
    : supabaseServer.from("produk").select("id", { count: "exact", head: true }).eq("kategori", nama);

  const { count } = await queryCek;
  if (count && count > 0) {
    return { error: `Kategori "${nama}" tidak dapat dihapus karena sedang digunakan oleh ${count} produk.` };
  }

  if (id) {
    await supabaseServer.from("kategori").delete().eq("id", Number(id));
  } else {
    await supabaseServer.from("kategori").delete().eq("nama", nama);
  }

  const pengaturan = await ambilPengaturanAdmin();
  const kategoriList = (pengaturan.kategoriList || []).filter((k) => k !== nama);
  await simpanPengaturanAdmin({ ...pengaturan, kategoriList });

  await catatLogAktivitas("Hapus Kategori", `Menghapus kategori "${nama}"`);
  revalidatePath("/admin/kategori");
  revalidatePath("/admin");
  revalidatePath("/");
}
