// Timing karaoke per kata dari Quran Foundation (api.quran.com).
// ATURAN KERAS: timing hanya valid dengan audio dari respons yang sama,
// jangan campur segments quran.com dengan audio cdn.equran.id.

export const QURAN_COM_BASE = "https://api.quran.com/api/v4";
export const VERSES_AUDIO_BASE = "https://verses.quran.com/";
export const KARAOKE_AUDIO_CODE = 7;

export type KaraokeWord = {
  position: number;
  text: string;
};

export type KaraokeSegment = {
  position: number;
  startMs: number;
  endMs: number;
};

export type KaraokeTiming = {
  key: string;
  audioUrl: string;
  words: KaraokeWord[];
  segments: KaraokeSegment[];
};

type RawWord = {
  position?: unknown;
  text_uthmani?: unknown;
  char_type_name?: unknown;
};

type RawVerse = {
  words?: RawWord[];
  audio?: { url?: unknown; segments?: unknown };
};

export async function fetchKaraoke(surah: number, ayat: number): Promise<KaraokeTiming> {
  const key = surah + ":" + ayat;
  const url =
    QURAN_COM_BASE +
    "/verses/by_key/" +
    key +
    "?words=true&audio=" +
    KARAOKE_AUDIO_CODE +
    "&fields=text_uthmani&word_fields=verse_key,position,text_uthmani";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Timing belum bisa dimuat (HTTP " + res.status + ")");
  const json = (await res.json()) as { verse?: RawVerse };
  const verse = json?.verse;
  const rawWords = Array.isArray(verse?.words) ? (verse as RawVerse).words as RawWord[] : [];
  const words: KaraokeWord[] = [];
  for (const w of rawWords) {
    if (w.char_type_name !== "word") continue;
    const position = Number(w.position ?? 0);
    const text = String(w.text_uthmani ?? "").trim();
    if (!position || !text) continue;
    words.push({ position, text });
  }
  const rawSeg = (verse?.audio as { segments?: unknown } | undefined)?.segments;
  const segments: KaraokeSegment[] = [];
  if (Array.isArray(rawSeg)) {
    for (const s of rawSeg) {
      if (!Array.isArray(s) || s.length < 4) continue;
      const position = Number(s[1]);
      const startMs = Number(s[2]);
      const endMs = Number(s[3]);
      if (!position || !(endMs > startMs)) continue;
      segments.push({ position, startMs, endMs });
    }
  }
  const rel = String((verse?.audio as { url?: unknown } | undefined)?.url ?? "").trim();
  if (!words.length || !segments.length || !rel) {
    throw new Error("Timing kata ayat ini belum tersedia");
  }
  return { key, audioUrl: VERSES_AUDIO_BASE + rel, words, segments };
}
