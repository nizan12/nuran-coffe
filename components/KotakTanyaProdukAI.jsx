"use client";

import { useState } from "react";

export default function KotakTanyaProdukAI({ produk }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState("");

  const saranTanya = [
    `Rasa & aroma ${produk?.nama} seperti apa?`,
    `Cocok dipasangkan dengan makanan apa?`,
    `Apakah ${produk?.nama} manis atau pahit?`,
  ];

  async function handleKirim(teksTanya) {
    const q = (teksTanya || pertanyaan).trim();
    if (!q || memuat) return;

    setMemuat(true);
    setError("");
    setJawaban("");

    try {
      const promptLengkap = `Pertanyaan pengunjung tentang menu "${produk.nama}": ${q}`;
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: promptLengkap }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendapatkan respon dari AI.");
      }

      // Bersihkan tag rekomendasi jika ada
      const teksBersih = (data.jawaban || "").replace(/\[REKOMENDASI:.*?\]/g, "").trim();
      setJawaban(teksBersih);
      setPertanyaan("");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-utama/30 bg-permukaan/60 p-5 sm:p-6 shadow-xs backdrop-blur-xs">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-utama text-white text-base shadow-xs">
          ☕
        </span>
        <div>
          <h3 className="text-sm font-bold text-teks">
            Tanya Barista AI tentang {produk.nama}
          </h3>
          <p className="text-xs text-teks-lembut">
            Ingin tahu rasa, tingkat kemanisan, atau paduan camilan yang pas? Tanyakan di sini.
          </p>
        </div>
      </div>

      {/* Saran Pertanyaan Cepat */}
      <div className="mt-3.5 flex flex-wrap gap-2">
        {saranTanya.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPertanyaan(s);
              handleKirim(s);
            }}
            disabled={memuat}
            className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-[11px] font-semibold text-teks hover:border-utama hover:text-utama transition cursor-pointer disabled:opacity-50"
          >
            "{s}"
          </button>
        ))}
      </div>

      {/* Kotak Input Pertanyaan */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleKirim();
        }}
        className="mt-3.5 flex gap-2"
      >
        <input
          type="text"
          value={pertanyaan}
          onChange={(e) => setPertanyaan(e.target.value)}
          maxLength={300}
          placeholder={`Tanya apa saja seputar ${produk.nama}…`}
          disabled={memuat}
          className="flex-1 rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <button
          type="submit"
          disabled={memuat || !pertanyaan.trim()}
          className="rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition disabled:opacity-50 cursor-pointer"
        >
          {memuat ? "Menjawab…" : "Tanya AI"}
        </button>
      </form>

      {/* Pesan Error */}
      {error && (
        <p className="mt-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Jawaban AI Barista */}
      {jawaban && (
        <div className="mt-3.5 rounded-xl border border-utama/20 bg-utama/5 p-3.5 text-xs text-teks leading-relaxed animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-utama mb-1">
            <span>✨ Barista Virtual:</span>
          </div>
          <p className="whitespace-pre-line">{jawaban}</p>
        </div>
      )}
    </div>
  );
}
