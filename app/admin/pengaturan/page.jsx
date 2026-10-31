import NavAdmin from "@/components/NavAdmin";
import FormPengaturanToko from "./FormPengaturanToko";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";

export const metadata = {
  title: "Profil & Pengaturan Toko - Admin",
};

export default async function HalamanPengaturanToko() {
  const config = await ambilPengaturanAdmin();
  const tokoInfo = config.tokoInfo || {};

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <div>
        <h1 className="text-2xl font-extrabold text-teks">Profil & Pengaturan Toko</h1>
        <p className="mt-1 text-xs text-teks-lembut">
          Ubah informasi kontak, nomor WhatsApp pemesanan, jam buka, dan alamat toko langsung dari sini.
        </p>
      </div>

      <div className="rounded-2xl border border-garis bg-permukaan p-6 sm:p-8">
        <FormPengaturanToko defaultValues={tokoInfo} />
      </div>
    </div>
  );
}
