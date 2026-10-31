"use client";

import { useState, useEffect, useActionState } from "react";
import { kirimUlasanAction } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";

function RenderBintang({ nilai, interaktif = false, onChange = null }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interaktif ? "button" : undefined}
          onClick={interaktif ? () => onChange && onChange(star) : undefined}
          disabled={!interaktif}
          className={`${interaktif ? "cursor-pointer transition hover:scale-125" : "cursor-default"}`}
          title={`${star} Bintang`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 ${
              star <= nilai ? "text-amber-400" : "text-gray-300 dark:text-gray-700"
            }`}
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function BagianUlasan({ produkId, ulasanAwal = [] }) {
  const [daftarUlasan, setDaftarUlasan] = useState(ulasanAwal);
  const [ratingInput, setRatingInput] = useState(5);
  const [bukaForm, setBukaForm] = useState(false);

  const [state, formAction, pending] = useActionState(async (prev, formData) => {
    const res = await kirimUlasanAction(prev, formData);
    if (res?.sukses) {
      const nama = formData.get("nama")?.trim();
      const rating = parseInt(formData.get("rating") || "5", 10);
      const komentar = formData.get("komentar")?.trim();
      const ulasanBaru = {
        id: Date.now().toString(),
        produkId,
        nama: nama || "Pelanggan",
        rating,
        komentar,
        status: "disetujui",
        tanggal: new Date().toISOString(),
      };
      setDaftarUlasan((prevList) => [ulasanBaru, ...prevList]);
      setBukaForm(false);
    }
    return res;
  }, null);

  useEffect(() => {
    setDaftarUlasan(ulasanAwal);
  }, [ulasanAwal]);

  const total = daftarUlasan.length;
  const rataRata =
    total > 0
      ? (daftarUlasan.reduce((sum, u) => sum + (Number(u.rating) || 5), 0) / total).toFixed(1)
      : "5.0";

  return (
    <section aria-labelledby="judul-ulasan" className="mt-12 border-t border-garis pt-8">
      {/* Header Ulasan */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="judul-ulasan" className="text-xl font-bold text-teks">
            Ulasan & Penilaian Pelanggan
          </h2>
          <div className="mt-1.5 flex items-center gap-2.5">
            <RenderBintang nilai={Math.round(Number(rataRata))} />
            <span className="text-sm font-extrabold text-teks">{rataRata}</span>
            <span className="text-xs text-teks-lembut">({total} ulasan)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setBukaForm(!bukaForm)}
          className="rounded-xl border border-garis bg-permukaan px-4 py-2 text-xs font-bold text-teks transition hover:border-utama hover:text-utama cursor-pointer"
        >
          {bukaForm ? "Tutup Form Ulasan" : "+ Tulis Ulasan Kamu"}
        </button>
      </div>

      {/* Banner Notifikasi Sukses dengan Kontras Tinggi */}
      {state?.sukses && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-800 text-white dark:bg-emerald-700 p-3.5 text-xs font-bold shadow-sm animate-in fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          <span>{state.sukses}</span>
        </div>
      )}

      {/* Form Tambah Ulasan */}
      {bukaForm && (
        <form
          action={formAction}
          className="mt-6 rounded-2xl border border-garis bg-permukaan p-5 sm:p-6 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-teks mb-3">Bagikan Pengalaman Rasamu</h3>

          {state?.error && (
            <div className="mb-3 rounded-xl border border-red-300 bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 p-3 text-xs font-bold">
              {state.error}
            </div>
          )}

          <input type="hidden" name="produkId" value={produkId} />
          <input type="hidden" name="rating" value={ratingInput} />

          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-teks mb-1">
                Pilih Rating Bintang:
              </label>
              <RenderBintang nilai={ratingInput} interaktif onChange={setRatingInput} />
            </div>

            <div>
              <label htmlFor="nama-pengulas" className="block text-xs font-semibold text-teks mb-1">
                Nama Lengkap / Panggilan:
              </label>
              <input
                id="nama-pengulas"
                type="text"
                name="nama"
                placeholder="Contoh: Rian"
                required
                className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="komentar-pengulas" className="block text-xs font-semibold text-teks mb-1">
                Ulasan / Komentar:
              </label>
              <textarea
                id="komentar-pengulas"
                name="komentar"
                rows={3}
                placeholder="Ceritakan rasa, aroma, atau kesegaran kopi ini…"
                required
                className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
              />
            </div>

            <div className="pt-1">
              <Tombol type="submit" disabled={pending} className="py-2 px-4 text-xs font-bold">
                {pending ? "Mengirimkan…" : "Kirim Ulasan"}
              </Tombol>
            </div>
          </div>
        </form>
      )}

      {/* List Ulasan Tersedia */}
      <div className="mt-6 flex flex-col gap-3">
        {total === 0 ? (
          <p className="py-6 text-center text-xs text-teks-lembut">
            Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
          </p>
        ) : (
          daftarUlasan.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-2 rounded-2xl border border-garis bg-permukaan p-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-utama/10 text-[11px] font-extrabold text-utama">
                    {u.nama?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teks">{u.nama}</p>
                    <RenderBintang nilai={Number(u.rating) || 5} />
                  </div>
                </div>
                <span className="text-[10px] text-teks-lembut">
                  {new Date(u.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-teks-lembut leading-relaxed mt-1">{u.komentar}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
