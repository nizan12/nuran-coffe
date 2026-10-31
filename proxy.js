import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Validasi produk hilang / tidak ditemukan langsung mengembalikan status 404 (US-02)
  if (pathname.startsWith("/produk/")) {
    const parts = pathname.split("/").filter(Boolean);
    const id = parts[1];
    if (id) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
      if (url && key) {
        try {
          const res = await fetch(`${url}/rest/v1/produk?id=eq.${encodeURIComponent(id)}&select=id,aktif`, {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0 || data[0]?.aktif === false) {
              return NextResponse.rewrite(new URL("/_not-found", request.url), {
                status: 404,
              });
            }
          } else if (res.status === 400 || res.status === 404) {
            return NextResponse.rewrite(new URL("/_not-found", request.url), {
              status: 404,
            });
          }
        } catch {}
      }
    }
    return NextResponse.next();
  }

  // Hanya proteksi rute /admin, kecuali /admin/login
  const perluLogin =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (!perluLogin) {
    return NextResponse.next();
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Jika env belum diisi, alihkan ke login supaya tidak error
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/produk/:path*"],
};
