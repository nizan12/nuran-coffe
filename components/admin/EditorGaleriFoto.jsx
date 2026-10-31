"use client";

/**
 * Sub-komponen FormProduk: Editor Galeri Foto Produk
 * Mengelola daftar foto (tambah URL, upload, hapus, susun ulang, jadikan utama)
 */
import { useState, useRef } from "react";
import { unggahFotoLangsung } from "@/app/admin/actions";

export default function EditorGaleriFoto({
  daftarFoto,
  setDaftarFoto,
  manualText,
  setManualText,
}) {
  const [inputUrl, setInputUrl] = useState("");
  const [errorUrl, setErrorUrl] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [pesanUpload, setPesanUpload] = useState(null);
  const fileInputRef = useRef(null);
  const [modeManual, setModeManual] = useState(false);

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

  return (
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
            name="file_gambar"
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
  );
}
