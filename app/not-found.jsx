import Link from "next/link";
import Tombol from "@/components/Tombol";

export default function TidakDitemukan() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-utama/10 text-utama shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
          <path d="M19.5 6.75h-2.128A7.502 7.502 0 0 0 4.5 12c0 3.842 2.89 7.01 6.643 7.447A8.257 8.257 0 0 0 12 19.5c.34 0 .674-.02 1.002-.061A7.498 7.498 0 0 0 19.5 12v-.75H21a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-2.25-2.25h-1.5Zm0 3.75V8.25H21a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-1.5ZM3.75 21a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" />
        </svg>
      </div>

      <span className="mt-6 rounded-full border border-garis bg-permukaan px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teks-lembut">
        Error 404
      </span>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">
        Halaman Tidak Ditemukan
      </h1>

      <p className="mt-3 max-w-md text-base leading-relaxed text-teks-lembut">
        Sepertinya menu atau halaman yang kamu cari belum diseduh atau tautan sudah berpindah tempat.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Tombol href="/" varian="utama">
          Kembali ke Beranda Katalog
        </Tombol>
        <Tombol href="/tentang" varian="garis">
          Tentang & Kontak Toko
        </Tombol>
      </div>
    </div>
  );
}
