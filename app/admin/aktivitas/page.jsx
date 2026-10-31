import NavAdmin from "@/components/NavAdmin";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { kosongkanLogAktivitas } from "@/app/admin/actions";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";

export const metadata = {
  title: "Log Aktivitas Admin - Admin",
};

export default async function HalamanLogAktivitas() {
  const config = await ambilPengaturanAdmin();
  const logs = Array.isArray(config.auditLog) ? config.auditLog : [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Log Aktivitas Admin</h1>
          <p className="mt-1 text-xs text-teks-lembut">
            Rekam jejak audit setiap perubahan data produk, pengaturan toko, dan operasi akun.
          </p>
        </div>

        {logs.length > 0 && (
          <form action={kosongkanLogAktivitas}>
            <TombolHapusKonfirmasi
              pesan="Bersihkan seluruh riwayat log aktivitas?"
              label="Bersihkan Log"
              varian="garis"
              className="py-2 px-3.5 text-xs text-red-600 hover:border-red-400"
            />
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-teks-lembut">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-10 w-10 opacity-40 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            <p className="font-semibold text-teks">Belum Ada Aktivitas</p>
            <p className="text-xs mt-1">Aktivitas admin seperti menambah atau mengubah produk akan tercatat di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-permukaan text-xs font-semibold text-teks-lembut border-b border-garis">
                <tr>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Admin</th>
                  <th className="px-6 py-3">Jenis Aksi</th>
                  <th className="px-6 py-3">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-garis">
                {logs.map((log) => {
                  let badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
                  if (log.aksi.includes("Hapus")) {
                    badgeColor = "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400";
                  } else if (log.aksi.includes("Tambah") || log.aksi.includes("Impor")) {
                    badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
                  } else if (log.aksi.includes("Password") || log.aksi.includes("Pengaturan")) {
                    badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
                  }

                  return (
                    <tr key={log.id} className="hover:bg-permukaan/30 transition">
                      <td className="px-6 py-4 text-xs font-medium text-teks-lembut whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-teks">
                        {log.user}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeColor}`}>
                          {log.aksi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-teks-lembut">
                        {log.rincian || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
