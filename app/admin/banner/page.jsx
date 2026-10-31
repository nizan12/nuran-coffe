import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";
import { buatClientServer } from "@/lib/supabase";
import {
  tambahBannerAdmin,
  toggleStatusBannerAdmin,
  hapusBannerAdmin,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Kelola Banner Promo - Admin",
};

const PILIHAN_GRADIEN = [
  { label: "Hijau Emerald (Kopi & Alam)", value: "from-emerald-950 via-utama-gelap to-utama" },
  { label: "Cokelat Amber (Caramel & Roast)", value: "from-amber-950 via-stone-900 to-amber-900" },
  { label: "Gelap Elegan (Espresso Malam)", value: "from-stone-950 via-stone-900 to-emerald-950" },
  { label: "Merah Menyala (Promo Heboh)", value: "from-red-950 via-rose-900 to-amber-900" },
];

export default async function HalamanKelolaBanner() {
  const supabase = buatClientServer();

  let daftarBanner = [];
  try {
    const { data } = await supabase
      .from("banner")
      .select("*")
      .order("urutan", { ascending: true })
      .order("created_at", { ascending: false });
    if (data) daftarBanner = data;
  } catch (err) {
    console.error("Gagal memuat banner:", err);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Kelola Banner Promo</h1>
          <p className="mt-1 text-xs text-teks-lembut">
            Atur slider promo dan pengumuman hero yang tampil di bagian atas beranda pengunjung.
          </p>
        </div>
        <Tombol href="/admin" varian="garis">
          ← Kembali ke Dashboard
        </Tombol>
      </div>

      {/* Form Tambah Banner Baru */}
      <div className="rounded-2xl border border-garis bg-permukaan p-5 sm:p-6">
        <h2 className="text-base font-bold text-teks">Tambah Banner Promo Baru</h2>
        <p className="mt-1 text-xs text-teks-lembut">
          Banner baru akan otomatis aktif dan bergulir di slider beranda katalog.
        </p>

        <form action={tambahBannerAdmin} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-teks">Judul Promo *</label>
            <input
              type="text"
              name="judul"
              required
              placeholder="Contoh: Diskon 20% Aneka Kopi Robusta & Arabika"
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-teks">Teks Badge</label>
            <input
              type="text"
              name="badge"
              defaultValue="PROMO SPESIAL"
              placeholder="PROMO SPESIAL, MENU BARU, GRATIS ONGKIR..."
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-teks">Subjudul Singkat</label>
            <input
              type="text"
              name="subjudul"
              placeholder="Contoh: Sangrai Nusantara Pilihan"
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-teks">Deskripsi Penawaran</label>
            <textarea
              name="deskripsi"
              rows={2}
              placeholder="Biji kopi pilihan sangrai nusantara, siap dipesan langsung dan diantar segar ke tempat Anda."
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-teks">Teks Tombol Aksi (CTA)</label>
            <input
              type="text"
              name="tombol_teks"
              defaultValue="Pesan via WhatsApp"
              placeholder="Pesan via WhatsApp / Jelajahi Menu"
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-teks">Tautan Tujuan (Link URL)</label>
            <input
              type="text"
              name="link_url"
              defaultValue="/"
              placeholder="/ (halaman beranda), /tentang, atau link wa.me/..."
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-teks">Ikon Tema</label>
            <select
              name="tipe"
              defaultValue="coffee"
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            >
              <option value="coffee">Cangkir Kopi (Coffee)</option>
              <option value="delivery">Pengiriman (Delivery / Gratis Ongkir)</option>
              <option value="sparkle">Bintang / Menu Baru (Sparkle)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-teks">Nuansa Warna Gradien</label>
            <select
              name="bg_gradient"
              defaultValue="from-emerald-950 via-utama-gelap to-utama"
              className="mt-1 w-full rounded-lg border border-garis bg-latar p-2.5 text-sm text-teks focus:border-utama focus:outline-none"
            >
              {PILIHAN_GRADIEN.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <Tombol type="submit" varian="utama">
              + Terbitkan Banner Promo
            </Tombol>
          </div>
        </form>
      </div>

      {/* Daftar Banner yang Sedang Tayang */}
      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        <div className="p-4 bg-permukaan border-b border-garis">
          <h2 className="text-sm font-bold text-teks">
            Daftar Banner Aktif & Tersimpan ({daftarBanner.length})
          </h2>
        </div>

        {daftarBanner.length === 0 ? (
          <div className="p-12 text-center text-xs text-teks-lembut">
            Belum ada banner promo yang terdaftar di database.
          </div>
        ) : (
          <div className="divide-y divide-garis">
            {daftarBanner.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-permukaan/30 transition"
              >
                {/* Cuplikan Tampilan Mini Banner */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`h-20 w-32 shrink-0 rounded-xl bg-gradient-to-r ${b.bg_gradient} p-2.5 flex flex-col justify-between text-white shadow-xs`}
                  >
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/20 w-fit">
                      {b.badge}
                    </span>
                    <p className="text-[10px] font-bold line-clamp-2 leading-tight">
                      {b.judul}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-teks-lembut">#{b.id}</span>
                      <h3 className="text-sm font-bold text-teks truncate">{b.judul}</h3>
                    </div>
                    {b.deskripsi && (
                      <p className="mt-1 text-xs text-teks-lembut line-clamp-2">
                        {b.deskripsi}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-teks-lembut">
                      <span>Tombol: <strong>{b.tombol_teks}</strong></span>
                      <span>Link: <code className="text-utama">{b.link_url}</code></span>
                    </div>
                  </div>
                </div>

                {/* Aksi Toggle Status & Hapus */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <form action={toggleStatusBannerAdmin}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="aktif" value={String(b.aktif)} />
                    <button
                      type="submit"
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-2xs ${
                        b.aktif
                          ? "border-utama/30 bg-utama/10 text-utama hover:border-utama hover:bg-utama/20"
                          : "border-garis bg-permukaan text-teks-lembut hover:border-teks-lembut hover:text-teks"
                      }`}
                      title="Klik untuk mengubah status tampil di beranda"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          b.aktif ? "bg-utama shadow-xs" : "bg-teks-lembut/60"
                        }`}
                      />
                      <span>{b.aktif ? "Tampil di Beranda" : "Disembunyikan"}</span>
                    </button>
                  </form>

                  <form action={hapusBannerAdmin}>
                    <input type="hidden" name="id" value={b.id} />
                    <TombolHapusKonfirmasi
                      pesan={`Hapus banner "${b.judul}" secara permanen?`}
                      label="Hapus"
                      varian="garis"
                      className="py-1 px-2.5 text-xs text-red-600 hover:border-red-400"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
