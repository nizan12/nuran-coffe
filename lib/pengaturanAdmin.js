import { buatClientServer, buatClientSesi } from "@/lib/supabase";
import { toko as defaultToko } from "@/lib/toko";

const CONFIG_FILE = "pengaturan.json";

/**
 * Mengambil seluruh data pengaturan, kategori, log, analitik, dan ulasan.
 * Prioritas: Baca dari tabel Supabase (pengaturan_toko, kategori, log_aktivitas, klik_whatsapp_per_produk, ulasan).
 * Fallback: Baca dari pengaturan.json di Supabase Storage jika tabel belum dibuat.
 */
export async function ambilPengaturanAdmin() {
  const supabase = buatClientServer();

  let tokoInfo = defaultToko;
  let kategoriList = [];
  let auditLog = [];
  let analitikKlik = {};
  let ulasanList = [];
  let nonaktifIds = [];
  let urutanIds = [];

  // 1. Ambil Pengaturan Toko dari tabel `pengaturan_toko`
  try {
    const { data: dbToko, error } = await supabase
      .from("pengaturan_toko")
      .select("*")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!error && dbToko) {
      tokoInfo = {
        nama: dbToko.nama || defaultToko.nama,
        nomorWhatsApp: dbToko.nomor_whatsapp || defaultToko.nomorWhatsApp,
        alamat: dbToko.alamat || defaultToko.alamat,
        jamBuka: dbToko.jam_buka || defaultToko.jamBuka,
        tagline: dbToko.tagline || defaultToko.tagline || "",
        deskripsi: dbToko.deskripsi || "",
        instagram: dbToko.instagram || "",
      };
    }
  } catch {}

  // 2. Ambil Kategori dari tabel `kategori`
  try {
    const { data: dbKategori, error } = await supabase
      .from("kategori")
      .select("nama")
      .order("urutan", { ascending: true });

    if (!error && Array.isArray(dbKategori) && dbKategori.length > 0) {
      kategoriList = dbKategori.map((k) => k.nama);
    }
  } catch {}

  // 3. Ambil Log Aktivitas dari tabel `log_aktivitas`
  try {
    const { data: dbLogs, error } = await supabase
      .from("log_aktivitas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && Array.isArray(dbLogs) && dbLogs.length > 0) {
      auditLog = dbLogs.map((l) => ({
        id: String(l.id),
        timestamp: l.created_at,
        user: l.admin_email || "Admin",
        aksi: l.aksi,
        rincian: l.rincian || "",
      }));
    }
  } catch {}

  // 4. Ambil Analitik Klik dari View `klik_whatsapp_per_produk` atau tabel `klik_whatsapp`
  try {
    const { data: dbAnalitik, error } = await supabase
      .from("klik_whatsapp_per_produk")
      .select("*");

    if (!error && Array.isArray(dbAnalitik) && dbAnalitik.length > 0) {
      dbAnalitik.forEach((row) => {
        analitikKlik[row.produk_id] = {
          id: row.produk_id,
          nama: row.nama_produk || "Produk",
          totalKlik: Number(row.total_klik) || 0,
          totalJumlah: Number(row.total_jumlah) || 0,
          totalNilai: Number(row.total_nilai) || 0,
          terakhirKlik: row.klik_terakhir || new Date().toISOString(),
        };
      });
    }
  } catch {}

  // 5. Ambil Ulasan dari tabel `ulasan`
  try {
    const { data: dbUlasan, error } = await supabase
      .from("ulasan")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(dbUlasan) && dbUlasan.length > 0) {
      ulasanList = dbUlasan.map((u) => ({
        id: String(u.id),
        produkId: String(u.produk_id),
        nama: u.nama,
        rating: u.rating,
        komentar: u.komentar,
        status: u.disetujui ? "disetujui" : "tertunda",
        tanggal: u.created_at,
      }));
    }
  } catch {}

  // 6. Baca data Storage cadangan / pelengkap (nonaktifIds, urutanIds, atau fallback data toko)
  try {
    const { data, error } = await supabase.storage.from("image").download(CONFIG_FILE);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);

      nonaktifIds = Array.isArray(parsed.nonaktifIds) ? parsed.nonaktifIds : [];
      urutanIds = Array.isArray(parsed.urutanIds) ? parsed.urutanIds : [];

      // Gunakan data cadangan jika tabel Supabase belum terisi
      if (tokoInfo === defaultToko && parsed.tokoInfo) {
        tokoInfo = parsed.tokoInfo;
      }
      if (kategoriList.length === 0 && Array.isArray(parsed.kategoriList)) {
        kategoriList = parsed.kategoriList;
      }
      if (auditLog.length === 0 && Array.isArray(parsed.auditLog)) {
        auditLog = parsed.auditLog;
      }
      if (Object.keys(analitikKlik).length === 0 && parsed.analitikKlik) {
        analitikKlik = parsed.analitikKlik;
      }
      if (ulasanList.length === 0 && Array.isArray(parsed.ulasanList)) {
        ulasanList = parsed.ulasanList;
      }
    }
  } catch {}

  return {
    nonaktifIds,
    urutanIds,
    kategoriList,
    tokoInfo,
    analitikKlik,
    auditLog,
    ulasanList,
  };
}

