const DB_NAME = "waktu-sholat-db";
const DB_VERSION = 1;

import type { KaraokeTiming } from "./karaoke";

type StoreName = "kv" | "jadwal" | "kota";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (!db.objectStoreNames.contains("jadwal")) db.createObjectStore("jadwal");
      if (!db.objectStoreNames.contains("kota")) db.createObjectStore("kota");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const r = fn(s);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      })
  );
}

function safeLocalGet(key: string): string | null {
  try {
    return localStorage.getItem("ws:" + key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string) {
  try {
    localStorage.setItem("ws:" + key, value);
  } catch {
    // abaikan, penyimpanan penuh atau mode privat
  }
}

export async function kvGet(key: string): Promise<string | null> {
  const local = safeLocalGet(key);
  if (local !== null) return local;
  try {
    const v = await tx<string | null>("kv", "readonly", (s) => s.get(key));
    return v ?? null;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: string): Promise<void> {
  safeLocalSet(key, value);
  try {
    await tx("kv", "readwrite", (s) => s.put(value, key));
  } catch {
    // abaikan, fallback localStorage sudah tersimpan
  }
}

export type CachedJadwal = {
  savedAt: number;
  payload: unknown;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getCachedJadwal(key: string): Promise<unknown | null> {
  try {
    const cached = await tx<CachedJadwal | undefined>("jadwal", "readonly", (s) => s.get(key));
    if (!cached) return null;
    if (Date.now() - cached.savedAt > DAY_MS) return null;
    return cached.payload;
  } catch {
    return null;
  }
}

export async function setCachedJadwal(key: string, payload: unknown): Promise<void> {
  try {
    await tx("jadwal", "readwrite", (s) =>
      s.put({ savedAt: Date.now(), payload } satisfies CachedJadwal, key)
    );
  } catch {
    // abaikan bila IndexedDB gagal
  }
}

export async function getSelectedCityId(): Promise<string> {
  const v = await kvGet("kota-id");
  return v ?? "1301";
}

export async function setSelectedCityId(id: string): Promise<void> {
  await kvSet("kota-id", id);
}

export async function getCachedCities(): Promise<unknown | null> {
  try {
    const v = await tx<unknown>("kota", "readonly", (s) => s.get("semua"));
    return v ?? null;
  } catch {
    return null;
  }
}

export async function setCachedCities(payload: unknown): Promise<void> {
  try {
    await tx("kota", "readwrite", (s) => s.put(payload, "semua"));
  } catch {
    // abaikan
  }
}

// honey: hanya cache jadwal, data user aman (kv/localStorage tidak dihapus).
export async function clearScheduleCache(): Promise<void> {
  try {
    await tx("jadwal", "readwrite", (s) => s.clear());
  } catch {
    // abaikan
  }
  try {
    await tx("kota", "readwrite", (s) => s.clear());
  } catch {
    // abaikan
  }
}

// --- Pelacak bacaan AlQuran, fungsi baru, fungsi lama di atas tidak diubah ---

export type LastRead = {
  surah: number;
  ayat: number;
  namaLatin: string;
};

const LAST_READ_KEY = "quran-terakhir";
const FINISHED_KEY = "quran-selesai";

export async function getLastRead(): Promise<LastRead | null> {
  try {
    const raw = await kvGet(LAST_READ_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<LastRead>;
    if (typeof v.surah !== "number" || typeof v.ayat !== "number") return null;
    return { surah: v.surah, ayat: v.ayat, namaLatin: String(v.namaLatin ?? "") };
  } catch {
    return null;
  }
}

export async function setLastRead(v: LastRead): Promise<void> {
  await kvSet(LAST_READ_KEY, JSON.stringify(v));
}

export async function getFinishedSurahs(): Promise<number[]> {
  try {
    const raw = await kvGet(FINISHED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((n): n is number => typeof n === "number" && n >= 1 && n <= 114);
  } catch {
    return [];
  }
}

export async function toggleFinishedSurah(nomor: number): Promise<number[]> {
  const cur = await getFinishedSurahs();
  const next = cur.includes(nomor) ? cur.filter((n) => n !== nomor) : [...cur, nomor];
  await kvSet(FINISHED_KEY, JSON.stringify(next));
  return next;
}

// --- Progress Iqro, fungsi baru, fungsi lama di atas tidak diubah ---

export type LastIqro = {
  jilid: number;
  lessonId: string;
};

const IQRO_DONE_KEY = "iqro-selesai";
const IQRO_LAST_KEY = "iqro-terakhir";

export async function getFinishedIqroLessons(): Promise<string[]> {
  try {
    const raw = await kvGet(IQRO_DONE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export async function toggleIqroLesson(id: string): Promise<string[]> {
  const cur = await getFinishedIqroLessons();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  await kvSet(IQRO_DONE_KEY, JSON.stringify(next));
  return next;
}

export async function getLastIqro(): Promise<LastIqro | null> {
  try {
    const raw = await kvGet(IQRO_LAST_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<LastIqro>;
    if (typeof v.jilid !== "number" || typeof v.lessonId !== "string") return null;
    if (v.jilid < 1 || v.jilid > 6) return null;
    return { jilid: v.jilid, lessonId: v.lessonId };
  } catch {
    return null;
  }
}

export async function setLastIqro(v: LastIqro): Promise<void> {
  await kvSet(IQRO_LAST_KEY, JSON.stringify(v));
}

// --- Timing karaoke per kata, fungsi baru, fungsi lama di atas tidak diubah ---

const KARAOKE_PREFIX = "karaoke-";

export async function getKaraokeTiming(key: string): Promise<KaraokeTiming | null> {
  try {
    const raw = await kvGet(KARAOKE_PREFIX + key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<KaraokeTiming>;
    if (!v || typeof v.audioUrl !== "string") return null;
    if (!Array.isArray(v.words) || !Array.isArray(v.segments)) return null;
    if (!v.words.length || !v.segments.length) return null;
    return v as KaraokeTiming;
  } catch {
    return null;
  }
}

export async function setKaraokeTiming(key: string, v: KaraokeTiming): Promise<void> {
  try {
    await kvSet(KARAOKE_PREFIX + key, JSON.stringify(v));
  } catch {
    // abaikan, cache hanya pemanis
  }
}
