"use client";

import Link from "next/link";

export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-8 w-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold text-teks">Terjadi Kendala Teknis</h1>
      <p className="mt-2 max-w-md text-sm text-teks-lembut leading-relaxed">
        Mohon maaf, halaman ini sedang mengalami gangguan sementara. Silakan muat ulang atau kembali ke beranda.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-utama px-4 py-2 text-xs font-bold text-white hover:bg-utama-gelap transition"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-xl border border-garis bg-permukaan px-4 py-2 text-xs font-bold text-teks hover:border-utama hover:text-utama transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
