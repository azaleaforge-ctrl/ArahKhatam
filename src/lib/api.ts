import { getCachedJadwal, setCachedJadwal } from "./db";

export const MYQURAN_BASE = "https://api.myquran.com/v2/sholat";

export type JadwalSholat = {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

export type JadwalResponse = {
  lokasi: string;
  daerah: string;
  jadwal: JadwalSholat;
  sumber: "myquran" | "aladhan";
};

export type KotaItem = {
  id: string;
  lokasi: string;
};

export const PRAYER_ORDER = [
  "imsak",
  "subuh",
  "terbit",
  "dhuha",
  "dzuhur",
  "ashar",
  "maghrib",
  "isya",
] as const;

export type PrayerKey = (typeof PRAYER_ORDER)[number];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toTime(hm: string): string {
  return hm.slice(0, 5);
}

async function fetchJson(url: string, timeoutMs = 9000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

type MyQuranDaily = {
  status: boolean;
  data?: {
    id?: number | string;
    lokasi?: string;
    daerah?: string;
    jadwal?: Record<string, string> & { tanggal?: string };
  };
};

export async function getDailySchedule(
  idkota: string,
  yyyy: number,
  mm: number,
  dd: number
): Promise<JadwalResponse> {
  const key = "harian-" + idkota + "-" + yyyy + "-" + pad(mm) + "-" + pad(dd);
  const cached = (await getCachedJadwal(key)) as JadwalResponse | null;
  if (cached) return cached;

  try {
    const json = (await fetchJson(
      MYQURAN_BASE + "/jadwal/" + idkota + "/" + yyyy + "/" + pad(mm) + "/" + pad(dd)
    )) as MyQuranDaily;
    const d = json?.data;
    const j = d?.jadwal;
    if (json?.status && d && j) {
      const out: JadwalResponse = {
        lokasi: String(d.lokasi ?? idkota),
        daerah: String(d.daerah ?? ""),
        jadwal: {
          tanggal: String(j.tanggal ?? dd + "/" + pad(mm) + "/" + yyyy),
          imsak: toTime(String(j.imsak ?? "04:25")),
          subuh: toTime(String(j.subuh ?? "04:35")),
          terbit: toTime(String(j.terbit ?? "05:47")),
          dhuha: toTime(String(j.dhuha ?? "06:14")),
          dzuhur: toTime(String(j.dzuhur ?? "11:54")),
          ashar: toTime(String(j.ashar ?? "15:09")),
          maghrib: toTime(String(j.maghrib ?? "17:54")),
          isya: toTime(String(j.isya ?? "19:03")),
        },
        sumber: "myquran",
      };
      await setCachedJadwal(key, out);
      return out;
    }
    throw new Error("Data MyQuran kosong");
  } catch {
    const fb = await aladhanFallback(idkota, dd, mm, yyyy);
    await setCachedJadwal(key, fb);
    return fb;
  }
}

async function aladhanFallback(
  idkota: string,
  dd: number,
  mm: number,
  yyyy: number
): Promise<JadwalResponse> {
  const { DEFAULT_CITIES, findDefaultCity } = await import("./cities");
  const city = findDefaultCity(idkota) ?? DEFAULT_CITIES[0];
  const cityName = city.nama.replace("KOTA ", "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  const url =
    "https://api.aladhan.com/v1/timingsByCity/" +
    pad(dd) +
    "-" +
    pad(mm) +
    "-" +
    yyyy +
    "?city=" +
    encodeURIComponent(cityName) +
    "&country=Indonesia&method=20";
  const json = (await fetchJson(url)) as {
    data?: { timings?: Record<string, string> };
  };
  const t = json?.data?.timings ?? {};
  return {
    lokasi: city.nama,
    daerah: "Indonesia (fallback Aladhan, method Kemenag RI)",
    jadwal: {
      tanggal: dd + "/" + pad(mm) + "/" + yyyy,
      imsak: toTime(String(t.Imsak ?? "04:25")),
      subuh: toTime(String(t.Fajr ?? "04:35")),
      terbit: toTime(String(t.Sunrise ?? "05:47")),
      dhuha: toTime(String(t.Sunrise ?? "06:14")),
      dzuhur: toTime(String(t.Dhuhr ?? "11:54")),
      ashar: toTime(String(t.Asr ?? "15:09")),
      maghrib: toTime(String(t.Maghrib ?? "17:54")),
      isya: toTime(String(t.Isha ?? "19:03")),
    },
    sumber: "aladhan",
  };
}

export type MonthlyRow = JadwalSholat;

export async function getMonthlySchedule(
  idkota: string,
  yyyy: number,
  mm: number
): Promise<{ lokasi: string; rows: MonthlyRow[]; sumber: string }> {
  const key = "bulanan-" + idkota + "-" + yyyy + "-" + pad(mm);
  const cached = (await getCachedJadwal(key)) as {
    lokasi: string;
    rows: MonthlyRow[];
    sumber: string;
  } | null;
  if (cached) return cached;

  const json = (await fetchJson(
    MYQURAN_BASE + "/jadwal/" + idkota + "/" + yyyy + "/" + pad(mm)
  )) as {
    status: boolean;
    data?: {
      lokasi?: string;
      jadwal?: Array<Record<string, string>>;
    };
  };
  const rows: MonthlyRow[] = ((json?.data?.jadwal ?? []) as Array<Record<string, string>>).map(
    (j) => ({
      tanggal: String(j.tanggal ?? j.date ?? ""),
      imsak: toTime(String(j.imsak ?? "-")),
      subuh: toTime(String(j.subuh ?? "-")),
      terbit: toTime(String(j.terbit ?? "-")),
      dhuha: toTime(String(j.dhuha ?? "-")),
      dzuhur: toTime(String(j.dzuhur ?? "-")),
      ashar: toTime(String(j.ashar ?? "-")),
      maghrib: toTime(String(j.maghrib ?? "-")),
      isya: toTime(String(j.isya ?? "-")),
    })
  );
  const out = {
    lokasi: String(json?.data?.lokasi ?? idkota),
    rows,
    sumber: "myquran",
  };
  await setCachedJadwal(key, out);
  return out;
}

export async function searchCities(keyword: string): Promise<KotaItem[]> {
  try {
    const json = (await fetchJson(
      MYQURAN_BASE + "/kota/cari/" + encodeURIComponent(keyword)
    )) as { status: boolean; data?: Array<{ id?: string | number; lokasi?: string }> };
    return (json?.data ?? []).map((k) => ({
      id: String(k.id ?? ""),
      lokasi: String(k.lokasi ?? ""),
    }));
  } catch {
    return [];
  }
}

export function nextPrayer(jadwal: JadwalSholat, now: Date = new Date()) {
  const toDate = (hm: string) => {
    const [h, m] = hm.split(":").map(Number);
    const d = new Date(now);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  };
  const keys: PrayerKey[] = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];
  for (const k of keys) {
    const t = toDate(jadwal[k]);
    if (t.getTime() > now.getTime()) {
      const diff = Math.max(0, Math.floor((t.getTime() - now.getTime()) / 1000));
      return { key: k, target: t, diffSec: diff };
    }
  }
  const t = toDate(jadwal.subuh);
  t.setDate(t.getDate() + 1);
  return {
    key: "subuh" as PrayerKey,
    target: t,
    diffSec: Math.max(0, Math.floor((t.getTime() - now.getTime()) / 1000)),
  };
}

export function activePrayer(jadwal: JadwalSholat, now: Date = new Date()): PrayerKey {
  const toMin = (hm: string) => {
    const [h, m] = hm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const cur = now.getHours() * 60 + now.getMinutes();
  const seq: PrayerKey[] = ["imsak", "subuh", "terbit", "dhuha", "dzuhur", "ashar", "maghrib", "isya"];
  let active: PrayerKey = "isya";
  for (const k of seq) {
    if (cur >= toMin(jadwal[k])) active = k;
  }
  return active;
}
