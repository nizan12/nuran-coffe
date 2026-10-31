"use client";

import { useState, useActionState, useRef } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import { buatDeskripsiAI, unggahFotoLangsung } from "@/app/admin/actions";

export default function FormProduk({
  produk = {},
  varianAwal = [],
  kategoriList = [],
  labelTombol = "Simpan Produk",
  action,
}) {
  const [state, formAction, pending] = useActionState(action, null);

  // Data Dasar
  const [nama, setNama] = useState(produk.nama || "");
  const [harga, setHarga] = useState(produk.harga || "");
  const initialDiskon =
    produk.diskon_persen ||
    (produk.harga_coret && Number(produk.harga_coret) > Number(produk.harga)
      ? Math.round((1 - Number(produk.harga) / Number(produk.harga_coret)) * 100)
      : "");
  const [diskonPersen, setDiskonPersen] = useState(initialDiskon);
  const [hargaCoret, setHargaCoret] = useState(produk.harga_coret || "");
  const [stok, setStok] = useState(
    produk.stok !== undefined && produk.stok !== null ? produk.stok : 10
  );
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");

  // Manajemen Varian Produk (US-12 & US-48)
  const [daftarVarian, setDaftarVarian] = useState(
    Array.isArray(varianAwal) && varianAwal.length > 0
      ? varianAwal.map((v) => ({
          id: v.id || Math.random(),
          nama: v.nama || "",
          harga_tambahan: v.harga_tambahan || 0,
          stok: v.stok !== null && v.stok !== undefined ? v.stok : "",
        }))
      : []
  );

  function handleTambahVarian() {
    setDaftarVarian((prev) => [
      ...prev,
      { id: Date.now(), nama: "", harga_tambahan: 0, stok: "" },
    ]);
  }

  function handleUbahVarian(index, field, value) {
    setDaftarVarian((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function handleHapusVarian(index) {
    setDaftarVarian((prev) => prev.filter((_, i) => i !== index));
  }

  function handleTemplateUkuran() {
    setDaftarVarian([
      { id: Date.now(), nama: "Regular", harga_tambahan: 0, stok: "" },
      { id: Date.now() + 1, nama: "Large", harga_tambahan: 4000, stok: "" },
    ]);
  }

  function handleTemplateSuhu() {
    setDaftarVarian([
      { id: Date.now(), nama: "Dingin (Iced)", harga_tambahan: 0, stok: "" },
      { id: Date.now() + 1, nama: "Panas (Hot)", harga_tambahan: 0, stok: "" },
    ]);
  }

  // Manajemen Galeri Foto Produk (Multi-image)
  const initialPhotos = (produk.image || produk.foto_url || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const [daftarFoto, setDaftarFoto] = useState(initialPhotos);
  const [inputUrl, setInputUrl] = useState("");
  const [errorUrl, setErrorUrl] = useState(null);

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [pesanUpload, setPesanUpload] = useState(null);
  const fileInputRef = useRef(null);

  const [modeManual, setModeManual] = useState(false);
  const [manualText, setManualText] = useState(daftarFoto.join(", "));

  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

  // Tambah URL gambar ke daftar
  function handleTambahUrl() {
    setErrorUrl(null);
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorUrl("Masukkan tautan URL foto terlebih dahulu.");
      return;
    }

    const urls = trimmed
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);

    const validUrls = urls.filter(
      (u) =>
        u.startsWith("http://") ||
        u.startsWith("https://") ||
        u.startsWith("/")
    );

    if (validUrls.length === 0) {
      setErrorUrl("URL harus dimulai dengan http://, https://, atau /");
      return;
    }

    setDaftarFoto((prev) => {
      const updated = [...prev, ...validUrls];
      setManualText(updated.join(", "));
      return updated;
    });
    setInputUrl("");
  }

  // Terapkan perubahan manual dari textarea
  function handleTerapkanManual() {
    const urls = manualText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setDaftarFoto(urls);
    setModeManual(false);
  }

  // Upload file gambar lokal
  async function handleUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPesanUpload(null);

    if (file.size > 4.5 * 1024 * 1024) {
      setPesanUpload({ error: "Ukuran foto terlalu besar. Maksimal 4.5 MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const tipeValid = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!tipeValid.includes(file.type)) {
      setPesanUpload({
        error: "Format file harus JPG, PNG, WEBP, atau GIF.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLoadingUpload(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await unggahFotoLangsung(formData);
      if (res?.error) {
        setPesanUpload({ error: res.error });
      } else if (res?.url) {
        setDaftarFoto((prev) => {
          const updated = [...prev, res.url];
          setManualText(updated.join(", "));
          return updated;
        });
        setPesanUpload({ sukses: "Foto berhasil diunggah ke storage." });
      }
    } catch (err) {
      setPesanUpload({ error: "Gagal mengunggah foto: " + err.message });
    } finally {
      setLoadingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Hapus foto
  function handleHapusFoto(index) {
    setDaftarFoto((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setManualText(updated.join(", "));
      return updated;
    });
  }

  // Jadikan foto index ini sebagai foto utama (posisi pertama)
  function handleJadikanUtama(index) {
    if (index === 0) return;
    setDaftarFoto((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      const updated = [item, ...copy];
      setManualText(updated.join(", "));
      return updated;
    });
  }

  // Geser urutan foto
  function handleGeserUrutan(index, arah) {
    const target = index + arah;
    if (target < 0 || target >= daftarFoto.length) return;
    setDaftarFoto((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      setManualText(copy.join(", "));
      return copy;
    });
  }

  // Integrasi Generator Deskripsi AI (Gemini)
  async function handleBuatDeskripsiAI() {
    if (!nama.trim()) {
      setPesanAI({ error: "Tuliskan nama produk terlebih dahulu." });
      return;
    }
    setLoadingAI(true);
    setPesanAI(null);
    try {
      const hasil = await buatDeskripsiAI({ nama, kategori });
      if (hasil?.error) {
        setPesanAI({ error: hasil.error });
      } else if (hasil?.deskripsi) {
        setDeskripsi(hasil.deskripsi);
        setPesanAI({ sukses: "Deskripsi berhasil dibuat otomatis oleh AI!" });
      }
    } catch (err) {
      setPesanAI({ error: "Gagal membuat deskripsi AI: " + err.message });
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}
      {/* Hidden input yang memuat seluruh foto terupdate */}
      <input type="hidden" name="foto_url" value={daftarFoto.join(", ")} />
      {/* Hidden input untuk varian JSON */}
      <input type="hidden" name="varian_json" value={JSON.stringify(daftarVarian)} />

      {/* ==================================================================== */}
      {/* KOLOM KIRI (UTAMA): INFORMASI MENU, HARGA, STOK & VARIAN             */}
      {/* ==================================================================== */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* KARTU 1: INFORMASI DASAR PRODUK */}
        <div className="rounded-3xl border border-garis bg-latar p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-garis/60 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-utama/10 text-utama">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-teks">Informasi Menu</h2>
              <p className="text-xs text-teks-lembut">Nama lengkap dan pengelompokan kategori menu.</p>
            </div>
          </div>

          <Input
            label="Nama Menu / Produk"
            name="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Es Kopi Susu Gula Aren"
            required
          />

          {/* Pemilih Kategori Menu dengan Quick Chips & Datalist */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-teks">
              Kategori Menu
            </label>
            <div className="relative">
              <input
                list="daftar-kategori-tersedia"
                name="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Pilih dari daftar atau ketik kategori baru..."
                className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none focus:ring-1 focus:ring-utama transition"
                required
              />
              <datalist id="daftar-kategori-tersedia">
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.nama} />
                ))}
              </datalist>
            </div>

            {kategoriList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-teks-lembut font-medium">Pilih cepat:</span>
                {kategoriList.map((kat) => (
                  <button
                    key={kat.id}
                    type="button"
                    onClick={() => setKategori(kat.nama)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      kategori === kat.nama
                        ? "bg-utama text-white shadow-2xs font-bold"
                        : "border border-garis bg-permukaan text-teks-lembut hover:border-utama hover:text-teks"
                    }`}
                  >
                    {kat.nama}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KARTU 2: PENETAPAN HARGA, DISKON & STOK */}
        <div className="rounded-3xl border border-garis bg-latar p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-garis/60 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-utama/10 text-utama">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-teks">Harga, Promo & Ketersediaan</h2>
              <p className="text-xs text-teks-lembut">Tentukan nominal harga jual, diskon coret, dan stok ketersediaan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teks flex items-center justify-between h-5">
                <span>Harga Jual (Rp)</span>
              </label>
              <input
                type="number"
                name="harga"
                min="100"
                value={harga}
                onChange={(e) => {
                  const h = e.target.value;
                  setHarga(h);
                  if (diskonPersen && h) {
                    setHargaCoret(Math.round(Number(h) / (1 - Number(diskonPersen) / 100)));
                  }
                }}
                placeholder="Contoh: 25000"
                required
                className="w-full h-11 rounded-xl border border-garis bg-latar px-3.5 text-sm text-teks focus:border-utama focus:outline-none"
              />
              <div className="text-[11px] text-teks-lembut min-h-[16px] truncate">
                {harga && Number(harga) > 0 ? (
                  <span>Harga tayang: <strong className="text-teks font-semibold">Rp {Number(harga).toLocaleString("id-ID")}</strong></span>
                ) : (
                  <span>Nominal harga jual</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teks flex items-center justify-between h-5">
                <span>Diskon Promo (%)</span>
                {diskonPersen && Number(diskonPersen) > 0 ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded-full">
                    Aktif
                  </span>
                ) : null}
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  name="diskon_persen"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={diskonPersen}
                  onChange={(e) => {
                    const disc = e.target.value;
                    setDiskonPersen(disc);
                    if (disc && Number(disc) > 0 && harga) {
                      setHargaCoret(Math.round(Number(harga) / (1 - Number(disc) / 100)));
                    } else {
                      setHargaCoret("");
                    }
                  }}
                  className="w-full h-11 rounded-xl border border-garis bg-latar pl-3.5 pr-8 text-sm text-teks focus:border-utama focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 text-xs font-bold text-teks-lembut">%</span>
              </div>
              <div className="text-[11px] min-h-[16px] flex items-center gap-1.5">
                {hargaCoret && Number(hargaCoret) > Number(harga) ? (
                  <span className="text-teks-lembut">
                    Coret: <span className="line-through font-semibold text-red-500">Rp {Number(hargaCoret).toLocaleString("id-ID")}</span>
                  </span>
                ) : (
                  <span className="text-teks-lembut/60">Isi 0 jika tanpa promo</span>
                )}
              </div>
              <input type="hidden" name="harga_coret" value={hargaCoret || ""} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-teks flex items-center justify-between h-5">
                <span>Jumlah Stok</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                    Number(stok) <= 0
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                  }`}
                >
                  {Number(stok) <= 0 ? "Habis" : "Ready"}
                </span>
              </label>
              <input
                type="number"
                name="stok"
                min="0"
                value={stok}
                onChange={(e) => setStok(e.target.value)}
                placeholder="10"
                className="w-full h-11 rounded-xl border border-garis bg-latar px-3.5 text-sm text-teks focus:border-utama focus:outline-none"
                required
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-teks-lembut font-semibold mr-0.5">Tambah cepat:</span>
                {[5, 10, 20, 50].map((tambah) => (
                  <button
                    key={tambah}
                    type="button"
                    onClick={() => setStok((prev) => Math.max(0, (Number(prev) || 0) + tambah))}
                    className="rounded-lg border border-garis bg-permukaan px-2 py-0.5 text-[10px] font-bold text-teks hover:border-utama hover:text-utama hover:bg-utama/10 transition active:scale-95 cursor-pointer"
                    title={`Tambah ${tambah} ke stok saat ini`}
                  >
                    +{tambah}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-teks-lembut min-h-[16px]">
                {Number(stok) > 0 ? (
                  <span>{stok} porsi / item siap saji</span>
                ) : (
                  <span className="text-red-500 font-medium">Stok habis</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 3: PILIHAN VARIAN MENU (US-12 & US-48) */}
        <div className="rounded-3xl border border-garis bg-latar p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-garis/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-teks flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-utama">
                  <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 1 4 2.5h12A1.5 1.5 0 0 1 17.5 4v1.5a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75V4ZM3 8a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 8Zm.75 3.25a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Zm0 4a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z" clipRule="evenodd" />
                </svg>
                <span>Pilihan Varian Produk ({daftarVarian.length})</span>
              </h2>
              <p className="text-xs text-teks-lembut mt-0.5">
                Tambahkan pilihan opsi seperti Ukuran, Suhu, Rasa, atau Berat Kemasan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleTemplateUkuran}
                className="rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-[11px] font-semibold text-teks-lembut hover:border-utama hover:text-utama transition"
                title="Isi otomatis Regular & Large"
              >
                + Template Ukuran
              </button>
              <button
                type="button"
                onClick={handleTemplateSuhu}
                className="rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-[11px] font-semibold text-teks-lembut hover:border-utama hover:text-utama transition"
                title="Isi otomatis Dingin & Panas"
              >
                + Template Suhu
              </button>
              <button
                type="button"
                onClick={handleTambahVarian}
                className="inline-flex items-center gap-1 rounded-lg bg-utama px-3 py-1 text-xs font-bold text-white hover:bg-utama-gelap transition shadow-2xs"
              >
                <span>+ Tambah Varian</span>
              </button>
            </div>
          </div>

          {daftarVarian.length === 0 ? (
            <div className="py-6 text-center text-xs text-teks-lembut border border-dashed border-garis rounded-2xl bg-permukaan/30">
              Belum ada varian khusus. Menu ini akan menggunakan harga & stok standar di atas.
            </div>
          ) : (
            <div className="space-y-2.5">
              {daftarVarian.map((v, idx) => (
                <div
                  key={v.id || idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-2xl border border-garis bg-permukaan/40 p-3 shadow-2xs"
                >
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-teks mb-1">
                      Nama Varian:
                    </label>
                    <input
                      type="text"
                      value={v.nama}
                      onChange={(e) => handleUbahVarian(idx, "nama", e.target.value)}
                      placeholder="Contoh: Large / Panas / 250g"
                      className="w-full rounded-xl border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                      required
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="block text-[11px] font-semibold text-teks mb-1">
                      Harga Tambahan (Rp):
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={v.harga_tambahan}
                      onChange={(e) => handleUbahVarian(idx, "harga_tambahan", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                    />
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[11px] font-semibold text-teks mb-1" title="Kosongkan jika mengikuti stok produk induk">
                      Stok Khusus:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={v.stok ?? ""}
                      onChange={(e) => handleUbahVarian(idx, "stok", e.target.value)}
                      placeholder="Ikut induk"
                      className="w-full rounded-xl border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                    />
                  </div>

                  <div className="sm:self-end pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleHapusVarian(idx)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-garis bg-latar text-teks-lembut hover:border-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer active:scale-95 shadow-2xs"
                      title="Hapus varian ini"
                      aria-label="Hapus varian ini"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.75"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KARTU 4: DESKRIPSI PRODUK (DENGAN ASISTEN AI) */}
        <div className="rounded-3xl border border-garis bg-latar p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-garis/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-teks">Deskripsi Produk</h2>
              <p className="text-xs text-teks-lembut">Jelaskan cita rasa, aroma, atau metode seduh menu ini.</p>
            </div>

            {/* Tombol Buat Deskripsi AI */}
            <button
              type="button"
              onClick={handleBuatDeskripsiAI}
              disabled={loadingAI}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-garis bg-permukaan px-3 py-1.5 text-xs font-semibold text-utama transition hover:border-utama hover:bg-utama hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAI ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Sedang membuat…</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a8.03 8.03 0 0 1-6.19 6.19l-1.192.24a1 1 0 0 0 0 1.96l1.192.24a8.03 8.03 0 0 1 6.19 6.19l.24 1.192a1 1 0 0 0 1.96 0l.24-1.192a8.03 8.03 0 0 1 6.19-6.19l1.192-.24a1 1 0 0 0 0-1.96l-1.192-.24a8.03 8.03 0 0 1-6.19-6.19l-.24-1.192Z" />
                  </svg>
                  <span>Buat dengan AI</span>
                </>
              )}
            </button>
          </div>

          <textarea
            name="deskripsi"
            rows={4}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tuliskan cerita menarik tentang menu kopi ini atau gunakan tombol 'Buat dengan AI' di atas..."
            className="w-full rounded-2xl border border-garis bg-latar p-3.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between text-[11px] text-teks-lembut">
            <span>Maksimal 1000 karakter</span>
            <span>{deskripsi.length}/1000</span>
          </div>

          {pesanAI?.error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-600 dark:text-red-400 font-medium animate-in fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-red-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{pesanAI.error}</span>
            </div>
          )}
          {pesanAI?.sukses && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium animate-in fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <span>{pesanAI.sukses}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* KOLOM KANAN (SIDEBAR): FOTO MEDIA, LIVE PREVIEW & AKSI SIMPAN        */}
      {/* ==================================================================== */}
      <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-6">
        {/* KARTU 5: FOTO & GALERI PRODUK */}
        <div className="rounded-3xl border border-garis bg-latar p-5 shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-garis/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-teks flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-utama">
                  <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909a.75.75 0 0 1-1.06 0l-4.22-4.219a.75.75 0 0 0-1.06 0L2.5 11.06ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
                </svg>
                <span>Foto Produk ({daftarFoto.length})</span>
              </h2>
              <p className="text-xs text-teks-lembut">Foto urutan pertama akan menjadi foto sampul utama.</p>
            </div>
            <button
              type="button"
              onClick={() => setModeManual(!modeManual)}
              className="text-[11px] font-medium text-teks-lembut hover:text-utama transition"
            >
              {modeManual ? "Tutup Text URL" : "Edit URL"}
            </button>
          </div>

          {/* Mode Manual Edit Text URL */}
          {modeManual && (
            <div className="rounded-2xl border border-garis bg-permukaan/60 p-3 flex flex-col gap-2">
              <span className="text-[11px] text-teks-lembut font-medium">
                Pisahkan dengan koma jika lebih dari satu:
              </span>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-garis bg-latar p-2 text-xs font-mono text-teks focus:border-utama focus:outline-none"
                placeholder="https://contoh.com/foto1.jpg, https://contoh.com/foto2.jpg"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleTerapkanManual}
                  className="rounded-lg bg-utama px-3 py-1 text-xs font-semibold text-white hover:bg-utama-gelap transition"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}

          {/* Grid Preview Foto Tersedia */}
          {daftarFoto.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5">
              {daftarFoto.map((foto, idx) => (
                <div
                  key={idx}
                  className={`group relative aspect-square overflow-hidden rounded-xl border ${
                    idx === 0
                      ? "border-utama ring-2 ring-utama/20"
                      : "border-garis"
                  } bg-permukaan`}
                >
                  <img
                    src={foto}
                    alt={`Foto ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/placeholder.svg";
                    }}
                    className="h-full w-full object-cover"
                  />

                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded bg-utama px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-2xs">
                      UTAMA
                    </span>
                  )}

                  {/* Overlay Tombol Aksi Foto */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleJadikanUtama(idx)}
                        title="Jadikan Foto Utama"
                        className="rounded bg-white/90 p-1 text-[10px] font-bold text-teks hover:bg-white"
                      >
                        ⭐
                      </button>
                    )}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleGeserUrutan(idx, -1)}
                        title="Geser Kiri"
                        className="rounded bg-white/90 p-1 text-xs text-teks hover:bg-white"
                      >
                        ◀
                      </button>
                    )}
                    {idx < daftarFoto.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleGeserUrutan(idx, 1)}
                        title="Geser Kanan"
                        className="rounded bg-white/90 p-1 text-xs text-teks hover:bg-white"
                      >
                        ▶
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleHapusFoto(idx)}
                      title="Hapus Foto"
                      className="rounded bg-red-600 p-1 text-white hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0v-7a.75.75 0 0 1 .75-.75Zm3.59.75a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan/30 py-6 px-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-teks-lembut mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-xs font-semibold text-teks">Belum ada foto</p>
              <p className="text-[11px] text-teks-lembut">Unggah foto menu di bawah ini.</p>
            </div>
          )}

          {/* Opsi Upload & Tambah URL */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-garis/60">
            <div>
              <span className="text-xs font-semibold text-teks block mb-1">
                Upload Gambar Baru (Maks. 4.5 MB):
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={loadingUpload}
                onChange={handleUploadFile}
                className="w-full text-xs text-teks-lembut file:mr-2.5 file:rounded-xl file:border-0 file:bg-utama file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white file:cursor-pointer hover:file:bg-utama-gelap cursor-pointer disabled:opacity-50"
              />
              {loadingUpload && (
                <p className="text-xs text-utama font-medium mt-1 animate-pulse">
                  Sedang mengunggah file ke Supabase storage...
                </p>
              )}
              {pesanUpload?.error && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  {pesanUpload.error}
                </p>
              )}
              {pesanUpload?.sukses && (
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  {pesanUpload.sukses}
                </p>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-teks block mb-1">
                Atau Tempel URL Gambar:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://contoh.com/foto.jpg"
                  className="flex-1 rounded-xl border border-garis bg-latar px-3 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTambahUrl}
                  className="rounded-xl border border-garis bg-permukaan px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition"
                >
                  + Tambah
                </button>
              </div>
              {errorUrl && <p className="text-xs text-red-500 font-medium mt-1">{errorUrl}</p>}
            </div>
          </div>
        </div>

        {/* KARTU 6: LIVE PREVIEW KARTU KATALOG */}
        <div className="rounded-3xl border border-garis bg-permukaan/40 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-garis pb-2">
            <span className="text-xs font-bold text-teks flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-utama">
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
              </svg>
              <span>Pratinjau di Katalog Pembeli</span>
            </span>
            <span className="text-[10px] text-teks-lembut bg-latar border border-garis rounded-md px-1.5 py-0.5 font-medium">
              Live Preview
            </span>
          </div>

          <div className="mx-auto max-w-[260px] overflow-hidden rounded-2xl border border-garis bg-latar shadow-sm">
            <div className="relative aspect-square w-full overflow-hidden bg-permukaan">
              <img
                src={daftarFoto[0] || "/images/placeholder.svg"}
                alt={nama || "Pratinjau"}
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.svg";
                }}
                className="h-full w-full object-cover"
              />
              {diskonPersen && Number(diskonPersen) > 0 ? (
                <span className="absolute left-2.5 top-2.5 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  Hemat {diskonPersen}%
                </span>
              ) : null}
              <span
                className={`absolute right-2.5 top-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-xs ${
                  Number(stok) <= 0 ? "bg-red-600/90" : "bg-emerald-600/85"
                }`}
              >
                {Number(stok) <= 0 ? "Stok Habis" : "Tersedia"}
              </span>
            </div>

            <div className="p-3">
              <p className="text-[11px] font-medium text-teks-lembut truncate">{kategori || "Kategori Menu"}</p>
              <h4 className="font-bold text-sm text-teks truncate mt-0.5">
                {nama || "Nama Menu Kopi"}
              </h4>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-extrabold text-harga">
                  {harga ? formatRupiah(Number(harga)) : "Rp 0"}
                </span>
                {hargaCoret && Number(hargaCoret) > Number(harga) && (
                  <span className="text-xs text-teks-lembut line-through">
                    {formatRupiah(Number(hargaCoret))}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-teks-lembut line-clamp-2 mt-1.5">
                {deskripsi || "Deskripsi aroma & rasa kopi Anda akan tampil di sini..."}
              </p>
            </div>
          </div>
        </div>

        {/* KARTU 7: PANEL AKSI SUBMIT / SIMPAN */}
        <div className="rounded-3xl border border-garis bg-latar p-5 shadow-sm flex flex-col gap-3">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs font-semibold text-red-600 dark:text-red-400 animate-in fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5 text-red-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={pending || loadingUpload}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-utama py-3.5 px-4 text-sm font-bold text-white shadow-md transition hover:bg-utama-gelap hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {pending ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Menyimpan ke Database…</span>
                </>
              ) : (
                <span>{labelTombol}</span>
              )}
            </button>

            <Link
              href="/admin"
              className="w-full inline-flex items-center justify-center rounded-2xl border border-garis bg-permukaan py-2.5 px-4 text-xs font-semibold text-teks hover:border-utama hover:text-utama transition"
            >
              Batal & Kembali
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
