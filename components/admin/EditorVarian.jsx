"use client";

/**
 * Sub-komponen FormProduk: Editor Varian Produk (US-12 & US-48)
 * Kelola daftar varian produk (tambah, ubah, hapus, template ukuran/suhu)
 */

export default function EditorVarian({
  daftarVarian,
  onTambahVarian,
  onUbahVarian,
  onHapusVarian,
  onTemplateUkuran,
  onTemplateSuhu,
}) {
  return (
    <div className="rounded-3xl border border-garis bg-latar p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-garis/60 pb-3">
        <div>
          <h2 className="text-base font-bold text-teks flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-utama">
              <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 1 4 2.5h12A1.5 1.5 0 0 1 17.5 4v1.5a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75V4ZM3 8a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 8Zm.75 3.25a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Zm0 4a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z" clipRule="evenodd" />
            </svg>
            <span>Pilihan Varian Produk ({daftarVarian.length})</span>
          </h2>
          <p className="text-xs text-teks-lembut mt-0.5">
            Tambahkan pilihan opsi seperti Ukuran, Suhu, Rasa, atau Berat Kemasan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onTemplateUkuran}
            className="rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-[11px] font-semibold text-teks-lembut hover:border-utama hover:text-utama transition"
            title="Isi otomatis Regular & Large"
          >
            + Template Ukuran
          </button>
          <button
            type="button"
            onClick={onTemplateSuhu}
            className="rounded-lg border border-garis bg-permukaan px-2.5 py-1 text-[11px] font-semibold text-teks-lembut hover:border-utama hover:text-utama transition"
            title="Isi otomatis Dingin & Panas"
          >
            + Template Suhu
          </button>
          <button
            type="button"
            onClick={onTambahVarian}
            className="inline-flex items-center gap-1 rounded-lg bg-utama px-3 py-1 text-xs font-bold text-white hover:bg-utama-gelap transition shadow-2xs"
          >
            <span>+ Tambah Varian</span>
          </button>
        </div>
      </div>

      {daftarVarian.length === 0 ? (
        <div className="py-6 text-center text-xs text-teks-lembut border border-dashed border-garis rounded-2xl bg-permukaan/30">
          Belum ada varian khusus. Menu ini akan menggunakan harga & stok standar di atas.
        </div>
      ) : (
        <div className="space-y-2.5">
          {daftarVarian.map((v, idx) => (
            <div
              key={v.id || idx}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-2xl border border-garis bg-permukaan/40 p-3 shadow-2xs"
            >
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-teks mb-1">
                  Nama Varian:
                </label>
                <input
                  type="text"
                  value={v.nama}
                  onChange={(e) => onUbahVarian(idx, "nama", e.target.value)}
                  placeholder="Contoh: Large / Panas / 250g"
                  className="w-full rounded-xl border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                  required
                />
              </div>

              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-semibold text-teks mb-1">
                  Harga Tambahan (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={v.harga_tambahan}
                  onChange={(e) => onUbahVarian(idx, "harga_tambahan", e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-[11px] font-semibold text-teks mb-1" title="Kosongkan jika mengikuti stok produk induk">
                  Stok Khusus:
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.stok ?? ""}
                  onChange={(e) => onUbahVarian(idx, "stok", e.target.value)}
                  placeholder="Ikut induk"
                  className="w-full rounded-xl border border-garis bg-latar px-2.5 py-1.5 text-xs text-teks focus:border-utama focus:outline-none"
                />
              </div>

              <div className="sm:self-end pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => onHapusVarian(idx)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-garis bg-latar text-teks-lembut hover:border-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer active:scale-95 shadow-2xs"
                  title="Hapus varian ini"
                  aria-label="Hapus varian ini"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.75"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
