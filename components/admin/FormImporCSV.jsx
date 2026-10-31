"use client";

import { useActionState, useRef } from "react";
import { imporProdukCSV } from "@/app/admin/actions";

export default function FormImporCSV() {
  const [state, formAction, pending] = useActionState(imporProdukCSV, null);
  const fileInputRef = useRef(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Form Impor Produk CSV dengan useActionState (US-46) */}
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <label htmlFor="input-csv-file" className="text-xs font-semibold text-teks-lembut whitespace-nowrap">
          Impor CSV:
        </label>
        <input
          id="input-csv-file"
          ref={fileInputRef}
          type="file"
          name="file_csv"
          accept=".csv"
          required
          disabled={pending}
          className="text-xs text-teks file:mr-2 file:rounded-lg file:border-0 file:bg-utama/10 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-utama hover:file:bg-utama/20 cursor-pointer disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-utama px-3 py-1 text-xs font-bold text-white hover:bg-utama-gelap transition cursor-pointer disabled:opacity-50"
        >
          {pending ? "Mengimpor..." : "Unggah"}
        </button>
      </form>

      {/* Ringkasan Hasil Impor CSV (US-46) */}
      {state?.sukses && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <p className="font-bold">✓ {state.sukses}</p>
          {state.ringkasan && (
            <p className="text-[11px] mt-0.5">
              Berhasil: <strong>{state.ringkasan.berhasil}</strong> | Gagal: <strong>{state.ringkasan.gagal}</strong>
              {state.ringkasan.barisGagal?.length > 0 && (
                <span> (Baris salah: {state.ringkasan.barisGagal.join(", ")})</span>
              )}
            </p>
          )}
        </div>
      )}
      {state?.error && (
        <div className="rounded-xl border border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-2.5 text-xs text-red-700 dark:text-red-300 font-medium">
          ✕ {state.error}
        </div>
      )}
    </div>
  );
}