/**
 * Menyimpan konfigurasi ke database Supabase dan storage cadangan
 */
export async function simpanPengaturanAdmin(pengaturan) {
  const supabase = buatClientServer();

  // Jika ada perubahan tokoInfo, simpan juga ke tabel `pengaturan_toko`
  if (pengaturan.tokoInfo) {
    try {
      const t = pengaturan.tokoInfo;
      const { data: existing } = await supabase
        .from("pengaturan_toko")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("pengaturan_toko")
          .update({
            nama: t.nama,
            nomor_whatsapp: t.nomorWhatsApp,
            alamat: t.alamat,
            jam_buka: t.jamBuka,
            tagline: t.tagline || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("pengaturan_toko").insert({
          nama: t.nama,
          nomor_whatsapp: t.nomorWhatsApp,
          alamat: t.alamat,
          jam_buka: t.jamBuka,
          tagline: t.tagline || "",
        });
      }
    } catch {}
  }

  // Simpan ke storage cadangan
  try {
    const current = await ambilPengaturanAdmin();
    const merged = { ...current, ...pengaturan };
    const buffer = Buffer.from(JSON.stringify(merged, null, 2));
    await supabase.storage.from("image").upload(CONFIG_FILE, buffer, {
      upsert: true,
      contentType: "application/json",
    });
    return true;
  } catch (err) {
    console.error("Gagal menyimpan pengaturan admin:", err);
    return false;
  }
}

/**
 * US-40: Mencatat analitik klik pemesanan WhatsApp
 * Menyimpan langsung ke tabel `klik_whatsapp` jika tersedia.
 */
export async function catatKlikProduk({ produkId, nama, harga = 0, jumlah = 1, sumber = "detail" }) {
  const supabase = buatClientServer();

  // 1. Coba simpan langsung ke tabel `klik_whatsapp`
  try {
    const pid = Number(produkId);
    await supabase.from("klik_whatsapp").insert({
      produk_id: isNaN(pid) ? null : pid,
      nama_produk: nama || "Produk",
      harga: Number(harga) || 0,
      jumlah: Number(jumlah) || 1,
      sumber,
    });
  } catch {}

  // 2. Simpan juga ke storage cadangan agar backward-compatible
  try {
    const config = await ambilPengaturanAdmin();
    const analitik = config.analitikKlik || {};
    const existing = analitik[produkId] || {
      id: produkId,
      nama: nama || "Produk",
      totalKlik: 0,
      totalJumlah: 0,
      totalNilai: 0,
      terakhirKlik: new Date().toISOString(),
    };

    analitik[produkId] = {
      ...existing,
      nama: nama || existing.nama,
      totalKlik: existing.totalKlik + 1,
      totalJumlah: existing.totalJumlah + Number(jumlah),
      totalNilai: existing.totalNilai + Number(harga) * Number(jumlah),
      terakhirKlik: new Date().toISOString(),
    };

    await simpanPengaturanAdmin({ analitikKlik: analitik });
    return true;
  } catch (err) {
    console.error("Gagal mencatat analitik klik:", err);
    return false;
  }
}

/**
 * US-45: Mencatat audit log aktivitas admin
 * Menyimpan ke tabel `log_aktivitas` jika tersedia.
 */
export async function catatLogAktivitas(aksi, rincian = "") {
  let emailUser = "Admin";
  try {
    const supabaseSesi = await buatClientSesi();
    const {
      data: { user },
    } = await supabaseSesi.auth.getUser();
    if (user?.email) emailUser = user.email;
  } catch {}

  const supabase = buatClientServer();

  // 1. Simpan ke tabel `log_aktivitas`
  try {
    await supabase.from("log_aktivitas").insert({
      admin_email: emailUser,
      aksi,
      rincian,
    });
  } catch {}

  // 2. Simpan juga ke storage cadangan
  try {
    const config = await ambilPengaturanAdmin();
    const logList = Array.isArray(config.auditLog) ? config.auditLog : [];

    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: emailUser,
      aksi,
      rincian,
    };

    const updatedLogs = [newEntry, ...logList].slice(0, 100);
    await simpanPengaturanAdmin({ auditLog: updatedLogs });
    return true;
  } catch (err) {
    console.error("Gagal mencatat audit log:", err);
    return false;
  }
}

