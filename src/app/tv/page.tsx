"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { kvGet, kvSet, getSelectedCityId } from "@/lib/db";
import { getDailySchedule, getServerNow, activePrayer, searchCities, PRAYER_ORDER } from "@/lib/api";
import type { JadwalResponse, JadwalSholat, KotaItem, PrayerKey } from "@/lib/api";
import { DEFAULT_CITIES } from "@/lib/cities";
import { formatHijriah } from "@/lib/qibla";
import SafeImage from "@/components/SafeImage";
import { useScreenWakeLock } from "@/hooks/useScreenWakeLock";

const PRESETS = [
  { src: "/media/masjid-agung-bandung.jpg", label: "Masjid Agung" },
  { src: "/media/masjid-senja.jpg", label: "Masjid Senja" },
  { src: "/media/sajadah.jpg", label: "Sajadah" },
  { src: "/media/kota-pagi.jpg", label: "Kota Pagi" },
];

const PRAYER_LABEL: Record<string, string> = {
  imsak: "Imsak",
  subuh: "Subuh",
  terbit: "Terbit",
  dhuha: "Dhuha",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};

const FARDHU_KEYS: PrayerKey[] = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];

const KUTIPAN_DEFAULT = [
  "Sholat tepat waktu, hati jadi tenang.",
  "Lima waktu sehari, Allah selalu dekat.",
  "Berhenti sejenak, sujud dan tenangkan hati.",
  "Awal waktu, awal ketenangan.",
  "Yang menjaga sholatnya, Allah jaga harinya.",
  "Datang lebih awal, pulang membawa tenang.",
];

const AZAN_OPTIONS = [
  {
    nama: "Beautiful adhan",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Beautiful_adhan.ogg",
    atribusi: "CC0, tanpa atribusi",
    atribusiUrl: "",
  },
  {
    nama: "Rekaman Madinah (ejaz215)",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7c/33937_ejaz215_call-to-prayer-from-the-prophet-s-mo.ogg",
    atribusi: "CC-BY-3.0 ejaz215",
    atribusiUrl: "https://commons.wikimedia.org/wiki/File:33937_ejaz215_call-to-prayer-from-the-prophet-s-mo.ogg",
  },
  {
    nama: "Azan (Andrewler)",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Azan.ogg",
    atribusi: "CC-BY-SA-4.0 Andrewler",
    atribusiUrl: "https://commons.wikimedia.org/wiki/File:Azan.ogg",
  },
  {
    nama: "Panggilan ibadah (Mahfoudou)",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Islamic_call_to_worship.oga",
    atribusi: "CC-BY-SA-4.0 Mahfoudou",
    atribusiUrl: "https://commons.wikimedia.org/wiki/File:Islamic_call_to_worship.oga",
  },
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtClock = (d: Date) => pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
const fmtCount = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return pad2(h) + ":" + pad2(m) + ":" + pad2(ss);
};
const fmtMasehi = (d: Date) => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString("id-ID");
  }
};
const kunciTanggal = (d: Date) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());

// Backdoor demo (?azanDemo=1) hanya non-prod (atau NEXT_PUBLIC_ALLOW_DEMO=1). Di prod diabaikan.
const ALLOW_DEMO =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ALLOW_DEMO === "1";

// PIN lokal 1x per sesi untuk aksi sensitif. Bawaan "222026", ubah via NEXT_PUBLIC_TV_PIN.
const TV_PIN = process.env.NEXT_PUBLIC_TV_PIN || "222026";
const PIN_KEY = "tv-pin-ok";
// Koreksi jam server dibatasi ±5 menit; di luar itu (atau offline) pakai jam lokal.
const OFFSET_MAX_MS = 5 * 60 * 1000;
const clampOffset = (ms: number) =>
  Math.max(-OFFSET_MAX_MS, Math.min(OFFSET_MAX_MS, Number.isFinite(ms) ? ms : 0));

// Logika periode SAMA PERSIS dengan landing (JadwalHarian):
// aktif = activePrayer 8 waktu, berikutnya = entri PRAYER_ORDER sesudah aktif.
function periodeTv(jadwal: JadwalSholat, now: Date) {
  const aktif = activePrayer(jadwal, now);
  const order = [...PRAYER_ORDER];
  const idx = order.indexOf(aktif);
  const berikut = order[(idx + 1) % order.length];
  const [h, m] = String(jadwal[berikut] ?? "00:00").split(":").map(Number);
  const target = new Date(now);
  target.setHours(h || 0, m || 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  const diffSec = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return { aktif, berikut, target, diffSec };
}

// Normalisasi "5:04" / "05:04:00" -> "05:04" agar pencocokan tidak rapuh.
function normHM(hm: string): string {
  const t = String(hm ?? "").slice(0, 5);
  const [h, m] = t.split(":");
  return pad2(parseInt(h ?? "", 10) || 0) + ":" + pad2(parseInt(m ?? "", 10) || 0);
}

// Fardhu berikutnya (untuk status + demo), terpisah dari grid 8 waktu.
function fardhuBerikut(jadwal: JadwalSholat, now: Date): { key: PrayerKey; jam: string } {
  for (const k of FARDHU_KEYS) {
    const [h, m] = normHM(jadwal[k]).split(":").map(Number);
    const t = new Date(now);
    t.setHours(h || 0, m || 0, 0, 0);
    if (t.getTime() > now.getTime()) return { key: k, jam: normHM(jadwal[k]) };
  }
  return { key: "subuh", jam: normHM(jadwal.subuh) };
}

// Kecilkan gambar upload via canvas: sisi terpanjang max 1920px, JPEG ~0.82.
function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const MAX = 1920;
        let w = img.naturalWidth || MAX;
        let h = img.naturalHeight || MAX;
        const scale = Math.min(1, MAX / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("canvas kosong");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.82));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("gambar tidak terbaca"));
    };
    img.src = url;
  });
}

