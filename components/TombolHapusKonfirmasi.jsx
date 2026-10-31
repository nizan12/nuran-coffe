"use client";

import Tombol from "@/components/Tombol";

export default function TombolHapusKonfirmasi({
  pesan = "Yakin ingin menghapus?",
  label = "Hapus",
  varian = "bahaya",
  className = "py-1 px-3 text-xs",
}) {
  return (
    <Tombol
      type="submit"
      varian={varian}
      className={className}
      onClick={(e) => {
        if (!confirm(pesan)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </Tombol>
  );
}
