"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import { tambahKeKeranjang } from "@/lib/keranjang";

const SUGGESTIONS = [
  "Makanan yang cocok sama kopi apa?",
  "Rekomendasi kopi manis dan creamy",
  "Menu kopi yang segar dingin",
  "Ada menu non-kopi apa saja?",
];

function KartuProdukChat({ produk }) {
  const [ditambahkan, setDitambahkan] = useState(false);

  function handleTambahKeranjang(e) {
    e.preventDefault();
    e.stopPropagation();
    tambahKeKeranjang(produk, 1);
    setDitambahkan(true);
    setTimeout(() => setDitambahkan(false), 1500);
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-garis bg-latar p-2 shadow-2xs hover:border-utama/40 transition">
      <Link
        href={`/produk/${produk.id}`}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-garis bg-permukaan"
      >
        <img
          src={ambilFotoUtama(produk)}
          alt={produk.nama}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.svg";
          }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/produk/${produk.id}`}
          className="block truncate text-xs font-bold text-teks hover:text-utama transition-colors"
          title={produk.nama}
        >
          {produk.nama}
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-medium text-teks-lembut truncate max-w-[80px]">
            {produk.kategori || "Menu"}
          </span>
          <span className="text-teks-lembut/40 text-[9px]">•</span>
          <span className="text-[11px] font-extrabold text-harga">
            {formatRupiah(produk.harga)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleTambahKeranjang}
        className={`shrink-0 inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition shadow-xs ${
          ditambahkan
            ? "bg-emerald-600 text-white"
            : "bg-utama text-white hover:bg-utama-gelap"
        }`}
        title="Tambahkan ke Keranjang Belanja"
      >
        {ditambahkan ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Masuk</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.358 4H18.25a.75.75 0 0 1 .737.896l-1.5 7.5A.75.75 0 0 1 16.75 13H6.467l-.28 1.401A1.75 1.75 0 0 1 4.47 16H3.25a.75.75 0 0 1 0-1.5h1.22a.25.25 0 0 0 .248-.2l1.62-8.1A.75.75 0 0 1 7.076 5.5H16.14l-1.2 6H6.67l-.89-4.453A.75.75 0 0 1 5.358 6.5l-.24-1.2L4.872 4H1.75A.75.75 0 0 1 1 1.75Z" />
              <path d="M6 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            </svg>
            <span>+ Keranjang</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function WidgetChatAI() {
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [riwayat, setRiwayat] = useState([
    {
      id: "intro",
      sender: "bot",
      text: "Halo! Saya Barista Virtual Narun Coffee. Sedang mencari kopi yang cocok atau camilan pendamping yang pas? Tanyakan saja di sini!",
      produkRekomendasi: [],
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (buka) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [riwayat, buka]);

  async function kirimPesan(teksKirim) {
    const teks = (teksKirim || pesan).trim();
    if (!teks || loading) return;

    setPesan("");
    const userMsg = { id: Date.now().toString(), sender: "user", text: teks };
    const nextRiwayat = [...riwayat, userMsg];
    setRiwayat(nextRiwayat);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: teks, riwayat: nextRiwayat }),
      });
      const data = await res.json();
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: data?.jawaban || "Maaf, terjadi kendala saat merespons. Silakan coba kembali.",
        produkRekomendasi: Array.isArray(data?.produkRekomendasi) ? data.produkRekomendasi : [],
      };
      setRiwayat((prev) => [...prev, botMsg]);
    } catch {
      setRiwayat((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Koneksi terputus. Pastikan perangkat Anda terhubung ke internet.",
          produkRekomendasi: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Tombol Floating Trigger Chat */}
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-utama text-white shadow-xl transition-all hover:bg-utama-gelap hover:scale-105"
        aria-label="Buka Chat Barista AI"
        title="Tanya Barista Virtual AI"
      >
        {buka ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm5.25-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm3.75 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Jendela Chat Interaktif */}
      {buka && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-40 flex h-[520px] max-h-[85vh] w-[calc(100vw-2rem)] max-w-sm sm:max-w-md flex-col rounded-3xl border border-garis bg-latar shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header Chat */}
          <div className="flex items-center justify-between border-b border-garis bg-permukaan px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-utama text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-teks">Barista Virtual AI</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">Aktif & Siap Membantu</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBuka(false)}
              className="rounded-lg p-1 text-teks-lembut hover:bg-latar hover:text-teks transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Area Pesan Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {riwayat.map((r) => {
              const isUser = r.sender === "user";
              return (
                <div
                  key={r.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? "bg-utama text-white rounded-br-xs font-medium"
                        : "bg-permukaan border border-garis text-teks rounded-bl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{r.text}</p>

                    {/* Kartu Rekomendasi Produk Langsung di Chat */}
                    {!isUser && r.produkRekomendasi && r.produkRekomendasi.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-garis/60 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-teks-lembut uppercase tracking-wider">
                          Pilihan Menu Rekomendasi:
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {r.produkRekomendasi.map((p) => (
                            <KartuProdukChat key={p.id} produk={p} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl bg-permukaan border border-garis px-3.5 py-2.5 text-xs text-teks-lembut">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-utama" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-utama [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-utama [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">Barista sedang meracik saran menu…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Saran Cepat Pertanyaan */}
          <div className="border-t border-garis bg-permukaan/40 px-3 py-2 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => kirimPesan(s)}
                className="whitespace-nowrap rounded-lg border border-garis bg-latar px-2.5 py-1 text-[10px] font-medium text-teks-lembut hover:border-utama hover:text-utama transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Chat */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              kirimPesan();
            }}
            className="border-t border-garis bg-permukaan p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Tanya saran menu kopi & camilan di sini…"
              className="flex-1 rounded-xl border border-garis bg-latar px-3 py-2 text-xs text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <button
              type="submit"
              disabled={!pesan.trim() || loading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-utama text-white transition hover:bg-utama-gelap disabled:opacity-40"
              aria-label="Kirim Pesan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086L2.279 16.76a.75.75 0 0 0 .95.826l14.5-5.5a.75.75 0 0 0 0-1.4l-14.5-5.5Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
