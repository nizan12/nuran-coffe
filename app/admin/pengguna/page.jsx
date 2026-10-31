import NavAdmin from "@/components/NavAdmin";
import FormTambahAdmin from "./FormTambahAdmin";
import { buatClientSesi, buatClientServer } from "@/lib/supabase";
import { hapusAdmin } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";
import TombolHapusKonfirmasi from "@/components/TombolHapusKonfirmasi";

export const metadata = {
  title: "Kelola Akun Admin - Admin",
};

export default async function HalamanKelolaPengguna() {
  const supabaseSesi = await buatClientSesi();
  const {
    data: { user: currentUser },
  } = await supabaseSesi.auth.getUser();

  let daftarUser = [];
  try {
    const supabaseServer = buatClientServer();
    const { data, error } = await supabaseServer.auth.admin.listUsers();
    if (data?.users) {
      daftarUser = data.users;
    }
  } catch (err) {
    console.error("Gagal mengambil list user admin:", err);
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div>
        <h1 className="text-2xl font-extrabold text-teks">Kelola Akun Admin</h1>
        <p className="mt-1 text-xs text-teks-lembut">
          Tambah rekan pengelola toko dan pantau akun admin yang memiliki akses ke dashboard ini.
        </p>
      </div>

      {/* Form Tambah Admin */}
      <div className="rounded-2xl border border-garis bg-permukaan p-6">
        <h2 className="text-base font-bold text-teks mb-4">Tambah Admin Baru</h2>
        <FormTambahAdmin />
      </div>

      {/* Tabel Akun Admin Terdaftar */}
      <div className="rounded-2xl border border-garis bg-latar overflow-hidden">
        <div className="border-b border-garis bg-permukaan px-6 py-4">
          <h2 className="text-base font-bold text-teks">Daftar Admin Aktif ({daftarUser.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-permukaan/60 text-xs font-semibold text-teks-lembut border-b border-garis">
              <tr>
                <th className="px-6 py-3">Email Pengguna</th>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Tanggal Dibuat</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {daftarUser.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="hover:bg-permukaan/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-teks">{user.email}</span>
                        {isSelf && (
                          <span className="rounded-full bg-utama/10 border border-utama/20 px-2 py-0.5 text-[10px] font-bold text-utama">
                            Akun Kamu
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-teks-lembut">
                      {user.id.substring(0, 12)}…
                    </td>
                    <td className="px-6 py-4 text-xs text-teks-lembut">
                      {new Date(user.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span className="text-xs text-teks-lembut italic">Tidak dapat dihapus</span>
                      ) : (
                        <form action={hapusAdmin}>
                          <input type="hidden" name="id" value={user.id} />
                          <TombolHapusKonfirmasi
                            pesan={`Yakin ingin menghapus akses admin untuk ${user.email}?`}
                            label="Hapus"
                            className="py-1 px-3 text-xs"
                          />
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
