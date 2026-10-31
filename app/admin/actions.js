"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { toko } from "@/lib/toko";
import {
  ambilPengaturanAdmin,
  simpanPengaturanAdmin,
  catatLogAktivitas,
} from "@/lib/pengaturanAdmin";

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

  const { data: produkBaru, error: insertError } = await supabaseServer
    .from("produk")
    .insert({
      nama,
      harga,
      kategori,
      kategori_id: kategoriId,
      deskripsi,
      foto_url: fotoFinal,
      stok: isNaN(stok) ? 10 : Math.max(0, stok),
      harga_coret: hargaCoret > harga ? hargaCoret : null,
      diskon_persen: diskonPersen > 0 ? diskonPersen : null,
      urutan: 99,
    })
    .select()
    .single();

  if (insertError) {
    return { error: "Gagal menyimpan produk: " + insertError.message };
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
  const { error } = await supabaseServer
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      deskripsi,
      stok: isNaN(stok) ? 10 : Math.max(0, stok),
    })
    .eq("id", Number(id));

  if (error) {
    return { error: "Gagal menyimpan perubahan: " + error.message };
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

/**
 * US-32: Aktif atau nonaktifkan produk
 */
export async function toggleProdukAktif(formData) {
  const supabase = await buatClientSesi();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const id = formData.get("id");
  if (!id) return;

  const pengaturan = await ambilPengaturanAdmin();
  let nonaktifIds = Array.isArray(pengaturan.nonaktifIds) ? [...pengaturan.nonaktifIds] : [];

  const isNonaktif = nonaktifIds.includes(Number(id)) || nonaktifIds.includes(String(id));
  if (isNonaktif) {
    nonaktifIds = nonaktifIds.filter((item) => String(item) !== String(id));
  } else {
    nonaktifIds.push(Number(id) || id);
  }

  await simpanPengaturanAdmin({ ...pengaturan, nonaktifIds });
  await catatLogAktivitas(
    "Ubah Status Tampil",
    `Produk ID #${id} diubah menjadi ${isNonaktif ? "Aktif" : "Nonaktif (Draft)"}`
  );

  revalidatePath("/admin");
  revalidatePath("/");
}

export const toggleStatusProduk = toggleProdukAktif;

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

