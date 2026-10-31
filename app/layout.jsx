import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TombolInstallPWA from "@/components/TombolInstallPWA";
import ModalBandingkan from "@/components/ModalBandingkan";
import WidgetChatAI from "@/components/WidgetChatAI";
import { buatClientServer } from "@/lib/supabase";
import { toko as defaultToko } from "@/lib/toko";

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://nuran-coffee.vercel.app"),
  title: {
    default: `${defaultToko.nama} - Katalog & Pesan Kopi`,
    template: `%s | ${defaultToko.nama}`,
  },
  description: defaultToko.tagline,
  openGraph: {
    title: `${defaultToko.nama} - Katalog & Pesan Kopi`,
    description: defaultToko.tagline,
    siteName: defaultToko.nama,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultToko.nama,
    description: defaultToko.tagline,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: defaultToko.nama,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#1f6b4f",
};

export default async function RootLayout({ children }) {
  let toko = defaultToko;

  // US-43: Ambil pengaturan toko langsung dari database Supabase (pengaturan_toko)
  try {
    const supabase = buatClientServer();
    const { data: dbToko } = await supabase
      .from("pengaturan_toko")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (dbToko) {
      toko = {
        nama: dbToko.nama || defaultToko.nama,
        nomorWhatsApp: dbToko.nomor_whatsapp || defaultToko.nomorWhatsApp,
        alamat: dbToko.alamat || defaultToko.alamat,
        jamBuka: dbToko.jam_buka || defaultToko.jamBuka,
        tagline: dbToko.tagline || defaultToko.tagline || "",
        deskripsi: dbToko.deskripsi || defaultToko.deskripsi || "",
      };
    }
  } catch {}

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script src="/theme-init.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased" suppressHydrationWarning>
        <Header toko={toko} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer toko={toko} />
        <ModalBandingkan />
        <WidgetChatAI />
        <TombolInstallPWA />
      </body>
    </html>
  );
}
