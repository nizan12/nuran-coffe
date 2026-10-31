export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

export function ambilFotoUtama(produkOrUrl) {
  if (!produkOrUrl) return "/images/placeholder.svg";
  const raw =
    typeof produkOrUrl === "string"
      ? produkOrUrl
      : produkOrUrl.image || produkOrUrl.foto_url || "";

  if (!raw || typeof raw !== "string") return "/images/placeholder.svg";

  // Ambil URL pertama jika multi-foto dipisah dengan koma
  const first = raw.split(",")[0]?.trim();
  return first || "/images/placeholder.svg";
}

