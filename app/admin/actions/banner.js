"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { catatLogAktivitas } from "@/lib/pengaturanAdmin";

/**
 * US-42: Banner Promo di Beranda (Tambah, Ubah, Toggle, Hapus)
 */
export async function tambahBannerAdmin(arg1, arg2) {
  const formData =
    arg2 && typeof arg2.get === "function"
      ? arg2
      : arg1 && typeof arg1.get === "function"
      ? arg1
      : null;

  if (!formData) return { error: "Form data tidak valid." };

  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const judul = formData.get("judul")?.trim();
  const subjudul = formData.get("subjudul")?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.trim() || null;
  const badge = formData.get("badge")?.trim() || "PROMO SPESIAL";
  const tombol_teks = formData.get("tombol_teks")?.trim() || "Pesan via WhatsApp";
  const link_url = formData.get("link_url")?.trim() || "/";
  const foto_url = formData.get("foto_url")?.trim() || null;
  const bg_gradient = formData.get("bg_gradient")?.trim() || "from-emerald-950 via-utama-gelap to-utama";

  if (!judul || judul.length < 3) {
    return { error: "Judul banner wajib diisi minimal 3 karakter." };
  }

  const supabaseServer = buatClientServer();
  const { error } = await supabaseServer.from("banner").insert({
    judul,
    subjudul,
    deskripsi,
    badge,
    tombol_teks,
    link_url,
    foto_url,
    bg_gradient,
    aktif: true,
    urutan: 1,
  });

  if (error) {
    return { error: "Gagal menyimpan banner: " + error.message };
  }

  await catatLogAktivitas("Tambah Banner", `Menambahkan banner promo "${judul}"`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { sukses: "Banner promo baru berhasil ditambahkan!" };
}

export async function ubahBannerAdmin(formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  if (!id) return { error: "ID banner tidak valid." };

  const judul = formData.get("judul")?.trim();
  const subjudul = formData.get("subjudul")?.trim() || null;
  const deskripsi = formData.get("deskripsi")?.trim() || null;
  const badge = formData.get("badge")?.trim() || "PROMO";
  const tombol_teks = formData.get("tombol_teks")?.trim() || "Pesan via WhatsApp";
  const link_url = formData.get("link_url")?.trim() || "/";
  const foto_url = formData.get("foto_url")?.trim() || null;
  const bg_gradient = formData.get("bg_gradient")?.trim() || "from-emerald-950 via-utama-gelap to-utama";

  const supabaseServer = buatClientServer();
  await supabaseServer
    .from("banner")
    .update({
      judul,
      subjudul,
      deskripsi,
      badge,
      tombol_teks,
      link_url,
      foto_url,
      bg_gradient,
    })
    .eq("id", Number(id));

  await catatLogAktivitas("Ubah Banner", `Mengubah banner promo "${judul}" (#${id})`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { sukses: "Banner promo berhasil diperbarui!" };
}

export async function toggleStatusBannerAdmin(formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  const aktifSaatIni = formData.get("aktif") === "true";
  if (!id) return;

  const supabaseServer = buatClientServer();
  await supabaseServer
    .from("banner")
    .update({ aktif: !aktifSaatIni })
    .eq("id", Number(id));

  await catatLogAktivitas(
    "Ubah Status Banner",
    `Banner ID #${id} diubah menjadi ${!aktifSaatIni ? "Aktif" : "Nonaktif"}`
  );
  revalidatePath("/");
  revalidatePath("/admin/banner");
}

export async function hapusBannerAdmin(formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  if (!id) return;

  const supabaseServer = buatClientServer();
  await supabaseServer.from("banner").delete().eq("id", Number(id));

  await catatLogAktivitas("Hapus Banner", `Menghapus banner ID #${id}`);
  revalidatePath("/");
  revalidatePath("/admin/banner");
}
