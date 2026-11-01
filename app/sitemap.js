import { buatClientServer } from "@/lib/supabase";

/**
 * US-27: sitemap.xml
 * Membuat sitemap dinamis dari database Supabase (produk & kategori) serta rute publik statis.
 */
export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || "https://nuran-coffee.vercel.app";

  let ruteProduk = [];
  let ruteKategori = [];

  try {
    const supabase = buatClientServer();
    const [{ data: produk }, { data: kategori }] = await Promise.all([
      supabase.from("produk").select("id, created_at").eq("aktif", true),
      supabase.from("kategori").select("slug"),
    ]);

    if (Array.isArray(produk)) {
      ruteProduk = produk.map((p) => ({
        url: `${baseUrl}/produk/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }

    if (Array.isArray(kategori)) {
      ruteKategori = kategori
        .filter((k) => Boolean(k?.slug))
        .map((k) => ({
          url: `${baseUrl}/kategori/${k.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    }
  } catch {}

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
    {
      url: `${baseUrl}/favorit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/keranjang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...ruteStatis, ...ruteKategori, ...ruteProduk];
}
