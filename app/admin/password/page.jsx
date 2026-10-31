"use client";

import { useActionState } from "react";
import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "@/app/admin/actions";

export default function HalamanGantiPassword() {
  const [state, formAction, pending] = useActionState(gantiPassword, null);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ganti password</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
        </p>
      </div>
      <form action={formAction} className="flex max-w-sm flex-col gap-4">
        <Input
          label="Password baru"
          name="password_baru"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Ulangi password baru"
          name="konfirmasi_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state?.sukses && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.sukses}
          </p>
        )}
        <Tombol type="submit" className="self-start" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan password"}
        </Tombol>
      </form>
    </div>
  );
}
