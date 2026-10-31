import Link from "next/link";

export default function Paginasi({
  halamanSekarang = 1,
  totalHalaman = 1,
  totalProduk = 0,
  itemPerHalaman = 6,
  params = {},
}) {
  if (totalHalaman <= 1) return null;

  function buatUrl(h) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "halaman") {
        sp.set(k, v);
      }
    });
    if (h > 1) {
      sp.set("halaman", h.toString());
    }
    const query = sp.toString();
    return query ? `/?${query}` : "/";
  }

  const awal = (halamanSekarang - 1) * itemPerHalaman + 1;
  const akhir = Math.min(halamanSekarang * itemPerHalaman, totalProduk);

  const halamanList = [];
  for (let i = 1; i <= totalHalaman; i++) {
    halamanList.push(i);
  }

  return (
    <nav
      aria-label="Navigasi Halaman Produk"
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-garis pt-6 sm:flex-row"
    >
      <p className="text-sm text-teks-lembut">
        Menampilkan <span className="font-semibold text-teks">{awal}</span>–
        <span className="font-semibold text-teks">{akhir}</span> dari{" "}
        <span className="font-semibold text-teks">{totalProduk}</span> produk
      </p>

      <div className="flex items-center gap-1.5">
        {halamanSekarang > 1 ? (
          <Link
            href={buatUrl(halamanSekarang - 1)}
            className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks hover:border-utama hover:text-utama"
          >
            ← Sebelumnya
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-garis/50 bg-latar/50 px-3 py-1.5 text-sm font-medium text-teks-lembut opacity-50">
            ← Sebelumnya
          </span>
        )}

        <div className="flex items-center gap-1">
          {halamanList.map((no) => {
            const isAktif = no === halamanSekarang;
            return isAktif ? (
              <span
                key={no}
                aria-current="page"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-utama text-sm font-semibold text-white"
              >
                {no}
              </span>
            ) : (
              <Link
                key={no}
                href={buatUrl(no)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-sm font-medium text-teks hover:border-utama hover:text-utama"
              >
                {no}
              </Link>
            );
          })}
        </div>

        {halamanSekarang < totalHalaman ? (
          <Link
            href={buatUrl(halamanSekarang + 1)}
            className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm font-medium text-teks hover:border-utama hover:text-utama"
          >
            Selanjutnya →
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-garis/50 bg-latar/50 px-3 py-1.5 text-sm font-medium text-teks-lembut opacity-50">
            Selanjutnya →
          </span>
        )}
      </div>
    </nav>
  );
}
