import Link from "next/link";
import { toko } from "@/lib/toko";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-garis bg-permukaan">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-teks-lembut sm:flex-row sm:justify-between">
        <div>
          <p className="font-bold text-teks">{toko.nama}</p>
          <p>{toko.alamat}</p>
          <p>{toko.jamBuka}</p>
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
