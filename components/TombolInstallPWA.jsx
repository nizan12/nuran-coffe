"use client";

import { useState, useEffect } from "react";

export default function TombolInstallPWA() {
  const [promptInstall, setPromptInstall] = useState(null);
  const [bisaInstall, setBisaInstall] = useState(false);
  const [tertutup, setTertutup] = useState(false);
  const [tampilPetunjuk, setTampilPetunjuk] = useState(false);

  useEffect(() => {
    // Registrasi Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Jangan tampilkan jika sudah berjalan dalam mode PWA (standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPromptInstall(e);
      setBisaInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Cek juga apakah di perangkat iOS / Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      setBisaInstall(true);
    } else {
      // Tampilkan tombol untuk kemudahan pengunjung
      setBisaInstall(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstall() {
    if (promptInstall) {
      promptInstall.prompt();
      const choice = await promptInstall.userChoice;
      if (choice.outcome === "accepted") {
        setBisaInstall(false);
      }
      setPromptInstall(null);
    } else {
      setTampilPetunjuk(true);
    }
  }

  if (!bisaInstall || tertutup) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1.5 animate-bounce-subtle">
        <button
          type="button"
          onClick={handleInstall}
          className="flex items-center gap-2 rounded-full bg-utama px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xl transition-all hover:bg-utama-gelap hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Pasang Aplikasi</span>
        </button>
        <button
          type="button"
          onClick={() => setTertutup(true)}
          aria-label="Tutup"
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-garis bg-latar text-teks-lembut shadow-md hover:bg-permukaan hover:text-teks cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {tampilPetunjuk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-w-sm w-full rounded-2xl bg-latar p-6 shadow-2xl border border-garis">
            <div className="flex items-center justify-between pb-3 border-b border-garis">
              <h3 className="text-base font-bold text-teks">Pasang Aplikasi Narun Coffee</h3>
              <button
                type="button"
                onClick={() => setTampilPetunjuk(false)}
                aria-label="Tutup modal"
                className="text-teks-lembut hover:text-teks cursor-pointer p-1 rounded-md hover:bg-permukaan"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-3 text-sm text-teks-lembut">
              Pasang katalog ini di layar utama HP Anda agar bisa dibuka kapan saja layaknya aplikasi:
            </p>
            <div className="mt-3 space-y-2 text-xs sm:text-sm text-teks">
              <div className="rounded-lg bg-permukaan p-2.5">
                <p className="flex items-center gap-1.5 font-semibold text-utama">
                  <svg className="h-4 w-4 shrink-0 fill-current text-utama" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8 12 8s-3.5902.4116-5.1367.9507L4.841 5.4477a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 10.957 0 14.7397 0 19.1667h24c0-4.427-2.6889-8.2097-6.1185-9.8453" />
                  </svg>
                  <span>Android (Chrome)</span>
                </p>
                <p className="text-teks-lembut text-xs mt-0.5">
                  Klik menu titik tiga di pojok kanan atas browser, lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Instal Aplikasi&quot;</strong>.
                </p>
              </div>
              <div className="rounded-lg bg-permukaan p-2.5">
                <p className="flex items-center gap-1.5 font-semibold text-utama">
                  <svg className="h-4 w-4 shrink-0 fill-current text-utama" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.09.65-2.73 1.4-.56.65-.99 1.7-1.03 2.76 1.07.08 2.16-.57 2.75-1.29z" />
                  </svg>
                  <span>iOS (Safari)</span>
                </p>
                <p className="text-teks-lembut text-xs mt-0.5">
                  Tekan ikon <strong>Bagikan (Share)</strong> di bagian bawah, lalu pilih <strong>&quot;Tambah ke Layar Utama&quot;</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTampilPetunjuk(false)}
              className="mt-5 w-full rounded-lg bg-utama py-2 text-sm font-semibold text-white hover:bg-utama-gelap cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
