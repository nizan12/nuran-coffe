import Link from "next/link";
import { toko } from "@/lib/toko";

export default function Footer({ infoToko = null }) {
  const t = infoToko || toko;

  return (
    <footer className="mt-16 border-t border-garis bg-permukaan">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-teks-lembut sm:flex-row sm:justify-between">
        <div>
          <p className="font-bold text-teks">{t.nama}</p>
          <p>{t.alamat}</p>
          <p>{t.jamBuka}</p>
          {t.nomorWhatsApp && (
            <p className="text-xs text-teks-lembut/80 mt-0.5">WhatsApp: {t.nomorWhatsApp}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href="/tentang" className="self-start underline underline-offset-4 hover:text-utama sm:self-end">
            Tentang Toko
          </Link>
          <Link href="/admin" className="self-start underline underline-offset-4 hover:text-utama sm:self-end">
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