export default function TvPage() {
  const [mode, setMode] = useState<"editor" | "display">("editor");
  const [nama, setNama] = useState("Masjid");
  const [bg, setBg] = useState(PRESETS[1].src);
  const [kotaId, setKotaId] = useState("1301");
  const [kotaNama, setKotaNama] = useState("KOTA JAKARTA");
  const [keyword, setKeyword] = useState("");
  const [hasil, setHasil] = useState<KotaItem[]>([]);
  const [mencari, setMencari] = useState(false);
  const [jadwal, setJadwal] = useState<JadwalResponse | null>(null);
  const [jadwalEditor, setJadwalEditor] = useState<JadwalResponse | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [azanAktif, setAzanAktif] = useState(true);
  const [azanPilihan, setAzanPilihan] = useState(0);
  const [azanPopup, setAzanPopup] = useState<PrayerKey | null>(null);
  const [azanKonfirm, setAzanKonfirm] = useState(false);
  const [azanSiap, setAzanSiap] = useState(false);
  const [azanNote, setAzanNote] = useState<string | null>(null);
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [previewGagal, setPreviewGagal] = useState<number | null>(null);
  const [daftarKutipan, setDaftarKutipan] = useState<string[]>([]);
  const [draftKutipan, setDraftKutipan] = useState("");
  const [kutipanIdx, setKutipanIdx] = useState(0);
  const [kutipanPudar, setKutipanPudar] = useState(false);
  const [updateTampil, setUpdateTampil] = useState(false);
  const [offsetMs, setOffsetMs] = useState(0);
  const [pinOk, setPinOk] = useState(() => {
    try {
      return sessionStorage.getItem(PIN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [pinTerbuka, setPinTerbuka] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinSalah, setPinSalah] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const azanTelahBunyi = useRef<Set<string>>(new Set());
  const jadwalRef = useRef<JadwalResponse | null>(null);
  const azanDemoFired = useRef(false);
  const offsetRef = useRef(0);
  const pendingAksi = useRef<(() => void) | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const { locked: wakeLocked } = useScreenWakeLock(mode === "display");

  // Hormati prefers-reduced-motion: matikan animasi denyut/transisi.
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mq.matches);
      const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    } catch {
      return;
    }
  }, []);

  // PIN: ingat 1x per sesi via sessionStorage (lazy init di pinOk; tanpa effect).

  // Sinkron jam server saat display (tiap 60 dtk). Gagal/offline -> offset 0 (jam lokal).
  useEffect(() => {
    if (mode !== "display") return;
    let hidup = true;
    const sinkron = async () => {
      try {
        const off = clampOffset((await getServerNow()) - Date.now());
        if (!hidup) return;
        offsetRef.current = off;
        setOffsetMs(off);
      } catch {
        // offline: tetap jam lokal
      }
    };
    void sinkron();
    const t = setInterval(sinkron, 60000);
    return () => {
      hidup = false;
      clearInterval(t);
    };
  }, [mode]);

  // Muat simpanan saat mount.
  useEffect(() => {
    let hidup = true;
    (async () => {
      try {
        const [n, b, k, aa, ap, q] = await Promise.all([
          kvGet("tv-nama-masjid"),
          kvGet("tv-background"),
          kvGet("tv-kota-id"),
          kvGet("tv-azan-aktif"),
          kvGet("tv-azan-pilihan"),
          kvGet("tv-kutipan"),
        ]);
        let id = k;
        if (!id) {
          try {
            id = await getSelectedCityId();
          } catch {
            id = "1301";
          }
        }
        if (!hidup) return;
        if (n) setNama(n);
        if (b) setBg(b);
        if (q !== null) {
          const bersih = (arr: unknown): string[] =>
            Array.isArray(arr)
              ? arr
                  .filter((x): x is string => typeof x === "string")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 20)
              : [];
          try {
            const parsed: unknown = JSON.parse(q);
            if (Array.isArray(parsed)) setDaftarKutipan(bersih(parsed));
            else if (typeof parsed === "string" && parsed.trim())
              setDaftarKutipan([parsed.trim().slice(0, 160)]);
            else if (q.trim()) setDaftarKutipan([q.trim().slice(0, 160)]);
          } catch {
            if (q.trim()) setDaftarKutipan([q.trim().slice(0, 160)]);
          }
        }
        if (id) {
          setKotaId(id);
          const dc = DEFAULT_CITIES.find((c) => c.id === id);
          if (dc) setKotaNama(dc.nama);
          else setKotaNama(id);
        }
        if (aa !== null) setAzanAktif(aa !== "0");
        const idx = Number(ap);
        if (ap !== null && Number.isInteger(idx) && idx >= 0 && idx < AZAN_OPTIONS.length) {
          setAzanPilihan(idx);
        }
      } catch {
        // abaikan, pakai bawaan
      }
      if (hidup) setAzanSiap(true);
    })();
    return () => {
      hidup = false;
    };
  }, []);

  // Cari kota dengan debounce.
  useEffect(() => {
    const q = keyword.trim();
    if (q.length < 2) {
      setHasil([]);
      return;
    }
    setMencari(true);
    const t = setTimeout(async () => {
      try {
        setHasil(await searchCities(q));
      } catch {
        setHasil([]);
      } finally {
        setMencari(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const mintaPin = useCallback(
    (aksi: () => void) => {
      try {
        if (sessionStorage.getItem(PIN_KEY) === "1") {
          aksi();
          return;
        }
      } catch {
        // sessionStorage tak tersedia, lanjut ke modal
      }
      if (pinOk) {
        aksi();
        return;
      }
      pendingAksi.current = aksi;
      setPinInput("");
      setPinSalah(false);
      setPinTerbuka(true);
    },
    [pinOk]
  );

  const konfirmasiPin = useCallback(() => {
    if (pinInput === TV_PIN) {
      try {
        sessionStorage.setItem(PIN_KEY, "1");
      } catch {
        // abaikan, pinOk state tetap berlaku sesi ini
      }
      setPinOk(true);
      setPinTerbuka(false);
      setPinSalah(false);
      setPinInput("");
      const aksi = pendingAksi.current;
      pendingAksi.current = null;
      aksi?.();
    } else {
      setPinSalah(true);
    }
  }, [pinInput]);

  const ubahAzanAktifRaw = useCallback((v: boolean) => {
    setAzanAktif(v);
    void kvSet("tv-azan-aktif", v ? "1" : "0");
  }, []);

  const ubahAzanAktif = useCallback((v: boolean) => mintaPin(() => ubahAzanAktifRaw(v)), [mintaPin, ubahAzanAktifRaw]);

  const ubahAzanPilihanRaw = useCallback((i: number) => {
    try {
      previewRef.current?.pause();
    } catch {
      // abaikan
    }
    previewRef.current = null;
    setPreviewIdx(null);
    setAzanPilihan(i);
    void kvSet("tv-azan-pilihan", String(i));
  }, []);

  const ubahAzanPilihan = useCallback((i: number) => mintaPin(() => ubahAzanPilihanRaw(i)), [mintaPin, ubahAzanPilihanRaw]);

  const simpanRaw = useCallback(async () => {
    try {
      previewRef.current?.pause();
    } catch {
      // abaikan
    }
    previewRef.current = null;
    setPreviewIdx(null);
    setSaving(true);
    setPesan(null);
    try {
      await Promise.all([
        kvSet("tv-nama-masjid", nama.trim() || "Masjid"),
        kvSet("tv-background", bg),
        kvSet("tv-kota-id", kotaId),
        kvSet("tv-azan-aktif", azanAktif ? "1" : "0"),
        kvSet("tv-azan-pilihan", String(azanPilihan)),
        kvSet("tv-kutipan", JSON.stringify(daftarKutipan)),
      ]);
    } catch {
      setPesan("Penyimpanan penuh: gambar upload terlalu besar, pakai foto preset.");
    } finally {
      setSaving(false);
    }
  }, [nama, bg, kotaId, azanAktif, azanPilihan, daftarKutipan]);

  const simpan = useCallback(() => mintaPin(() => void simpanRaw()), [mintaPin, simpanRaw]);

  const tampilkanRaw = useCallback(async () => {
    await simpan();
    // Unlock audio dalam gestur klik: preload URL terpilih + resume AudioContext.
    // Tanpa ini browser memblokir play() beberapa jam kemudian (autoplay policy).
    try {
      const opt = AZAN_OPTIONS[azanPilihan] ?? AZAN_OPTIONS[0];
      const u = new Audio(opt.url);
      u.preload = "auto";
      u.volume = 0;
      void u
        .play()
        .then(() => {
          try {
            u.pause();
            u.currentTime = 0;
          } catch {
            // abaikan
          }
        })
        .catch(() => {
          // abaikan, popup tetap tampil nanti
        });
    } catch {
      // abaikan
    }
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        void ctx
          .resume()
          .catch(() => {})
          .finally(() => {
            window.setTimeout(() => {
              try {
                void ctx.close();
              } catch {
                // abaikan
              }
            }, 2000);
          });
      }
    } catch {
      // abaikan
    }
    setMode("display");
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // browser menolak (misal tanpa gestur), tetap tampil non-fullscreen
    }
  }, [simpan, azanPilihan]);

  const tampilkan = useCallback(() => mintaPin(() => void tampilkanRaw()), [mintaPin, tampilkanRaw]);

  const kembaliEditor = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => setMode("editor"));
      } else {
        setMode("editor");
      }
    } catch {
      setMode("editor");
    }
  }, []);

  const hentikanAudio = useCallback(() => {
    try {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    } catch {
      // abaikan
    }
    audioRef.current = null;
  }, []);

  // Preview manual: satu shared Audio, terpisah dari logika azan/display.
  const hentikanPreview = useCallback(() => {
    try {
      previewRef.current?.pause();
    } catch {
      // abaikan
    }
    previewRef.current = null;
    setPreviewIdx(null);
  }, []);

  const togglePreview = useCallback(
    (i: number) => {
      if (previewIdx === i) {
        hentikanPreview();
        return;
      }
      try {
        previewRef.current?.pause();
      } catch {
        // abaikan
      }
      previewRef.current = null;
      setPreviewGagal(null);
      setPreviewIdx(i);
      try {
        const a = new Audio(AZAN_OPTIONS[i]?.url ?? "");
        a.preload = "auto";
        previewRef.current = a;
        a.onended = () => {
          previewRef.current = null;
          setPreviewIdx(null);
        };
        a.onerror = () => {
          previewRef.current = null;
          setPreviewIdx(null);
          setPreviewGagal(i);
        };
        void a.play().catch(() => {
          previewRef.current = null;
          setPreviewIdx(null);
          setPreviewGagal(i);
        });
      } catch {
        previewRef.current = null;
        setPreviewIdx(null);
        setPreviewGagal(i);
      }
    },
    [previewIdx, hentikanPreview]
  );

  // Masuk display / unmount wajib menghentikan preview.
  useEffect(() => {
    if (mode === "display") hentikanPreview();
  }, [mode, hentikanPreview]);
  useEffect(() => {
    return () => {
      try {
        previewRef.current?.pause();
      } catch {
        // abaikan
      }
      previewRef.current = null;
    };
  }, []);

  // Bersihkan audio saat keluar display.
  useEffect(() => {
    if (mode === "editor") {
      try {
        audioRef.current?.pause();
      } catch {
        // abaikan
      }
      audioRef.current = null;
      setAzanPopup(null);
      setAzanKonfirm(false);
    }
  }, [mode]);

  // Fullscreen otomatis saat masuk display; exit kembali ke editor.
  useEffect(() => {
    if (mode !== "display") return;
    try {
      if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // abaikan
    }
    const onFs = () => {
      if (document.fullscreenElement === null && modeRef.current === "display") {
        setMode("editor");
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [mode]);

  // Remote TV / keyboard: ESC, Backspace, GoBack, 27/8/461/10009 -> editor.
  useEffect(() => {
    if (mode !== "display") return;
    const onKey = (e: KeyboardEvent) => {
      const code = typeof e.keyCode === "number" ? e.keyCode : -1;
      const which = typeof e.which === "number" ? e.which : -1;
      if (
        e.key === "Escape" ||
        e.key === "Backspace" ||
        e.key === "GoBack" ||
        code === 27 ||
        code === 8 ||
        code === 461 ||
        code === 10009 ||
        which === 27 ||
        which === 8 ||
        which === 461 ||
        which === 10009
      ) {
        e.preventDefault();
        kembaliEditor();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, kembaliEditor]);

  // Jadwal hari ini + refresh tiap 60 detik saat display.
  // Sengaja TIDAK me-reset ke null saat refresh agar countdown tidak berkedip.
  useEffect(() => {
    if (mode !== "display") return;
    let hidup = true;
    const ambil = async () => {
      try {
        const t = new Date(Date.now() + offsetRef.current);
        const res = await getDailySchedule(kotaId, t.getFullYear(), t.getMonth() + 1, t.getDate());
        if (hidup) setJadwal(res);
      } catch {
        // biarkan jadwal lama / skeleton
      }
    };
    void ambil();
    const t = setInterval(ambil, 60000);
    return () => {
      hidup = false;
      clearInterval(t);
    };
  }, [mode, kotaId]);

  // Jam live per detik saat display.
  useEffect(() => {
    if (mode !== "display") return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [mode]);

  // Rotasi kutipan tiap 30 detik dengan fade in/out.
  // Bila prefers-reduced-motion aktif, tukar teks polos tanpa pudar.
  useEffect(() => {
    if (mode !== "display") return;
    const n = (daftarKutipan.length ? daftarKutipan : KUTIPAN_DEFAULT).length;
    const t = setInterval(() => {
      if (reduced) {
        setKutipanIdx((i) => (i + 1) % n);
        return;
      }
      setKutipanPudar(true);
      window.setTimeout(() => {
        setKutipanIdx((i) => (i + 1) % n);
        setKutipanPudar(false);
      }, 600);
    }, 30000);
    return () => clearInterval(t);
  }, [mode, reduced, daftarKutipan.length]);

  // Geser popup azan bila toast update global tampil bersamaan.
  useEffect(() => {
    if (mode !== "display") return;
    try {
      setUpdateTampil(!!document.querySelector("[data-update-toast]"));
    } catch {
      // abaikan
    }
    const onUpdate = (e: Event) => {
      try {
        setUpdateTampil(!!(e as CustomEvent<{ tampil?: boolean }>).detail?.tampil);
      } catch {
        // abaikan
      }
    };
    window.addEventListener("tv-update-tampil", onUpdate);
    return () => window.removeEventListener("tv-update-tampil", onUpdate);
  }, [mode]);

  // Data terakhir yang valid, pemicu azan tidak boleh gagal saat refresh jalan.
  useEffect(() => {
    if (jadwal) jadwalRef.current = jadwal;
  }, [jadwal]);

  // Jadwal kota terpilih untuk status editor (cache harian, murah).
  useEffect(() => {
    if (mode !== "editor") return;
    let hidup = true;
    (async () => {
      try {
        const t = new Date();
        const res = await getDailySchedule(kotaId, t.getFullYear(), t.getMonth() + 1, t.getDate());
        if (hidup) setJadwalEditor(res);
      } catch {
        // biarkan status tanpa jam
      }
    })();
    return () => {
      hidup = false;
    };
  }, [mode, kotaId]);

  const mulaiAzan = useCallback(
    (key: PrayerKey) => {
      try {
        audioRef.current?.pause();
      } catch {
        // abaikan
      }
      audioRef.current = null;
      setAzanKonfirm(false);
      setAzanNote(null);
      // Popup SELALU tampil dulu, jangan menunggu play() sukses.
      // Jika browser memblokir audio, popup tetap muncul + catatan kecil.
      setAzanPopup(key);
      try {
        const opt = AZAN_OPTIONS[azanPilihan] ?? AZAN_OPTIONS[0];
        const a = new Audio(opt.url);
        a.preload = "auto";
        audioRef.current = a;
        // Didiamkan sampai selesai: tutup popup 1 saja, popup 2 tidak muncul.
        a.onended = () => {
          audioRef.current = null;
          setAzanPopup(null);
          setAzanNote(null);
        };
        a.onerror = () => {
          audioRef.current = null;
          setAzanNote("Audio gagal dimuat, notifikasi tetap tampil.");
        };
        void a.play().catch(() => {
          audioRef.current = null;
          setAzanNote("Suara diblokir browser, ketuk layar sekali agar audio aktif.");
        });
      } catch {
        setAzanNote("Audio gagal dimuat, notifikasi tetap tampil.");
      }
    },
    [azanPilihan]
  );

  // Penjadwalan azan: jendela catch-up 0-90 detik SETELAH waktu terjadwal,
  // sekali per hari-key. Toleran terhadap tick terlewat / throttle / detik tak pas.
  useEffect(() => {
    if (mode !== "display" || !azanSiap || !azanAktif) return;
    const data = jadwal ?? jadwalRef.current;
    if (!data) return;
    // Jam koreksi server (clamp ±5 mnt); offline -> jam lokal.
    const nowEff = new Date(now.getTime() + offsetRef.current);
    const nowMs = nowEff.getTime();
    for (const k of FARDHU_KEYS) {
      const [h, m] = normHM(data.jadwal[k]).split(":").map(Number);
      const target = new Date(nowEff);
      target.setHours(h || 0, m || 0, 0, 0);
      const deltaSec = (nowMs - target.getTime()) / 1000;
      if (deltaSec < 0 || deltaSec > 90) continue;
      const gid = kunciTanggal(target) + "-" + k;
      if (azanTelahBunyi.current.has(gid)) return;
      azanTelahBunyi.current.add(gid);
      (async () => {
        try {
          const last = await kvGet("tv-azan-terakhir");
          if (last === gid) return;
          await kvSet("tv-azan-terakhir", gid);
          mulaiAzan(k);
        } catch {
          mulaiAzan(k);
        }
      })();
      return;
    }
  }, [now, mode, jadwal, azanAktif, azanSiap, mulaiAzan]);

  // Hook tes (non-prod saja): /tv?azanDemo=1 langsung picu popup 1 + audio di mode display.
  useEffect(() => {
    if (!ALLOW_DEMO) return;
    if (mode !== "display" || azanDemoFired.current) return;
    let params: URLSearchParams | null = null;
    try {
      params = new URLSearchParams(window.location.search);
    } catch {
      return;
    }
    if (params.get("azanDemo") !== "1") return;
    azanDemoFired.current = true;
    const t = window.setTimeout(() => {
      try {
        const data = jadwalRef.current ?? jadwal;
        let key: PrayerKey = "dzuhur";
        if (data) key = fardhuBerikut(data.jadwal, new Date(Date.now() + offsetRef.current)).key;
        mulaiAzan(key);
      } catch {
        mulaiAzan("dzuhur");
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [mode, jadwal, mulaiAzan]);

  const pilihKota = (id: string, lokasi: string) => {
    setKotaId(id);
    setKotaNama(lokasi || id);
    setKeyword("");
    setHasil([]);
  };

  const simpanDaftarKutipan = useCallback((arr: string[]) => {
    setDaftarKutipan(arr);
    setKutipanIdx(0);
    void kvSet("tv-kutipan", JSON.stringify(arr));
  }, []);

  const tambahKutipanRaw = useCallback(() => {
    const teks = draftKutipan.trim().slice(0, 160);
    if (!teks || daftarKutipan.length >= 20) return;
    setDraftKutipan("");
    simpanDaftarKutipan([...daftarKutipan, teks]);
  }, [draftKutipan, daftarKutipan, simpanDaftarKutipan]);

  const tambahKutipan = useCallback(() => mintaPin(tambahKutipanRaw), [mintaPin, tambahKutipanRaw]);

  const hapusKutipan = useCallback(
    (i: number) => mintaPin(() => simpanDaftarKutipan(daftarKutipan.filter((_, j) => j !== i))),
    [mintaPin, daftarKutipan, simpanDaftarKutipan]
  );

  const onFile = async (f: File | undefined) => {
    if (!f || !f.type.startsWith("image/")) {
      setPesan("Pilih berkas gambar (JPG/PNG/WebP).");
      return;
    }
    try {
      setPesan("Mengompres gambar…");
      const kecil = await shrinkImage(f);
      setBg(kecil);
      setPesan("Foto latar dipakai. Klik “Tampilkan di TV” untuk menyimpan.");
    } catch {
      setPesan("Gambar gagal dibaca. Coba foto lain.");
    }
  };

  // ---------- DISPLAY ----------
  if (mode === "display") {
    // Stabil: tidak ada key per detik, tidak ada animasi, teks polos saja.
    // nowEff = jam koreksi server (clamp ±5 mnt), offline -> jam lokal.
    const nowEff = new Date(now.getTime() + offsetMs);
    const info = jadwal ? periodeTv(jadwal.jadwal, nowEff) : null;
    const azanBerikut = jadwal ? fardhuBerikut(jadwal.jadwal, nowEff) : null;
    const daftarAktif = daftarKutipan.length ? daftarKutipan : KUTIPAN_DEFAULT;
    const teksKutipan = daftarAktif[kutipanIdx % daftarAktif.length];
    const azanOffset = updateTampil ? "top-64" : "top-4";
    return (
      <main className="kawung-dark fixed inset-0 overflow-hidden bg-[#0B1F1A] text-[#F6F1E7]" aria-label="Display TV jadwal sholat">
        {/* Latar + overlay gelap */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071410] via-[#0B1F1A] to-[#071410]" aria-hidden />
        <SafeImage
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F1A]/80 via-[#0B1F1A]/55 to-[#0B1F1A]/90" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-[#E8A33D] to-transparent" aria-hidden />

        {/* POPUP 1: azan mulai */}
        {azanPopup && (
          <div className={"absolute inset-x-0 z-30 flex justify-center px-4 " + azanOffset} role="alertdialog" aria-label={"Azan " + (PRAYER_LABEL[azanPopup] ?? azanPopup)}>
            <div className="w-full max-w-md rounded-3xl border border-[#E8A33D]/60 bg-[#0E2A22] px-6 py-5 text-center shadow-2xl">
              <p className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">AZAN {PRAYER_LABEL[azanPopup]?.toUpperCase()}</p>
              <p className="font-display mt-1 text-2xl">Azan {PRAYER_LABEL[azanPopup]}</p>
              {azanNote && (
                <p className="mt-2 text-xs leading-relaxed text-[#F6F1E7]/70" role="status">
                  {azanNote}
                </p>
              )}
              <button
                onClick={() => {
                  setAzanPopup(null);
                  setAzanNote(null);
                  setAzanKonfirm(true);
                }}
                className="mt-4 w-full rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
              >
                Oke
              </button>
            </div>
          </div>
        )}

        {/* POPUP 2: konfirmasi hentikan */}
        {azanKonfirm && (
          <div className={"absolute inset-x-0 z-30 flex justify-center px-4 " + azanOffset} role="alertdialog" aria-label="Hentikan suara azan">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0E2A22] px-6 py-5 text-center shadow-2xl">
              <p className="font-display text-xl">Apakah ingin menghentikan Suara Azan?</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    hentikanAudio();
                    setAzanKonfirm(false);
                  }}
                  className="rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
                >
                  Iya
                </button>
                <button
                  onClick={() => setAzanKonfirm(false)}
                  className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-[#F6F1E7] hover:bg-white/10"
                >
                  Tidak
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 py-6 md:px-12 md:py-8">
          {/* Bar atas */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] text-[#E8A33D] md:text-xs">
                ARAHKHATAM • DISPLAY MASJID
              </p>
              <h1 className="font-display mt-1 text-3xl leading-tight md:text-5xl">{nama.trim() || "Masjid"}</h1>
              <p className="mt-1 text-sm text-[#F6F1E7]/75 md:text-base">
                {jadwal?.lokasi ?? kotaNama} • {fmtMasehi(nowEff)} • {formatHijriah(nowEff)}
              </p>
            </div>
            <p className="max-w-[240px] text-right text-xs leading-relaxed text-[#F6F1E7]/60 max-md:hidden">
              Tekan ESC / tombol Kembali pada remote untuk keluar
              {wakeLocked && <span className="mt-1 block text-[#E8A33D]/80">● Layar tetap menyala</span>}
            </p>
          </div>

          {/* Grid 8 waktu - highlight periode AKTIF sama seperti landing */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8 md:gap-3" role="list" aria-label="Jadwal 8 waktu hari ini">
            {PRAYER_ORDER.map((k) => {
              const isAktif = info?.aktif === k;
              return (
                <div
                  key={k}
                  role="listitem"
                  className={
                    "rounded-2xl border px-2 py-3 text-center backdrop-blur-sm md:py-4 " +
                    (isAktif
                      ? "border-[#E8A33D] bg-[#E8A33D] text-[#0B1F1A]"
                      : "border-white/15 bg-black/40 text-[#F6F1E7]")
                  }
                >
                  <p className={"text-xs font-bold tracking-widest md:text-sm " + (isAktif ? "" : "text-[#E8A33D]")}>
                    {PRAYER_LABEL[k].toUpperCase()}
                  </p>
                  <p className="font-display mt-1 text-2xl tabular-nums md:text-4xl">
                    {jadwal ? jadwal.jadwal[k] : "--:--"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Kutipan: antara grid dan countdown, fade in/out, polos bila reduced */}
          <p
            className={
              "font-display mx-auto mt-3 max-w-3xl px-2 text-center text-lg italic leading-relaxed text-[#F6F1E7]/70 md:text-2xl " +
              (reduced ? "" : "transition-opacity duration-700 ") +
              (kutipanPudar && !reduced ? "opacity-0" : "opacity-100")
            }
          >
            &ldquo;{teksKutipan}&rdquo;
          </p>

          {/* Jam + countdown di bawah (polos, tanpa animasi) */}
          <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
            <p className="font-display text-[20vw] leading-none tabular-nums sm:text-8xl md:text-[10rem]" aria-live="off">
              {fmtClock(nowEff)}
            </p>
            <div className="mt-4 rounded-3xl border border-[#E8A33D]/40 bg-black/40 px-8 py-4 backdrop-blur-sm">
              {info && jadwal ? (
                <>
                  <p className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">
                    {(PRAYER_LABEL[info.berikut] ?? String(info.berikut)).toUpperCase()} • {jadwal.jadwal[info.berikut]}
                  </p>
                  <p className="font-display mt-1 text-4xl tabular-nums md:text-6xl">
                    −{fmtCount(info.diffSec)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">MENYIAPKAN JADWAL</p>
                  <p className="font-display mt-1 text-4xl tabular-nums md:text-6xl">--:--:--</p>
                </>
              )}
            </div>
            <p className="mt-3 text-xs text-[#F6F1E7]/60" role="status">
              {!azanSiap
                ? "Memuat status azan…"
                : azanAktif && azanBerikut
                  ? "Azan aktif • berikutnya " + (PRAYER_LABEL[azanBerikut.key] ?? azanBerikut.key) + " " + azanBerikut.jam
                  : azanAktif
                    ? "Azan aktif • memuat jadwal…"
                    : "Azan nonaktif"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ---------- EDITOR ----------
  return (
    <main className="kawung-dark min-h-screen bg-[#0B1F1A] px-5 py-10 text-[#F6F1E7]">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold tracking-[0.3em] text-[#E8A33D]">ARAHKHATAM • DISPLAY TV</p>
        <h1 className="font-display mt-2 text-3xl md:text-5xl">Siapkan layar masjid</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#F6F1E7]/70 md:text-base">
          Atur nama, foto latar, dan kota. Lalu tampilkan fullscreen di TV, jam live,
          countdown, dan 8 waktu hari ini muncul otomatis.
        </p>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7" aria-label="Nama masjid">
          <label htmlFor="tv-nama" className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">
            NAMA MASJID
          </label>
          <input
            id="tv-nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            maxLength={60}
            placeholder="Masjid Al-Ikhlas"
            className="font-display mt-2 w-full rounded-2xl border border-white/15 bg-[#071410] px-4 py-3 text-xl outline-none placeholder:text-[#F6F1E7]/30 focus:border-[#E8A33D] max-md:min-h-[52px] max-md:text-lg"
          />
        </section>

        <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7" aria-label="Kutipan display">
          <label htmlFor="tv-kutipan-input" className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">
            KUTIPAN
          </label>
          <div className="mt-3 flex flex-col gap-2" aria-live="polite">
            {daftarKutipan.map((item, i) => (
              <span
                key={i + "-" + item}
                className="font-display inline-flex items-start gap-2 rounded-2xl border border-[#E8A33D]/50 bg-[#E8A33D]/10 px-4 py-2 text-sm italic"
              >
                <span className="min-w-0 flex-1 break-words">&ldquo;{item}&rdquo;</span>
                <button
                  onClick={() => hapusKutipan(i)}
                  aria-label={"Hapus kutipan " + (i + 1)}
                  className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold not-italic hover:bg-white/20"
                >
                  X
                </button>
              </span>
            ))}
            {daftarKutipan.length === 0 && (
              <span className="text-xs text-[#F6F1E7]/60">
                Belum ada kutipan kustom. Kosong = rotasi otomatis dari daftar bawaan.
              </span>
            )}
          </div>
          <input
            id="tv-kutipan-input"
            value={draftKutipan}
            onChange={(e) => setDraftKutipan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                tambahKutipan();
              } else if (e.key === "Backspace" && draftKutipan === "" && daftarKutipan.length > 0) {
                e.preventDefault();
                hapusKutipan(daftarKutipan.length - 1);
              }
            }}
            maxLength={160}
            placeholder="Ketik kutipan lalu tekan Enter."
            className="mt-3 w-full rounded-2xl border border-white/15 bg-[#071410] px-4 py-3 text-sm outline-none placeholder:text-[#F6F1E7]/30 focus:border-[#E8A33D] max-md:min-h-[52px] max-md:text-base"
          />
          <p className="mt-2 text-xs text-[#F6F1E7]/60">
            Enter = tambah bar. Backspace saat kosong = hapus bar terakhir.
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7" aria-label="Latar foto">
          <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">LATAR FOTO</p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {PRESETS.map((p) => {
              const aktif = bg === p.src;
              return (
                <button
                  key={p.src}
                  onClick={() => setBg(p.src)}
                  aria-pressed={aktif}
                  className={
                    "group overflow-hidden rounded-2xl border-2 text-left " +
                    (aktif ? "border-[#E8A33D]" : "border-white/10 hover:border-white/30")
                  }
                >
                  <SafeImage src={p.src} alt={p.label} className="aspect-video w-full object-cover" />
                  <span className={"block px-3 py-2 text-xs font-bold " + (aktif ? "bg-[#E8A33D] text-[#0B1F1A]" : "text-[#F6F1E7]/80")}>
                    {aktif ? "✓ " : ""}{p.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Unggah foto latar, seret atau klik"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void onFile(e.dataTransfer.files?.[0]);
            }}
            className={
              "mt-3 cursor-pointer rounded-2xl border-2 border-dashed px-4 py-6 text-center text-sm max-md:min-h-[96px] max-md:py-8 " +
              (dragOver ? "border-[#E8A33D] bg-[#E8A33D]/10" : "border-white/20 text-[#F6F1E7]/70 hover:border-[#E8A33D]/60")
            }
          >
            Seret foto ke sini, atau <span className="font-bold text-[#E8A33D]">klik untuk pilih</span>
            <span className="mt-1 block text-xs opacity-70">Otomatis dikecilkan (max 1920px, JPEG) agar muat penyimpanan.</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          {!PRESETS.some((p) => p.src === bg) && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-[#E8A33D]/50">
              <SafeImage src={bg} alt="Pratinjau latar unggahan" className="aspect-video w-full object-cover" />
              <p className="bg-[#E8A33D] px-3 py-2 text-xs font-bold text-[#0B1F1A]">✓ Foto unggahan dipakai</p>
            </div>
          )}
        </section>

        <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7" aria-label="Pilih kota">
          <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">KOTA</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEFAULT_CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => pilihKota(c.id, c.nama)}
                aria-pressed={kotaId === c.id}
                className={
                  "rounded-full px-4 py-2 text-sm font-bold max-md:min-h-[44px] " +
                  (kotaId === c.id ? "bg-[#E8A33D] text-[#0B1F1A]" : "border border-white/20 text-[#F6F1E7]/85 hover:bg-white/10")
                }
              >
                {c.nama.replace("KOTA ", "").charAt(0) + c.nama.replace("KOTA ", "").slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <label htmlFor="tv-cari" className="mt-4 block text-xs font-bold tracking-widest text-[#F6F1E7]/60">
            CARI KOTA LAIN
          </label>
          <input
            id="tv-cari"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="cth: Yogyakarta"
            className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071410] px-4 py-3 text-sm outline-none placeholder:text-[#F6F1E7]/30 focus:border-[#E8A33D] max-md:min-h-[52px] max-md:text-base"
          />
          {mencari && <p className="mt-2 text-xs text-[#F6F1E7]/60">Mencari…</p>}
          {hasil.length > 0 && (
            <ul className="mt-2 max-h-52 overflow-auto rounded-2xl border border-white/10 bg-[#071410]">
              {hasil.map((k) => (
                <li key={k.id}>
                  <button
                    onClick={() => pilihKota(k.id, k.lokasi)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10"
                  >
                    {k.lokasi} <span className="text-[#F6F1E7]/40">• {k.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-[#F6F1E7]/75">
            Dipilih: <strong className="text-[#E8A33D]">{kotaNama}</strong> <span className="opacity-60">({kotaId})</span>
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7" aria-label="Suara azan">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">SUARA AZAN</p>
            <button
              role="switch"
              aria-checked={azanAktif}
              onClick={() => ubahAzanAktif(!azanAktif)}
              className={
                "rounded-full px-4 py-2 text-sm font-bold " +
                (azanAktif ? "bg-[#E8A33D] text-[#0B1F1A]" : "border border-white/20 text-[#F6F1E7]/85 hover:bg-white/10")
              }
            >
              {azanAktif ? "Aktif" : "Nonaktif"}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#F6F1E7]/60">
            Bunyi hanya untuk 5 waktu fardhu (Subuh, Dzuhur, Ashar, Maghrib, Isya). Waktu sunnah tidak berbunyi.
          </p>
          <p className="mt-2 rounded-2xl border border-white/10 bg-[#071410] px-4 py-2.5 text-xs" role="status">
            {(() => {
              if (!azanSiap) return <span className="text-[#F6F1E7]/60">Memuat status azan…</span>;
              if (!azanAktif) return <span className="text-[#F6F1E7]/70">Azan nonaktif</span>;
              if (!jadwalEditor)
                return <span className="text-[#F6F1E7]/70">Azan aktif • memuat jadwal…</span>;
              try {
                const b = fardhuBerikut(jadwalEditor.jadwal, new Date());
                return (
                  <span className="text-[#F6F1E7]/85">
                    Azan aktif • berikutnya{" "}
                    <strong className="text-[#E8A33D]">
                      {PRAYER_LABEL[b.key] ?? b.key} {b.jam}
                    </strong>
                  </span>
                );
              } catch {
                return <span className="text-[#F6F1E7]/70">Azan aktif</span>;
              }
            })()}
          </p>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label="Pilih suara azan">
            {AZAN_OPTIONS.map((o, i) => {
              const dipilih = azanPilihan === i;
              const diputar = previewIdx === i;
              return (
                <div
                  key={o.url}
                  className={
                    "rounded-2xl border px-4 py-3 " +
                    (dipilih ? "border-[#E8A33D] bg-[#E8A33D]/10" : "border-white/10")
                  }
                >
                  <div className="flex items-center gap-2 max-md:flex-col max-md:items-stretch max-md:gap-3">
                    <button
                      role="radio"
                      aria-checked={dipilih}
                      onClick={() => ubahAzanPilihan(i)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block text-sm font-bold">
                        {dipilih ? "✓ " : ""}[{i}] {o.nama}
                      </span>
                      <span className="mt-1 block text-[11px] text-[#F6F1E7]/60">
                        {o.atribusiUrl ? (
                          <a href={o.atribusiUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="underline hover:text-[#E8A33D]">
                            {o.atribusi}
                          </a>
                        ) : (
                          o.atribusi
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => togglePreview(i)}
                      aria-pressed={diputar}
                      aria-label={(diputar ? "Hentikan pratinjau " : "Coba pratinjau ") + o.nama}
                      className={
                        "shrink-0 rounded-full px-4 py-2 text-xs font-bold max-md:min-h-[48px] max-md:w-full max-md:py-3 max-md:text-sm " +
                        (diputar ? "bg-white/15 text-[#F6F1E7] hover:bg-white/25" : "bg-[#E8A33D] text-[#0B1F1A] hover:bg-[#f2b558]")
                      }
                    >
                      {diputar ? "■ Stop" : "▶ Coba"}
                    </button>
                  </div>
                  <p className="mt-1 min-h-[1rem] text-[11px]" aria-live="polite">
                    {diputar && <span className="font-bold text-[#E8A33D]">• Sedang diputar…</span>}
                    {!diputar && previewGagal === i && <span className="text-red-300">Gagal memuat audio, coba lagi.</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {pesan && <p className="mt-4 rounded-2xl border border-[#E8A33D]/40 bg-[#E8A33D]/10 px-4 py-3 text-sm" role="status">{pesan}</p>}

        <button
          onClick={tampilkan}
          disabled={saving}
          className="mt-6 w-full rounded-full bg-[#E8A33D] px-6 py-4 text-base font-bold text-[#0B1F1A] hover:bg-[#f2b558] disabled:opacity-60 max-md:sticky max-md:bottom-4 max-md:z-30 max-md:min-h-[56px]"
        >
          {saving ? "Menyimpan…" : "Tampilkan di TV ⛶"}
        </button>
        <p className="mt-2 text-center text-xs text-[#F6F1E7]/50">Masuk fullscreen otomatis. Tekan ESC untuk kembali ke editor.</p>

        {pinTerbuka && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" role="alertdialog" aria-label="Masukkan PIN">
            <div className="w-full max-w-xs rounded-3xl border border-white/15 bg-[#0E2A22] p-5 text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">PIN DIBUTUHKAN</p>
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    konfirmasiPin();
                  }
                }}
                placeholder="PIN"
                aria-label="PIN"
                className="mt-3 w-full rounded-2xl border border-white/15 bg-[#071410] px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-[#E8A33D]"
              />
              {pinSalah && <p className="mt-2 text-xs text-red-300" role="status">PIN salah, coba lagi.</p>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={konfirmasiPin}
                  className="rounded-full bg-[#E8A33D] px-4 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
                >
                  OK
                </button>
                <button
                  onClick={() => {
                    setPinTerbuka(false);
                    setPinSalah(false);
                    setPinInput("");
                    pendingAksi.current = null;
                  }}
                  className="rounded-full border border-white/25 px-4 py-2.5 text-sm font-bold text-[#F6F1E7] hover:bg-white/10"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
