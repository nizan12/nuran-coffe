"use server";

import { redirect } from "next/navigation";
import { buatClientSesi } from "@/lib/supabase";
import { catatLogAktivitas } from "@/lib/pengaturanAdmin";

// Rate limit proteksi brute-force login (K-12)
const rateLimitMap = new Map();

/**
 * US-04: Login admin
 */
export async function loginAdmin(prevState, formData) {
  const email = formData.get("email")?.toLowerCase()?.trim();
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const now = Date.now();
  const attempt = rateLimitMap.get(email) || { count: 0, lockUntil: 0 };

  if (attempt.lockUntil > now) {
    const sisaMenit = Math.ceil((attempt.lockUntil - now) / 60000);
    return {
      error: `Terlalu banyak percobaan gagal. Akun dibatasi sementara, silakan coba ${sisaMenit} menit lagi.`,
    };
  }

  const supabase = await buatClientSesi();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const newCount = attempt.count + 1;
    if (newCount >= 5) {
      rateLimitMap.set(email, { count: newCount, lockUntil: now + 10 * 60 * 1000 });
      return {
        error: "Terlalu banyak percobaan gagal. Akun dibatasi sementara selama 10 menit.",
      };
    } else {
      rateLimitMap.set(email, { count: newCount, lockUntil: 0 });
    }
    return { error: `Email atau password salah. (Sisa percobaan: ${5 - newCount})` };
  }

  rateLimitMap.delete(email);
  await catatLogAktivitas("Login Admin", `Admin ${email} berhasil login.`);
  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await buatClientSesi();
  await catatLogAktivitas("Logout Admin", "Admin keluar dari sesi.");
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * US-05: Ganti password admin
 */
export async function gantiPassword(prevState, formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasi = formData.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasi) {
    return { error: "Semua field wajib diisi." };
  }
  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }
  if (passwordBaru !== konfirmasi) {
    return { error: "Password baru dan konfirmasi tidak sama." };
  }

  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi login sudah berakhir. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: "Gagal mengganti password: " + error.message };
  }

  await catatLogAktivitas("Ganti Password", "Admin memperbarui password akun.");
  return { sukses: "Password berhasil diganti." };
}