/**
 * US-38 & US-39: Manajemen Ulasan dan Rating Produk
 * Terhubung ke tabel `ulasan`.
 */
export async function ambilUlasanProduk(produkId) {
  const supabase = buatClientServer();

  // 1. Ambil dari tabel `ulasan`
  try {
    const pid = Number(produkId);
    if (!isNaN(pid)) {
      const { data, error } = await supabase
        .from("ulasan")
        .select("*")
        .eq("produk_id", pid)
        .eq("disetujui", true)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((u) => ({
          id: String(u.id),
          produkId: String(u.produk_id),
          nama: u.nama,
          rating: u.rating,
          komentar: u.komentar,
          status: "disetujui",
          tanggal: u.created_at,
        }));
      }
    }
  } catch {}

  // 2. Fallback ke storage
  const config = await ambilPengaturanAdmin();
  const list = Array.isArray(config.ulasanList) ? config.ulasanList : [];
  return list.filter((u) => String(u.produkId) === String(produkId) && u.status === "disetujui");
}

export async function tambahUlasanProduk({ produkId, nama, rating, komentar }) {
  const supabase = buatClientServer();
  const pid = Number(produkId);
  const ratingValid = Math.max(1, Math.min(5, Number(rating) || 5));
  const pengulas = nama || "Pelanggan";
  const isiKomentar = komentar || "";

  // 1. Simpan ke tabel `ulasan`
  try {
    if (!isNaN(pid)) {
      const { data } = await supabase
        .from("ulasan")
        .insert({
          produk_id: pid,
          nama: pengulas,
          rating: ratingValid,
          komentar: isiKomentar,
          disetujui: true,
        })
        .select()
        .single();

      if (data) {
        return {
          id: String(data.id),
          produkId: String(data.produk_id),
          nama: data.nama,
          rating: data.rating,
          komentar: data.komentar,
          status: "disetujui",
          tanggal: data.created_at,
        };
      }
    }
  } catch {}

  // 2. Simpan juga ke storage cadangan
  const config = await ambilPengaturanAdmin();
  const list = Array.isArray(config.ulasanList) ? config.ulasanList : [];

  const newReview = {
    id: Date.now().toString(),
    produkId: String(produkId),
    nama: pengulas,
    rating: ratingValid,
    komentar: isiKomentar,
    status: "disetujui",
    tanggal: new Date().toISOString(),
  };

  const updated = [newReview, ...list];
  await simpanPengaturanAdmin({ ulasanList: updated });
  return newReview;
}

export async function ubahStatusUlasan(id, statusBaru) {
  const supabase = buatClientServer();

  // 1. Update di tabel `ulasan`
  try {
    const numId = Number(id);
    if (!isNaN(numId)) {
      await supabase
        .from("ulasan")
        .update({ disetujui: statusBaru === "disetujui" })
        .eq("id", numId);
    }
  } catch {}

  // 2. Update di storage
  const config = await ambilPengaturanAdmin();
  const list = Array.isArray(config.ulasanList) ? config.ulasanList : [];
  const updated = list.map((u) => (u.id === id ? { ...u, status: statusBaru } : u));
  await simpanPengaturanAdmin({ ulasanList: updated });
  return true;
}

export async function hapusUlasanAdmin(id) {
  const supabase = buatClientServer();

  // 1. Hapus dari tabel `ulasan`
  try {
    const numId = Number(id);
    if (!isNaN(numId)) {
      await supabase.from("ulasan").delete().eq("id", numId);
    }
  } catch {}

  // 2. Hapus dari storage
  const config = await ambilPengaturanAdmin();
  const list = Array.isArray(config.ulasanList) ? config.ulasanList : [];
  const updated = list.filter((u) => u.id !== id);
  await simpanPengaturanAdmin({ ulasanList: updated });
  return true;
}
