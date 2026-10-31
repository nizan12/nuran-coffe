"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";

/**
 * US-38 & US-39: Ulasan Pengunjung & Moderasi Admin
 */
export async function kirimUlasanAction(prevState, formData) {
  const website = formData.get("website");
  if (website) {
    return { error: "Spam bot terdeteksi." };
  }

  const produkId = formData.get("produkId");
  const nama = formData.get("nama")?.trim();
  const rating = parseInt(formData.get("rating") || "5", 10);
  const komentar = formData.get("komentar")?.trim();

  if (!produkId) return { error: "ID produk tidak valid." };
  if (!nama || nama.length < 2 || nama.length > 60) return { error: "Nama pengulas 2-60 karakter." };
  if (isNaN(rating) || rating < 1 || rating > 5) return { error: "Rating harus berupa angka 1 sampai 5." };
  if (!komentar || komentar.length < 3 || komentar.length > 500) return { error: "Komentar ulasan 3-500 karakter." };

  const supabaseServer = buatClientServer();
  try {
    await supabaseServer.from("ulasan").insert({
      produk_id: Number(produkId) || produkId,
      nama,
      rating,
      komentar,
      status: "menunggu",
      created_at: new Date().toISOString(),
    });
  } catch {}

  const { tambahUlasanProduk } = await import("@/lib/pengaturanAdmin");
  await tambahUlasanProduk({ produkId, nama, rating, komentar });

  revalidatePath(`/produk/${produkId}`);
  revalidatePath("/admin/ulasan");
  return { sukses: "Terima kasih! Ulasan dan rating Anda berhasil dikirim dan menunggu moderasi admin." };
}

export async function moderasiUlasanAction(formData) {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user },
  } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  const statusBaru = formData.get("status");
  if (!id || !statusBaru) return;

  const supabaseServer = buatClientServer();
  try {
    await supabaseServer.from("ulasan").update({ status: statusBaru }).eq("id", id);
  } catch {}

  const { ubahStatusUlasan, catatLogAktivitas: logAction } = await import("@/lib/pengaturanAdmin");
  await ubahStatusUlasan(id, statusBaru);
  await logAction("Moderasi Ulasan", `Ulasan ID #${id} disetujui/diubah menjadi ${statusBaru}`);
  revalidatePath("/admin/ulasan");
}

export async function hapusUlasanAction(formData) {
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
  try {
    await supabaseServer.from("ulasan").delete().eq("id", id);
  } catch {}

  const { hapusUlasanAdmin, catatLogAktivitas: logAction } = await import("@/lib/pengaturanAdmin");
  await hapusUlasanAdmin(id);
  await logAction("Hapus Ulasan", `Menghapus ulasan ID #${id}`);
  revalidatePath("/admin/ulasan");
}
