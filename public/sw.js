const CACHE_NAME = "nuran-coffee-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Jangan sentuh request non-origin atau rute dinamis (API, Admin, Next RSC)
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/admin") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Fallback untuk navigasi halaman HTML ketika offline (US-14)
        if (event.request.mode === "navigate") {
          const cachedHome = await caches.match("/");
          if (cachedHome) return cachedHome;
          return new Response(
            `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Mode Offline - Nuran Coffee</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:system-ui,sans-serif;padding:2.5rem 1rem;text-align:center;background:#fcfbf9;color:#2b2622;"><h2>Anda Sedang Offline</h2><p>Koneksi internet sedang tidak tersedia. Buka kembali saat online untuk melihat pembaruan katalog.</p></body></html>`,
            {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        }

        return new Response("Koneksi offline atau sumber daya tidak ditemukan.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      })
  );
});
