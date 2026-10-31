"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import {
  simpanPengaturanAdmin,
  catatLogAktivitas,
} from "@/lib/pengaturanAdmin";

/**
 * US-43: Pengaturan profil toko dari admin
 */
export async function simpanPengaturanToko(prevState, formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const nama = formData.get("nama")?.trim();
  const nomorWhatsApp = formData.get("nomorWhatsApp")?.trim();
  const alamat = formData.get("alamat")?.trim();
  const jamBuka = formData.get("jamBuka")?.trim();
  const tagline = formData.get("tagline")?.trim() || "";

  // Validasi nomor WhatsApp format internasional dan teks wajib (US-43)
  if (!nama || nama.length < 2) {
    return { error: "Nama toko minimal 2 karakter." };
  }
  if (!nomorWhatsApp || !/^\d{9,16}$/.test(nomorWhatsApp.replace(/[^0-9]/g, ""))) {
    return { error: "Nomor WhatsApp wajib berupa nomor angka valid (misal: 6281234567890)." };
  }
  if (!alamat || alamat.length < 5) {
    return { error: "Alamat toko minimal 5 karakter." };
  }
  if (!jamBuka) {
    return { error: "Jam operasional toko harus diisi." };
  }

  const cleanWA = nomorWhatsApp.replace(/[^0-9]/g, "");

  // Simpan ke tabel Supabase pengaturan_toko
  const supabaseServer = buatClientServer();
  try {
    await supabaseServer
      .from("pengaturan_toko")
      .upsert({
        id: 1,
        nama,
        nomor_whatsapp: cleanWA,
        alamat,
        jam_buka: jamBuka,
        tagline,
      });
  } catch {}

  const tokoInfo = {
    nama,
    nomorWhatsApp: cleanWA,
    alamat,
    jamBuka,
    tagline,
  };

  await simpanPengaturanAdmin({ tokoInfo });
  await catatLogAktivitas("Ubah Pengaturan Toko", `Nama Toko: ${nama}, WA: ${cleanWA}`);
  revalidatePath("/");
  revalidatePath("/tentang");
  revalidatePath("/admin/pengaturan");
  return { sukses: "Pengaturan profil toko berhasil diperbarui!" };
}

/**
 * US-44: Kelola akun admin (Tambah akun & Hapus akun)
 */
export async function tambahAdmin(prevState, formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const email = formData.get("email")?.trim();
  const password = formData.get("password")?.trim();

  if (!email || !email.includes("@")) {
    return { error: "Email admin tidak valid." };
  }
  if (!password || password.length < 8) {
    return { error: "Password akun admin minimal 8 karakter." };
  }

  try {
    const supabaseServer = buatClientServer();
    const { data: newUser, error } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return { error: "Gagal membuat akun admin: " + error.message };
    }

    await catatLogAktivitas("Tambah Akun Admin", `Akun baru dibuat untuk ${email}`);
    revalidatePath("/admin/pengguna");
    return { sukses: `Akun admin ${email} berhasil dibuat!` };
  } catch (err) {
    return { error: "Terjadi kesalahan: " + err.message };
  }
}

export async function hapusAdmin(formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user: currentUser },
  } = await supabaseSesi.auth.getUser();
  if (!currentUser) {
    redirect("/admin/login");
  }

  const userId = formData.get("id");
  if (!userId || userId === currentUser.id) {
    return; // Cegah lockout menghapus akun sendiri
  }

  try {
    const supabaseServer = buatClientServer();
    await supabaseServer.auth.admin.deleteUser(userId);
    await catatLogAktivitas("Hapus Akun Admin", `Menghapus admin user ID #${userId}`);
    revalidatePath("/admin/pengguna");
  } catch (err) {
    console.error("Gagal menghapus user admin:", err);
  }
}
