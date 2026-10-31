"use client";

import { useActionState } from "react";
import { simpanPengaturanToko } from "@/app/admin/actions";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormPengaturanToko({ defaultValues = {} }) {
  const [state, formAction, pending] = useActionState(simpanPengaturanToko, null);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {state?.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 p-3 text-xs font-semibold text-red-700 dark:text-red-400">
          {state.error}
        </div>
      )}

      {state?.sukses && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50 p-3 text-xs font-semibold text-green-700 dark:text-green-400">
          {state.sukses}
        </div>
      )}

      <Input
        label="Nama Toko"
        name="nama"
        defaultValue={defaultValues.nama || ""}
        placeholder="Contoh: Narun Coffee"
        required
      />

      <Input
        label="Tagline / Slogan Toko"
        name="tagline"
        defaultValue={defaultValues.tagline || ""}
        placeholder="Contoh: Rasakan kopi dengan cita rasa nusantara"
      />

      <div>
        <Input
          label="Nomor WhatsApp Pemesanan"
          name="nomorWhatsApp"
          defaultValue={defaultValues.nomorWhatsApp || ""}
          placeholder="6281234567890"
          required
        />
        <p className="mt-1 text-[11px] text-teks-lembut">
          Format angka internasional tanpa tanda + atau angka 0 di depan (contoh: <strong>6281234567890</strong>).
        </p>
      </div>

      <Input
        label="Jam Operasional"
        name="jamBuka"
        defaultValue={defaultValues.jamBuka || ""}
        placeholder="Contoh: Setiap hari, 08.00–20.00"
        required
      />

      <Input
        label="Alamat Toko & Titik Lokasi"
        name="alamat"
        textarea
        defaultValue={defaultValues.alamat || ""}
        placeholder="Contoh: Batam Center, Teluk Tering, Kepulauan Riau"
        required
      />

      <div className="pt-2">
        <Tombol type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan Perubahan Profil Toko"}
        </Tombol>
      </div>
    </form>
  );
}
