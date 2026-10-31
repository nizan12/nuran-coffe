"use server";

import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { toko } from "@/lib/toko";

/**
 * US-29: Upload foto ke Supabase Storage
 */
export async function unggahFotoLangsung(formData) {
  const supabaseSesi = await buatClientSesi();
  const { data: { user } } = await supabaseSesi.auth.getUser();
  if (!user) {
    return { error: "Sesi login sudah berakhir. Silakan login kembali." };
  }

  const file = formData.get("file") || formData.get("file_gambar");
  if (!file || typeof file !== "object" || file.size === 0) {
    return { error: "File foto tidak ditemukan." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran foto maksimal 5 MB." };
  }

  const tipeValid = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!tipeValid.includes(file.type)) {
    return { error: "Format foto harus JPG, PNG, WEBP, atau GIF." };
  }

  const supabaseServer = buatClientServer();
  const ekstensi = file.name.split(".").pop() || "jpg";
  const namaFile = `produk-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ekstensi}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseServer.storage
    .from("image")
    .upload(namaFile, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return { error: "Gagal mengunggah foto ke storage: " + uploadError.message };
  }

  const { data: { publicUrl } } = supabaseServer.storage.from("image").getPublicUrl(namaFile);
  return { sukses: true, url: publicUrl };
}

/**
 * US-14: Deskripsi produk dibuat AI (Gemini)
 */
export async function buatDeskripsiAI(arg1, arg2) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesi login sudah berakhir. Silakan login kembali." };
  }

  let nama = "";
  let kategori = "";
  if (typeof arg1 === "object" && arg1 !== null) {
    nama = arg1.nama || "";
    kategori = arg1.kategori || "";
  } else if (typeof arg1 === "string") {
    nama = arg1;
    kategori = typeof arg2 === "string" ? arg2 : "";
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk harus diisi terlebih dahulu." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "GEMINI_API_KEY belum dikonfigurasi di server." };
  }

  const prompt = `Buatkan deskripsi produk yang menarik, singkat (2-3 kalimat), dan menggugah selera pembeli untuk kedai "${toko.nama}".
Nama produk: ${nama.trim()}
${kategori ? `Kategori: ${kategori.trim()}` : ""}
Tulis dalam bahasa Indonesia yang ramah, sopan, tanpa emoji, dan tanpa format markdown.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );
    clearTimeout(timer);
    const json = await res.json();
    const hasil = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (hasil) {
      const bersih = hasil.replace(/[*#_~`]/g, "").trim();
      return { deskripsi: bersih };
    }
  } catch (err) {
    clearTimeout(timer);
  }

  return { error: "Gagal menghasilkan deskripsi AI. Silakan coba kembali." };
}
