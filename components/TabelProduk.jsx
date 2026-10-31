"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah, ambilFotoUtama } from "@/lib/format";
import Tombol from "@/components/Tombol";
import {
  hapusProduk,
  toggleStatusProduk,
  simpanUrutanProduk,
  imporProdukCSV,
  tambahStokCepat,
} from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk, nonaktifIds = [] }) {
  const router = useRouter();
  const [cari, setCari] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [halaman, setHalaman] = useState(1);
  const [modalImpor, setModalImpor] = useState(false);
  const [animasiImpor, setAnimasiImpor] = useState(false);
  const [statusImpor, setStatusImpor] = useState(null);
  const [memproses, setMemproses] = useState(false);

  // State untuk Quick Restock Stok Produk
  const [modalRestock, setModalRestock] = useState(null);
  const [animasiRestock, setAnimasiRestock] = useState(false);
  const [jumlahRestock, setJumlahRestock] = useState(10);
  const [modeRestock, setModeRestock] = useState("tambah"); // "tambah" (+N) atau "setel" (=N)
  const [loadingRestock, setLoadingRestock] = useState(false);
  const [pesanRestock, setPesanRestock] = useState(null);
  const [localStokMap, setLocalStokMap] = useState({});

  // Kunci scroll halaman belakang saat modal impor atau restock terbuka & handle tombol Escape
  useEffect(() => {
    if (modalImpor || modalRestock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        if (modalRestock && !loadingRestock) handleTutupModalRestock();
        if (modalImpor && !memproses) handleTutupModalImpor();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalImpor, modalRestock, loadingRestock, memproses]);

  function handleBukaModalRestock(produk) {
    setModalRestock(produk);
    setJumlahRestock(10);
    setModeRestock("tambah");
    setPesanRestock(null);
    setAnimasiRestock(false);
    // Beri jeda render tick awal agar browser sempat menerapkan state awal sebelum transisi berjalan
    setTimeout(() => {
      setAnimasiRestock(true);
    }, 20);
  }

  function handleTutupModalRestock() {
    setAnimasiRestock(false);
    setTimeout(() => {
      setModalRestock(null);
      setPesanRestock(null);
    }, 260);
  }

  function handleBukaModalImpor() {
    setModalImpor(true);
    setStatusImpor(null);
    setAnimasiImpor(false);
    // Beri jeda render tick awal agar browser sempat menerapkan state awal sebelum transisi berjalan
    setTimeout(() => {
      setAnimasiImpor(true);
    }, 20);
  }

  function handleTutupModalImpor() {
    setAnimasiImpor(false);
    setTimeout(() => {
      setModalImpor(false);
      setStatusImpor(null);
    }, 260);
  }

  async function handleSimpanRestock(e) {
    e.preventDefault();
    if (!modalRestock) return;
    const jumlah = parseInt(jumlahRestock, 10);
    if (isNaN(jumlah) || jumlah < 0) {
      setPesanRestock({ error: "Jumlah stok harus berupa angka minimal 0." });
      return;
    }

    setLoadingRestock(true);
    setPesanRestock(null);

    const formData = new FormData();
    formData.append("id", modalRestock.id);
    formData.append("jumlah", jumlah);
    formData.append("mode", modeRestock);

    const res = await tambahStokCepat(formData);
    setLoadingRestock(false);

    if (res?.error) {
      setPesanRestock({ error: res.error });
    } else if (res?.sukses) {
      setPesanRestock({ sukses: `Stok berhasil diperbarui menjadi ${res.stokBaru} item!` });
      setLocalStokMap((prev) => ({ ...prev, [modalRestock.id]: res.stokBaru }));
      router.refresh();
      setTimeout(() => {
        handleTutupModalRestock();
      }, 1000);
    }
  }

  const ITEM_PER_PAGE = 8;

  // Filter pencarian dan kategori
  const terfilter = daftarProduk.filter((p) => {
    const matchCari =
      !cari ||
      p.nama.toLowerCase().includes(cari.toLowerCase()) ||
      (p.kategori && p.kategori.toLowerCase().includes(cari.toLowerCase()));
    const matchKategori = !kategoriFilter || p.kategori === kategoriFilter;
    return matchCari && matchKategori;
  });

  // Paginasi di admin (US-33)
  const totalHalaman = Math.ceil(terfilter.length / ITEM_PER_PAGE) || 1;
  const halamanAktif = Math.min(halaman, totalHalaman);
  const awal = (halamanAktif - 1) * ITEM_PER_PAGE;
  const produkTampil = terfilter.slice(awal, awal + ITEM_PER_PAGE);

  // Ambil daftar kategori unik
  const kategoriList = [
    ...new Set(daftarProduk.map((p) => p.kategori).filter(Boolean)),
  ].sort();

  // Geser urutan produk (US-47)
  async function geserUrutan(index, arah) {
    const targetIdx = index + arah;
    if (targetIdx < 0 || targetIdx >= daftarProduk.length) return;

    const copy = [...daftarProduk];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const urutanIds = copy.map((p) => p.id);
    await simpanUrutanProduk(urutanIds);
  }

  // Handle Impor CSV
  async function handleImpor(e) {
    e.preventDefault();
    setMemproses(true);
    setStatusImpor(null);
    const formData = new FormData(e.target);
    const res = await imporProdukCSV(null, formData);
    setMemproses(false);
    if (res?.error) {
      setStatusImpor({ error: res.error });
    } else if (res?.sukses) {
      setStatusImpor({ sukses: res.sukses });
      setTimeout(() => {
        handleTutupModalImpor();
      }, 1500);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: Cari, Filter, Ekspor, Impor */}
      <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Kolom Cari Produk (US-33) */}
          <input
            type="search"
            placeholder="Cari nama atau kategori…"
            value={cari}
            onChange={(e) => {
              setCari(e.target.value);
              setHalaman(1);
            }}
            className="w-full rounded-xl border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-60"
          />

          {/* Filter Kategori */}
          <select
            value={kategoriFilter}
            onChange={(e) => {
              setKategoriFilter(e.target.value);
              setHalaman(1);
            }}
            className="rounded-xl border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Ekspor CSV & Impor CSV (US-35 & US-46) */}
        <div className="flex items-center gap-2">
          <a
            href="/admin/ekspor-csv"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs font-bold text-teks transition hover:border-utama hover:text-utama shadow-xs"
            title="Unduh seluruh data produk ke file CSV"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Ekspor CSV</span>
          </a>

          <button
            type="button"
            onClick={handleBukaModalImpor}
            className="inline-flex items-center gap-1.5 rounded-xl border border-garis bg-latar px-3.5 py-2 text-xs font-bold text-teks transition hover:border-utama hover:text-utama shadow-xs cursor-pointer"
            title="Unggah berkas CSV untuk menambah banyak produk sekaligus"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span>Impor CSV</span>
          </button>
        </div>
      </div>

      {/* Tabel Data Produk (Fit 100% tanpa horizontal overflow) */}
      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="w-12 px-3 py-3 font-semibold text-center whitespace-nowrap">Urutan</th>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Harga</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Stok</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produkTampil.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-teks-lembut">
                  Tidak ada produk yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              produkTampil.map((produk, idx) => {
                const globalIdx = awal + idx;
                const isNonaktif = nonaktifIds.includes(produk.id);

                return (
                  <tr key={produk.id} className="border-t border-garis hover:bg-permukaan/40 transition">
                    {/* Urutan tampil (US-47) */}
                    <td className="w-12 px-3 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => geserUrutan(globalIdx, -1)}
                          disabled={globalIdx === 0}
                          className="rounded p-1 text-xs text-teks-lembut hover:bg-permukaan hover:text-teks disabled:opacity-30"
                          title="Geser ke Atas"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => geserUrutan(globalIdx, 1)}
                          disabled={globalIdx === daftarProduk.length - 1}
                          className="rounded p-1 text-xs text-teks-lembut hover:bg-permukaan hover:text-teks disabled:opacity-30"
                          title="Geser ke Bawah"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Info Produk & Kategori */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ambilFotoUtama(produk)}
                          alt=""
                          className="h-10 w-10 rounded-lg border border-garis object-cover bg-permukaan shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/images/placeholder.svg";
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-semibold block text-teks leading-tight truncate">
                            {produk.nama}
                          </span>
                          <span className="text-xs text-teks-lembut truncate block mt-0.5">
                            {produk.kategori || "Menu"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Harga */}
                    <td className="px-3 py-3 font-bold text-harga whitespace-nowrap">
                      {formatRupiah(produk.harga)}
                    </td>

                    {/* Stok & Tombol Restock Terpisah */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {(() => {
                        const currentStok = localStokMap[produk.id] ?? (produk.stok ?? 10);
                        const isHabis = currentStok <= 0;
                        const isKritis = currentStok > 0 && currentStok <= 5;

                        return (
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${
                                isHabis
                                  ? "bg-red-500/10 text-red-600 border-red-500/25"
                                  : isKritis
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  isHabis ? "bg-red-500" : isKritis ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                                }`}
                              />
                              <span>{isHabis ? "Habis (0)" : `${currentStok} item`}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleBukaModalRestock(produk)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-garis bg-permukaan text-teks hover:border-utama hover:text-utama hover:bg-utama/10 transition cursor-pointer active:scale-95 shadow-2xs"
                              title={`Restock / Tambah Stok "${produk.nama}"`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-utama">
                                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                              </svg>
                            </button>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Toggle Status Aktif / Nonaktif */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <form action={toggleStatusProduk}>
                        <input type="hidden" name="id" value={produk.id} />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer active:scale-95 shadow-2xs ${
                            isNonaktif
                              ? "border-garis bg-permukaan text-teks-lembut hover:border-teks-lembut hover:text-teks"
                              : "border-utama/30 bg-utama/10 text-utama hover:border-utama hover:bg-utama/20"
                          }`}
                          title="Klik untuk mengubah status tampil di katalog pengunjung"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              isNonaktif ? "bg-teks-lembut/60" : "bg-utama shadow-xs"
                            }`}
                          />
                          <span>{isNonaktif ? "Nonaktif" : "Aktif"}</span>
                        </button>
                      </form>
                    </td>

                    {/* Aksi Ubah & Hapus Pakai Icon (Hemat Space) */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/produk/${produk.id}/ubah`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-garis bg-permukaan text-teks-lembut hover:border-utama hover:text-utama hover:bg-utama/10 transition cursor-pointer active:scale-95 shadow-2xs"
                          title={`Ubah produk "${produk.nama}"`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                          </svg>
                        </Link>
                        <form
                          action={hapusProduk}
                          onSubmit={(e) => {
                            if (!confirm(`Yakin ingin menghapus produk "${produk.nama}"?`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={produk.id} />
                          <button
                            type="submit"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-garis bg-permukaan text-teks-lembut hover:border-red-500 hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer active:scale-95 shadow-2xs"
                            title={`Hapus produk "${produk.nama}"`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0v-7a.75.75 0 0 1 .75-.75Zm3.59.75a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0v-7Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginasi Tabel Admin (US-33) */}
      {totalHalaman > 1 && (
        <div className="flex items-center justify-between border-t border-garis pt-4 text-xs text-teks-lembut">
          <p>
            Menampilkan <span className="font-bold text-teks">{awal + 1}</span>–
            <span className="font-bold text-teks">
              {Math.min(awal + ITEM_PER_PAGE, terfilter.length)}
            </span>{" "}
            dari <span className="font-bold text-teks">{terfilter.length}</span> produk
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHalaman((h) => Math.max(1, h - 1))}
              disabled={halamanAktif <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:border-utama disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
              <span>Sebelumnya</span>
            </button>
            <span className="font-bold text-teks">
              Halaman {halamanAktif} dari {totalHalaman}
            </span>
            <button
              type="button"
              onClick={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
              disabled={halamanAktif >= totalHalaman}
              className="inline-flex items-center gap-1 rounded-lg border border-garis bg-latar px-3 py-1.5 font-semibold text-teks hover:border-utama disabled:opacity-40"
            >
              <span>Selanjutnya</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal Impor CSV (US-46) dengan animasi smooth buka & tutup */}
      {modalImpor && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleTutupModalImpor}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            animasiImpor
              ? "bg-black/60 backdrop-blur-xs opacity-100"
              : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`w-full max-w-lg rounded-3xl border border-garis bg-latar p-6 shadow-2xl transform transition-all duration-300 ease-out ${
              animasiImpor
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-3 pointer-events-none"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-garis pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-utama/10 text-utama">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.5V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-teks">Impor Produk dari CSV</h3>
              </div>
              <button
                type="button"
                onClick={handleTutupModalImpor}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-teks-lembut hover:bg-permukaan hover:text-teks transition cursor-pointer"
                aria-label="Tutup modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleImpor} className="mt-4 flex flex-col gap-4">
              <p className="text-xs text-teks-lembut leading-relaxed">
                Pilih file <strong>.csv</strong> yang berisi kolom:
                <br />
                <code className="mt-1 block rounded bg-permukaan p-2 text-[11px] font-mono text-teks">
                  ID,Nama Produk,Kategori,Harga,Deskripsi,Foto URL
                </code>
              </p>

              <div className="rounded-xl border-2 border-dashed border-garis p-6 text-center bg-permukaan/50">
                <input
                  type="file"
                  name="file_csv"
                  accept=".csv,text/csv"
                  required
                  className="w-full text-xs text-teks-lembut file:mr-3 file:rounded-lg file:border-0 file:bg-utama file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-utama-gelap"
                />
              </div>

              {statusImpor?.error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  {statusImpor.error}
                </div>
              )}

              {statusImpor?.sukses && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                  {statusImpor.sukses}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-garis">
                <button
                  type="button"
                  onClick={handleTutupModalImpor}
                  className="rounded-xl border border-garis px-4 py-2 text-xs font-semibold text-teks hover:bg-permukaan cursor-pointer"
                >
                  Batal
                </button>
                <Tombol type="submit" disabled={memproses}>
                  {memproses ? "Memproses…" : "Mulai Impor Produk"}
                </Tombol>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Restock Produk dengan animasi smooth */}
      {modalRestock && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            animasiRestock
              ? "bg-black/60 backdrop-blur-xs opacity-100"
              : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loadingRestock) {
              handleTutupModalRestock();
            }
          }}
        >
          <div
            className={`relative w-full max-w-md rounded-3xl border border-garis bg-latar p-6 shadow-2xl flex flex-col gap-4 transform transition-all duration-300 ease-out ${
              animasiRestock
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-3 pointer-events-none"
            }`}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-garis/70 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-utama/10 text-utama">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v6.5h6.5a.75.75 0 0 1 0 1.5h-6.5v6.5a.75.75 0 0 1-1.5 0v-6.5h-6.5a.75.75 0 0 1 0-1.5h6.5v-6.5A.75.75 0 0 1 10 2Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-teks">Restock Stok Produk</h3>
                  <p className="text-xs text-teks-lembut">Tambah atau sesuaikan stok fisik menu kedai</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTutupModalRestock}
                disabled={loadingRestock}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-teks-lembut hover:bg-permukaan hover:text-teks transition cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Info Produk & Stok Saat Ini */}
            <div className="flex items-center gap-3 rounded-2xl border border-garis/60 bg-permukaan/40 p-3.5">
              <img
                src={ambilFotoUtama(modalRestock)}
                alt=""
                className="h-12 w-12 rounded-xl border border-garis object-cover bg-latar shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.svg";
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-teks block truncate leading-tight">
                  {modalRestock.nama}
                </span>
                <span className="text-xs text-teks-lembut block mt-0.5">
                  {modalRestock.kategori || "Menu"} • {formatRupiah(modalRestock.harga)}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-teks-lembut uppercase font-semibold block">Stok Saat Ini</span>
                <span className="text-sm font-bold text-teks">
                  {localStokMap[modalRestock.id] ?? (modalRestock.stok ?? 10)} item
                </span>
              </div>
            </div>

            {/* Form Restock */}
            <form onSubmit={handleSimpanRestock} className="flex flex-col gap-4">
              {/* Pilihan Mode: Tambah vs Setel */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-permukaan p-1 border border-garis">
                <button
                  type="button"
                  onClick={() => setModeRestock("tambah")}
                  className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                    modeRestock === "tambah"
                      ? "bg-latar text-utama shadow-xs"
                      : "text-teks-lembut hover:text-teks"
                  }`}
                >
                  + Tambah Stok (Restock)
                </button>
                <button
                  type="button"
                  onClick={() => setModeRestock("setel")}
                  className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                    modeRestock === "setel"
                      ? "bg-latar text-utama shadow-xs"
                      : "text-teks-lembut hover:text-teks"
                  }`}
                >
                  = Setel Total Langsung
                </button>
              </div>

              {/* Preset Chips Cepat (Jika mode tambah) */}
              {modeRestock === "tambah" && (
                <div>
                  <span className="text-xs font-semibold text-teks block mb-1.5">Pilihan Jumlah Cepat:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[5, 10, 20, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setJumlahRestock(preset)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer border ${
                          jumlahRestock === preset
                            ? "border-utama bg-utama text-white shadow-xs"
                            : "border-garis bg-permukaan text-teks hover:border-utama hover:text-utama"
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Angka Custom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-teks">
                  {modeRestock === "tambah" ? "Jumlah yang Ingin Ditambahkan:" : "Total Stok Baru:"}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setJumlahRestock((prev) => Math.max(0, (Number(prev) || 0) - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-garis bg-permukaan text-base font-bold text-teks hover:border-utama hover:text-utama transition cursor-pointer shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={jumlahRestock}
                    onChange={(e) => setJumlahRestock(e.target.value)}
                    required
                    className="h-11 flex-1 rounded-xl border border-garis bg-latar px-3 text-center text-base font-bold text-teks focus:border-utama focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setJumlahRestock((prev) => (Number(prev) || 0) + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-garis bg-permukaan text-base font-bold text-teks hover:border-utama hover:text-utama transition cursor-pointer shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Preview Hasil Perhitungan Realtime */}
              <div className="rounded-2xl border border-garis/60 bg-permukaan/30 p-3 text-xs flex items-center justify-between">
                <span className="text-teks-lembut">Estimasi Stok Akhir:</span>
                <span className="font-bold text-sm text-teks">
                  {(() => {
                    const stokAwal = localStokMap[modalRestock.id] ?? (modalRestock.stok ?? 10);
                    const inputNum = parseInt(jumlahRestock, 10) || 0;
                    if (modeRestock === "tambah") {
                      return `${stokAwal} + ${inputNum} = ${stokAwal + inputNum} item`;
                    }
                    return `${inputNum} item`;
                  })()}
                </span>
              </div>

              {/* Pesan Feedback */}
              {pesanRestock?.error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-2.5 text-xs text-red-600 font-medium">
                  {pesanRestock.error}
                </div>
              )}
              {pesanRestock?.sukses && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-700 font-medium">
                  {pesanRestock.sukses}
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-garis">
                <button
                  type="button"
                  onClick={handleTutupModalRestock}
                  disabled={loadingRestock}
                  className="rounded-xl border border-garis px-4 py-2 text-xs font-semibold text-teks hover:bg-permukaan transition cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingRestock}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-utama-gelap transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {loadingRestock ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span>Menyimpan…</span>
                    </>
                  ) : (
                    <span>
                      {modeRestock === "tambah"
                        ? `Konfirmasi Tambah (+${jumlahRestock || 0})`
                        : `Simpan Stok Baru (${jumlahRestock || 0})`}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
