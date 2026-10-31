"use client";

import { useActionState } from "react";
import { tambahAdmin } from "@/app/admin/actions";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormTambahAdmin() {
  const [state, formAction, pending] = useActionState(tambahAdmin, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Email Admin Baru"
          type="email"
          name="email"
          placeholder="admin2@nurancoffee.id"
          required
        />
        <Input
          label="Password (min. 8 karakter)"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
      </div>

      <div>
        <Tombol type="submit" disabled={pending}>
          {pending ? "Memproses…" : "+ Buat Akun Admin"}
        </Tombol>
      </div>
    </form>
  );
}
