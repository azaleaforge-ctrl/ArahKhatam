// Pustaka data AlQuran. Sumber utama equran.id, cadangan gading.dev.
// Semua fetch dari Server Component atau Route Handler dengan revalidate 86400.
// Audio selalu langsung ke CDN, tidak pernah di proxy.

export const EQURAN_BASE = "https://equran.id/api/v2";
export const GADING_BASE = "https://api.quran.gading.dev";

export type Qari = {
  code: string;
  nama: string;
  folder: string;
};

export const QARI_LIST: Qari[] = [
  { code: "01", nama: "Abdullah Al-Juhany", folder: "Abdullah-Al-Juhany" },
  { code: "02", nama: "Abdul Muhsin Al-Qasim", folder: "Abdul-Muhsin-Al-Qasim" },
  { code: "03", nama: "Abdurrahman as-Sudais", folder: "Abdurrahman-as-Sudais" },
  { code: "04", nama: "Ibrahim Al-Dossari", folder: "Ibrahim-Al-Dossari" },
  { code: "05", nama: "Misyari Rasyid Al-Afasi", folder: "Misyari-Rasyid-Al-Afasi" },
  { code: "06", nama: "Yasser Al-Dosari", folder: "Yasser-Al-Dosari" },
];

export const DEFAULT_QARI = "05";

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export function qariFolder(code: string): string {
  return QARI_LIST.find((q) => q.code === code)?.folder ?? "Misyari-Rasyid-Al-Afasi";
}

export function audioFullUrl(nomor: number, qari: string = DEFAULT_QARI): string {
  return "https://cdn.equran.id/audio-full/" + qariFolder(qari) + "/" + pad3(nomor) + ".mp3";
}

export function audioPartialUrl(nomor: number, ayat: number, qari: string = DEFAULT_QARI): string {
  return (
    "https://cdn.equran.id/audio-partial/" +
    qariFolder(qari) +
    "/" +
    pad3(nomor) +
    pad3(ayat) +
    ".mp3"
  );
}

export function pickFullAudio(
  map: Record<string, string> | undefined,
  nomor: number,
  qari: string
): string {
  if (map && map[qari]) return map[qari];
  return audioFullUrl(nomor, qari);
}

export function pickPartialAudio(
  map: Record<string, string> | undefined,
  nomor: number,
  ayat: number,
  qari: string
): string {
  if (map && map[qari]) return map[qari];
  return audioPartialUrl(nomor, ayat, qari);
}

export type SurahItem = {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
};

export type AyatItem = {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
};

export type SurahNav = {
  nomor: number;
  namaLatin: string;
} | null;

export type SurahDetail = SurahItem & {
  audioFull: Record<string, string>;
  ayat: AyatItem[];
  sebelumnya: SurahNav;
  sesudah: SurahNav;
};

export type TafsirAyat = {
  ayat: number;
  teks: string;
};

// Sanitasi allowlist i, b, em, strong, br sebelum dangerouslySetInnerHTML.
export function sanitizeDeskripsi(html: string): string {
  if (!html) return "";
  let out = html
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "");
  const allowed = new Set(["i", "b", "em", "strong", "br"]);
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, tag: string) => {
    const t = String(tag).toLowerCase();
    if (!allowed.has(t)) return "";
    if (t === "br") return "<br>";
    return m.startsWith("</") ? "</" + t + ">" : "<" + t + ">";
  });
  return out;
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function mapEquranSurah(d: Record<string, unknown>): SurahItem {
  return {
    nomor: Number(d.nomor ?? 0),
    nama: String(d.nama ?? ""),
    namaLatin: String(d.namaLatin ?? ""),
    jumlahAyat: Number(d.jumlahAyat ?? 0),
    tempatTurun: String(d.tempatTurun ?? ""),
    arti: String(d.arti ?? ""),
    deskripsi: String(d.deskripsi ?? ""),
  };
}

function mapGadingSurah(d: Record<string, unknown>): SurahItem {
  const name = (d.name ?? {}) as Record<string, unknown>;
  const tr = (name.transliteration ?? {}) as Record<string, unknown>;
  const tl = (name.translation ?? {}) as Record<string, unknown>;
  const rev = (d.revelation ?? {}) as Record<string, unknown>;
  const tafsir = (d.tafsir ?? {}) as Record<string, unknown>;
  return {
    nomor: Number(d.number ?? 0),
    nama: String(name.short ?? ""),
    namaLatin: String(tr.id ?? ""),
    jumlahAyat: Number(d.numberOfVerses ?? 0),
    tempatTurun: String(rev.id ?? "") === "Madaniyyah" ? "Madinah" : "Mekah",
    arti: String(tl.id ?? ""),
    deskripsi: String(tafsir.id ?? ""),
  };
}

