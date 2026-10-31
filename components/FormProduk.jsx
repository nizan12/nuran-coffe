"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import { formatRupiah } from "@/lib/format";
import { buatDeskripsiAI } from "@/app/admin/actions";
import EditorGaleriFoto from "@/components/admin/EditorGaleriFoto";
import EditorVarian from "@/components/admin/EditorVarian";
import PratinjauKartuProduk from "@/components/admin/PratinjauKartuProduk";

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
  const [manualText, setManualText] = useState(daftarFoto.join(", "));

  const [loadingAI, setLoadingAI] = useState(false);
  const [pesanAI, setPesanAI] = useState(null);

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
    <form
      action={formAction}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full"
    >
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
          {(state?.errors?.nama || state?.fieldErrors?.nama) && (
            <p className="text-xs text-red-500 font-medium -mt-2">
              {state?.errors?.nama || state?.fieldErrors?.nama}
            </p>
          )}

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
              {(state?.errors?.harga || state?.fieldErrors?.harga) && (
                <p className="text-xs text-red-500 font-medium">
                  {state?.errors?.harga || state?.fieldErrors?.harga}
                </p>
              )}
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
        <EditorVarian
          daftarVarian={daftarVarian}
          onTambahVarian={handleTambahVarian}
          onUbahVarian={handleUbahVarian}
          onHapusVarian={handleHapusVarian}
          onTemplateUkuran={handleTemplateUkuran}
          onTemplateSuhu={handleTemplateSuhu}
        />

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
          {(state?.errors?.deskripsi || state?.fieldErrors?.deskripsi) && (
            <p className="text-xs text-red-500 font-medium -mt-1">
              {state?.errors?.deskripsi || state?.fieldErrors?.deskripsi}
            </p>
          )}

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
        <EditorGaleriFoto
          daftarFoto={daftarFoto}
          setDaftarFoto={setDaftarFoto}
          manualText={manualText}
          setManualText={setManualText}
        />

        {/* KARTU 6: LIVE PREVIEW KARTU KATALOG */}
        <PratinjauKartuProduk
          nama={nama}
          harga={harga}
          hargaCoret={hargaCoret}
          diskonPersen={diskonPersen}
          stok={stok}
          kategori={kategori}
          deskripsi={deskripsi}
          daftarFoto={daftarFoto}
        />

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
              disabled={pending}
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
