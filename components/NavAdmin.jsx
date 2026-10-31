"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Produk" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/banner", label: "Banner Promo" },
  { href: "/admin/ulasan", label: "Moderasi Ulasan" },
  { href: "/admin/pengaturan", label: "Profil Toko" },
  { href: "/admin/pengguna", label: "Kelola Admin" },
  { href: "/admin/aktivitas", label: "Log Aktivitas" },
  { href: "/admin/password", label: "Ganti Password" },
];

export default function NavAdmin() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-between gap-y-3 border-b border-garis pb-4 text-xs font-semibold">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2 transition-colors ${
                isActive
                  ? "bg-utama text-white font-bold shadow-xs"
                  : "text-teks-lembut hover:bg-permukaan hover:text-teks"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <form action={logoutAdmin} className="ml-auto">
        <button
          type="submit"
          className="rounded-xl border border-garis px-3 py-2 text-teks-lembut transition hover:border-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
        >
          Keluar
        </button>
      </form>
    </nav>
  );
}
