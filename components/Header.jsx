import Link from "next/link";
import { toko } from "@/lib/toko";
import KeranjangDrawer from "@/components/KeranjangDrawer";
import ModalFavorit from "@/components/ModalFavorit";
import ToggleTema from "@/components/ToggleTema";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar sticky top-0 z-40 backdrop-blur-md bg-latar/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <nav className="flex items-center gap-2.5 sm:gap-4 text-sm font-medium">
          <Link href="/" className="text-teks hover:text-utama hidden xs:inline">
            Katalog
          </Link>
          <Link href="/tentang" className="text-teks-lembut hover:text-utama hidden sm:inline">
            Tentang Toko
          </Link>
          <ModalFavorit />
          <KeranjangDrawer />
          <ToggleTema />
        </nav>
      </div>
    </header>
  );
}
