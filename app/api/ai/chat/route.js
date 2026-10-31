import { NextResponse } from "next/server";
import { buatClientServer, normalisasiDaftarProduk } from "@/lib/supabase";
import { ambilPengaturanAdmin } from "@/lib/pengaturanAdmin";
import { toko } from "@/lib/toko";

export async function POST(request) {
  try {
    const { pesan, riwayat = [] } = await request.json();

    if (!pesan || !pesan.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    // Ambil daftar produk terkini dari Supabase (lengkap dengan foto untuk kartu produk)
    const supabase = buatClientServer();
    const { data: rawProduk } = await supabase
      .from("produk")
      .select("*, kategori_rel:kategori_id(id, nama, slug)")
      .order("created_at", { ascending: false });

    const config = await ambilPengaturanAdmin();
    const nonaktifIds = config.nonaktifIds || [];
    const daftarNormal = normalisasiDaftarProduk(rawProduk || []);
    const produkAktif = daftarNormal.filter((p) => !nonaktifIds.includes(p.id));

    const ringkasanMenu = produkAktif
      .map(
        (p) =>
          `- ID #${p.id}: ${p.nama} (${p.kategori || "Umum"}) - Rp ${Number(p.harga).toLocaleString("id-ID")}. ${p.deskripsi || ""}`
      )
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback ramah jika API key belum diisi
      const saranAwal = produkAktif.slice(0, 2);
      return NextResponse.json({
        jawaban: `Halo! Selamat datang di ${toko.nama}. Kami memiliki aneka pilihan kopi dan minuman segar seperti ${
          produkAktif.slice(0, 3).map((p) => p.nama).join(", ")
        }. Kamu bisa memesan langsung ke WhatsApp kami di nomor ${toko.nomorWhatsApp}. Ada rasa kopi atau camilan favorit yang sedang kamu cari?`,
        produkRekomendasi: saranAwal,
      });
    }

    const systemPrompt = `Kamu adalah Barista Virtual ramah dan ahli pairing kopi serta makanan dari kedai "${toko.nama}".
Identitas Toko:
- Nama: ${toko.nama}
- Jam Buka: ${toko.jamBuka}
- Alamat: ${toko.alamat}
- WhatsApp: ${toko.nomorWhatsApp}

Daftar Menu Tersedia Saat Ini:
${ringkasanMenu}

Aturan Menjawab:
1. Bantu pengunjung memilih menu yang cocok dengan selera, waktu, atau suasana hati mereka berdasarkan daftar menu di atas.
2. Jika pengunjung menanyakan makanan atau camilan yang cocok dipasangkan (food pairing) dengan minuman tertentu, rekomendasikan menu makanan/pastry yang tersedia di daftar toko kami (seperti Butter Croissant Panggang) dan jelaskan secara singkat mengapa kombinasi rasa tersebut sangat serasi.
3. Jawab dalam bahasa Indonesia yang ramah, santun, dan ringkas (maksimal 2 paragraf).
4. JANGAN PERNAH MENGGUNAKAN EMOJI APAPUN dalam jawabanmu. Gunakan bahasa teks murni yang hangat dan bersahabat.
5. Jika ditanya menu yang tidak ada di daftar, jelaskan dengan sopan dan tawarkan menu alternatif yang ada di toko kami.
6. Pada baris TERAKHIR jawabanmu, jika ada produk spesifik dari daftar menu di atas yang kamu sarankan, cantumkan ID produknya dalam format persis seperti ini:
[REKOMENDASI: id1, id2]
Contoh: [REKOMENDASI: 3, 6]`;

    // Format riwayat chat untuk Gemini API:
    // Pastikan percakapan dimulai dari role "user" (abaikan sapaan bot di awal)
    const validHistory = [];
    let userHasStarted = false;

    for (const r of riwayat) {
      if (!r?.text || !r.text.trim()) continue;
      if (r.sender === "user") {
        userHasStarted = true;
      }
      if (userHasStarted) {
        validHistory.push({
          role: r.sender === "user" ? "user" : "model",
          parts: [{ text: r.text.trim() }],
        });
      }
    }

    // Ambil maksimal 8 percakapan terakhir
    const contents = validHistory.slice(-8);

    // Tambahkan pesan terkini jika belum ada di akhir
    const lastContent = contents[contents.length - 1];
    if (!lastContent || lastContent.role !== "user" || lastContent.parts[0]?.text !== pesan.trim()) {
      contents.push({
        role: "user",
        parts: [{ text: pesan.trim() }],
      });
    }

    // Pastikan percakapan selalu diawali oleh user
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: pesan.trim() }],
      });
    }

    // Daftar model Gemini aktif & terverifikasi cepat
    const models = ["gemini-flash-lite-latest", "gemini-3.5-flash-lite", "gemini-flash-latest"];
    let jawaban = "";

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }],
              },
              contents,
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (!res.ok) {
          const errDetail = await res.json().catch(() => ({}));
          console.error(`Gemini API error (${model}):`, res.status, errDetail);
          continue;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Bersihkan emoji secara menyeluruh (zero-emoji rule)
          jawaban = text
            .replace(/[\p{Extended_Pictographic}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
            .trim();
          break;
        }
      } catch (err) {
        console.error(`Fetch exception for ${model}:`, err.message);
      }
    }

    // Ekstrak rekomendasi produk dari tag [REKOMENDASI: ...]
    let produkRekomendasi = [];
    const tagRegex = /\[REKOMENDASI:\s*([0-9,\s]+)\]/i;
    const match = jawaban.match(tagRegex);

    if (match) {
      const ids = match[1]
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));

      produkRekomendasi = ids
        .map((id) => produkAktif.find((p) => p.id === id))
        .filter(Boolean);

      // Bersihkan tag dari teks tampilan jawaban
      jawaban = jawaban.replace(tagRegex, "").trim();
    }

    // Fallback pencocokan jika AI menyebutkan produk dalam teks tapi tidak membuat tag
    if (produkRekomendasi.length === 0 && jawaban) {
      for (const p of produkAktif) {
        if (jawaban.toLowerCase().includes(p.nama.toLowerCase())) {
          produkRekomendasi.push(p);
        }
      }
      produkRekomendasi = produkRekomendasi.slice(0, 2);
    }

    if (!jawaban) {
      // Fallback jika semua pemanggilan model gagal/timeout
      const menuKopi = produkAktif.find((p) => p.kategori?.toLowerCase().includes("espresso") || p.kategori?.toLowerCase().includes("signature")) || produkAktif[0];
      const menuPastry = produkAktif.find((p) => p.kategori?.toLowerCase().includes("camilan") || p.kategori?.toLowerCase().includes("pastry"));

      jawaban = `Untuk pilihan kopi terbaik hari ini, kami merekomendasikan ${menuKopi?.nama || "Es Kopi Susu Aren Narun"}. Sangat cocok dinikmati bersama ${menuPastry?.nama || "camilan pastry"} kami yang renyah dan gurih!`;
      produkRekomendasi = [menuKopi, menuPastry].filter(Boolean);
    }

    return NextResponse.json({
      jawaban,
      produkRekomendasi,
    });
  } catch (err) {
    console.error("Gagal memproses pesan AI:", err);
    return NextResponse.json(
      { error: "Gagal memproses pesan AI: " + err.message },
      { status: 500 }
    );
  }
}
