"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { simpanPengaturanAdmin, catatLogAktivitas } from "@/lib/pengaturanAdmin";

/**
 * US-46: Impor produk dari CSV
 */
export async function imporProdukCSV(prevState, formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const file = formData.get("file_csv") || formData.get("file");
  if (!file || typeof file !== "object" || file.size === 0) {
    return { error: "Pilih file CSV terlebih dahulu." };
  }

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      return { error: "File CSV kosong atau hanya berisi baris header." };
    }

    const dataBaris = lines.slice(1);
    let totalBerhasil = 0;
    let totalGagal = 0;
    const barisGagal = [];
    const rowsToInsert = [];

    dataBaris.forEach((line, index) => {
      const nomorBaris = index + 2;
      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const [nama, hargaStr, kategori, deskripsi, foto_url] = cols;
      const harga = parseInt(hargaStr, 10);

      if (!nama || nama.length < 3 || isNaN(harga) || harga < 100) {
        totalGagal += 1;
        barisGagal.push({ baris: nomorBaris, line });
        return;
      }

      totalBerhasil += 1;
      rowsToInsert.push({
        nama,
        harga,
        kategori: kategori || "Umum",
        deskripsi: deskripsi || "",
        foto_url: foto_url || "/produk/kopi.svg",
        stok: 10,
        urutan: 99,
      });
    });

    if (totalBerhasil > 0) {
      const supabaseServer = buatClientServer();
      await supabaseServer.from("produk").insert(rowsToInsert);
      await catatLogAktivitas("Impor CSV", `Berhasil mengimpor ${totalBerhasil} produk.`);
      revalidatePath("/admin");
      revalidatePath("/");
    }

    const daftarNomorBarisGagal = barisGagal.map((b) => b.baris);
    const ringkasanPesan = `Ringkasan impor: Berhasil ${totalBerhasil} produk, Gagal ${totalGagal} baris${
      totalGagal > 0 ? ` (Nomor baris salah: ${daftarNomorBarisGagal.join(", ")})` : ""
    }.`;

    return {
      sukses: ringkasanPesan,
      ringkasan: {
        berhasil: totalBerhasil,
        gagal: totalGagal,
        barisGagal: daftarNomorBarisGagal,
      },
    };
  } catch (err) {
    return { error: "Gagal memproses file CSV: " + err.message };
  }
}

/**
 * US-45: Kosongkan riwayat log aktivitas
 */
export async function kosongkanLogAktivitas() {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  try {
    const supabaseServer = buatClientServer();
    await supabaseServer.from("log_aktivitas").delete().neq("id", 0);
  } catch {}

  await simpanPengaturanAdmin({ auditLog: [] });
  revalidatePath("/admin/aktivitas");
}
