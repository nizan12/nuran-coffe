import Link from "next/link";
import { toko as defaultToko } from "@/lib/toko";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: `Tentang Kami - ${defaultToko.nama}`,
  description: `Profil, jam operasional, dan lokasi ${defaultToko.nama}. ${defaultToko.tagline}`,
};

export default async function HalamanTentang() {
  const config = await ambilPengaturanAdmin();
  const toko = config.tokoInfo || defaultToko;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${toko.nama} ${toko.alamat}`
  )}`;

  const waUrl = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya seputar menu dan pemesanan kopi.`
  )}`;

  return (
    <div className="py-8 md:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clipRule="evenodd"
          />
        </svg>
        <span>Kembali ke katalog</span>
      </Link>

      <section className="mt-6 rounded-2xl border border-garis bg-permukaan p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">
          Tentang {toko.nama}
        </h1>
        <p className="mt-3 text-lg font-medium leading-relaxed text-utama">
          {toko.tagline}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-teks-lembut">
          {toko.deskripsi} Berakar dari kecintaan mendalam pada kekayaan cita rasa kopi Indonesia, kami berkomitmen menyajikan seduhan terbaik mulai dari espresso pekat yang seimbang, signature kopi susu aren legit, hingga seduhan manual brew aromatik. Setiap tegukan disempurnakan dengan pilihan pastry hangat yang dipanggang setiap hari.
        </p>

        {/* Nilai Utama Toko */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-garis bg-latar p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-utama">Biji Pilihan</span>
            <h3 className="mt-1 font-bold text-sm text-teks">100% Kopi Nusantara</h3>
            <p className="mt-1 text-xs text-teks-lembut leading-relaxed">
              Dipetik langsung dari petani lokal terbaik di Aceh Gayo, Kintamani, hingga Flores.
            </p>
          </div>
          <div className="rounded-xl border border-garis bg-latar p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-utama">Seduhan Presisi</span>
            <h3 className="mt-1 font-bold text-sm text-teks">Standar Barista Artisan</h3>
            <p className="mt-1 text-xs text-teks-lembut leading-relaxed">
              Dikalibrasi setiap pagi untuk menjamin konsistensi aroma, rasa, dan kelembutan krema.
            </p>
          </div>
          <div className="rounded-xl border border-garis bg-latar p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-utama">Pairing Sempurna</span>
            <h3 className="mt-1 font-bold text-sm text-teks">Freshly Baked Pastry</h3>
            <p className="mt-1 text-xs text-teks-lembut leading-relaxed">
              Kudapan renyah dan gurih dipanggang hangat untuk menemani momen santai atau kerja Anda.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Jam Operasional */}
          <div className="rounded-xl border border-garis bg-latar p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-utama/10 text-utama">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-teks">Jam Operasional</h2>
            </div>
            <p className="mt-3 text-teks-lembut font-medium">{toko.jamBuka}</p>
            <p className="mt-1 text-xs text-teks-lembut leading-relaxed">
              Buka setiap hari menyajikan seduhan kopi segar terbaik untuk Anda.
            </p>
          </div>

          {/* Lokasi Toko */}
          <div className="rounded-xl border border-garis bg-latar p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-utama/10 text-utama">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-teks">Alamat & Lokasi</h2>
            </div>
            <p className="mt-3 text-teks-lembut font-medium">{toko.alamat}</p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-utama hover:underline"
            >
              <span>Buka di Google Maps</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h4a.75.75 0 0 1 0 1.5h-4Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 0 0 1.06 1.06L16.2 4.862V8.25a.75.75 0 0 0 1.5 0V3a.75.75 0 0 0-.75-.75h-5.25a.75.75 0 0 0 0 1.5h3.388L6.194 12.753Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Hubungi Kami */}
        <div className="mt-8 rounded-xl border border-garis bg-latar p-6">
          <h2 className="text-xl font-bold text-teks">Punya Pertanyaan atau Pesanan Khusus?</h2>
          <p className="mt-2 text-sm text-teks-lembut">
            Kami siap melayani kebutuhan acara, pesanan jumlah banyak, maupun rekomendasi biji kopi pilihan.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-utama px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-utama-gelap"
            >
              Hubungi via WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-garis bg-permukaan px-5 py-3 text-sm font-semibold text-teks transition hover:border-utama hover:text-utama"
            >
              Lihat Menu Katalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
