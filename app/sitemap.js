import { buatClientServer } from "@/lib/supabase";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nuran-coffee.vercel.app";

  let ruteProduk = [];
  try {
    const supabase = buatClientServer();
    const { data: produk } = await supabase
      .from("produk")
      .select("id, created_at");

    if (produk) {
      ruteProduk = produk.map((p) => ({
        url: `${baseUrl}/produk/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Gagal membuat sitemap produk:", err);
  }

  const ruteStatis = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...ruteStatis, ...ruteProduk];
}