export async function getSuratList(): Promise<{ list: SurahItem[]; sumber: string }> {
  try {
    const json = (await getJson(EQURAN_BASE + "/surat")) as {
      data?: Record<string, unknown>[];
    };
    const arr = Array.isArray(json?.data) ? json.data : [];
    if (!arr.length) throw new Error("Data kosong");
    return { sumber: "equran", list: arr.map(mapEquranSurah) };
  } catch {
    try {
      const json = (await getJson(GADING_BASE + "/surah")) as {
        data?: Record<string, unknown>[];
      };
      const arr = Array.isArray(json?.data) ? json.data : [];
      if (!arr.length) throw new Error("Data kosong");
      return { sumber: "gading", list: arr.map(mapGadingSurah) };
    } catch {
      throw new Error("Daftar surah belum bisa dimuat. Periksa koneksi lalu muat ulang halaman.");
    }
  }
}

function navOf(v: unknown): SurahNav {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.nomor === "undefined") return null;
  return { nomor: Number(o.nomor), namaLatin: String(o.namaLatin ?? "") };
}

function mapEquranDetail(d: Record<string, unknown>): SurahDetail {
  const rawAyat = Array.isArray(d.ayat) ? (d.ayat as Record<string, unknown>[]) : [];
  return {
    ...mapEquranSurah(d),
    audioFull: (d.audioFull ?? {}) as Record<string, string>,
    ayat: rawAyat.map((a) => ({
      nomorAyat: Number(a.nomorAyat ?? 0),
      teksArab: String(a.teksArab ?? ""),
      teksLatin: String(a.teksLatin ?? ""),
      teksIndonesia: String(a.teksIndonesia ?? ""),
      audio: (a.audio ?? {}) as Record<string, string>,
    })),
    sebelumnya: navOf(d.suratSebelumnya),
    sesudah: navOf(d.suratSelanjutnya),
  };
}

function mapGadingDetail(d: Record<string, unknown>, nomor: number): SurahDetail {
  const verses = Array.isArray(d.verses) ? (d.verses as Record<string, unknown>[]) : [];
  return {
    ...mapGadingSurah(d),
    audioFull: {},
    ayat: verses.map((v) => {
      const num = (v.number ?? {}) as Record<string, unknown>;
      const text = (v.text ?? {}) as Record<string, unknown>;
      const tr = (text.transliteration ?? {}) as Record<string, unknown>;
      const tl = (v.translation ?? {}) as Record<string, unknown>;
      const audio = (v.audio ?? {}) as Record<string, unknown>;
      const inSurah = Number(num.inSurah ?? 0);
      const primary = typeof audio.primary === "string" ? audio.primary : "";
      const amap: Record<string, string> = {};
      if (primary) amap["05"] = primary;
      return {
        nomorAyat: inSurah,
        teksArab: String(text.arab ?? ""),
        teksLatin: String(tr.en ?? ""),
        teksIndonesia: String(tl.id ?? ""),
        audio: amap,
      };
    }),
    sebelumnya: nomor > 1 ? { nomor: nomor - 1, namaLatin: "" } : null,
    sesudah: nomor < 114 ? { nomor: nomor + 1, namaLatin: "" } : null,
  };
}

export async function getSuratDetail(nomor: number): Promise<{ detail: SurahDetail; sumber: string }> {
  try {
    const json = (await getJson(EQURAN_BASE + "/surat/" + nomor)) as {
      data?: Record<string, unknown>;
    };
    if (!json?.data) throw new Error("Data kosong");
    return { sumber: "equran", detail: mapEquranDetail(json.data) };
  } catch {
    try {
      const json = (await getJson(GADING_BASE + "/surah/" + nomor)) as {
        data?: Record<string, unknown>;
      };
      if (!json?.data) throw new Error("Data kosong");
      return { sumber: "gading", detail: mapGadingDetail(json.data, nomor) };
    } catch {
      throw new Error("Surah belum bisa dimuat. Periksa koneksi lalu muat ulang halaman.");
    }
  }
}

export async function getTafsir(nomor: number): Promise<{ tafsir: TafsirAyat[]; sumber: string }> {
  try {
    const json = (await getJson(EQURAN_BASE + "/tafsir/" + nomor)) as {
      data?: { tafsir?: { ayat?: number; teks?: string }[] };
    };
    const arr = json?.data?.tafsir ?? [];
    if (!arr.length) throw new Error("Data kosong");
    return {
      sumber: "equran",
      tafsir: arr.map((t) => ({ ayat: Number(t.ayat ?? 0), teks: String(t.teks ?? "") })),
    };
  } catch {
    try {
      const json = (await getJson(GADING_BASE + "/surah/" + nomor)) as {
        data?: { verses?: Record<string, unknown>[] };
      };
      const verses = json?.data?.verses ?? [];
      if (!verses.length) throw new Error("Data kosong");
      return {
        sumber: "gading",
        tafsir: verses.map((v) => {
          const num = (v.number ?? {}) as Record<string, unknown>;
          const tf = (v.tafsir ?? {}) as Record<string, unknown>;
          const id = (tf.id ?? {}) as Record<string, unknown>;
          return { ayat: Number(num.inSurah ?? 0), teks: String(id.long ?? id.short ?? "") };
        }),
      };
    } catch {
      throw new Error("Tafsir belum bisa dimuat. Periksa koneksi lalu coba lagi.");
    }
  }
}
