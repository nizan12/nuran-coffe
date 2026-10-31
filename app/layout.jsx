import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TombolInstallPWA from "@/components/TombolInstallPWA";
import ModalBandingkan from "@/components/ModalBandingkan";
import WidgetChatAI from "@/components/WidgetChatAI";
import { toko } from "@/lib/toko";
import { ambilPengaturanPublik } from "@/lib/pengaturanAdmin";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nuran-coffee.vercel.app"),
  title: {
    default: `${toko.nama} - Katalog & Pesan Kopi`,
    template: `%s | ${toko.nama}`,
  },
  description: toko.tagline,
  openGraph: {
    title: `${toko.nama} - Katalog & Pesan Kopi`,
    description: toko.tagline,
    siteName: toko.nama,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: toko.nama,
    description: toko.tagline,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: toko.nama,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#1f6b4f",
};

export default async function RootLayout({ children }) {
  let namaToko = toko.nama;
  let tokoInfo = toko;
  try {
    const pub = await ambilPengaturanPublik();
    if (pub?.tokoInfo) {
      tokoInfo = pub.tokoInfo;
      if (pub.tokoInfo.nama) namaToko = pub.tokoInfo.nama;
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
        <Header namaToko={namaToko} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer infoToko={tokoInfo} />
        <ModalBandingkan />
        <WidgetChatAI />
        <TombolInstallPWA />
      </body>
    </html>
  );
}
