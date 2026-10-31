import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TombolInstallPWA from "@/components/TombolInstallPWA";
import ModalBandingkan from "@/components/ModalBandingkan";
import WidgetChatAI from "@/components/WidgetChatAI";
import { toko } from "@/lib/toko";

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

export default function RootLayout({ children }) {
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
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased" suppressHydrationWarning>
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer />
        <ModalBandingkan />
        <WidgetChatAI />
        <TombolInstallPWA />
      </body>
    </html>
  );
}
