import NavAdmin from "@/components/NavAdmin";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { moderasiUlasanAction, hapusUlasanAction } from "@/app/admin/actions";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";

export const metadata = {
  title: "Moderasi Ulasan Pelanggan - Admin",
};

export default async function HalamanModerasiUlasan() {
  const config = await ambilPengaturanAdmin();
  const ulasanList = Array.isArray(config.ulasanList) ? config.ulasanList : [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Moderasi Ulasan Pelanggan</h1>
          <p className="mt-1 text-xs text-teks-lembut">
            Kelola ulasan dan bintang penilaian pembeli sebelum atau sesudah ditampilkan di publik.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        {ulasanList.length === 0 ? (
          <div className="p-12 text-center text-xs text-teks-lembut">
            Belum ada ulasan yang masuk dari pembeli.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-permukaan text-xs font-semibold text-teks-lembut border-b border-garis">
                <tr>
                  <th className="px-6 py-3">Produk ID</th>
                  <th className="px-6 py-3">Nama Pengulas</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Komentar</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {ulasanList.map((u) => (
                  <tr key={u.id} className="hover:bg-permukaan/30 transition">
                    <td className="px-6 py-4 text-xs font-mono text-teks-lembut">
                      #{u.produkId}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-teks">{u.nama}</td>
                    <td className="px-6 py-4 text-xs font-extrabold text-amber-500">
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                        </svg>
                        <span>{u.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-teks-lembut max-w-xs truncate">
                      {u.komentar}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                          u.status === "disetujui"
                            ? "border-utama/30 bg-utama/10 text-utama"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.status === "disetujui" ? "bg-utama" : "bg-amber-500"
                          }`}
                        />
                        <span>{u.status === "disetujui" ? "Disetujui" : "Menunggu"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.status !== "disetujui" && (
                          <form action={moderasiUlasanAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="status" value="disetujui" />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                            >
                              Setujui
                            </button>
                          </form>
                        )}

                        <form action={hapusUlasanAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <TombolHapusKonfirmasi
                            pesan="Hapus ulasan ini secara permanen?"
                            label="Hapus"
                            className="py-1 px-2.5 text-[11px]"
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
