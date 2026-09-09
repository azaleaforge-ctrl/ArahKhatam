"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { clearScheduleCache, kvSet } from "@/lib/db";

// Notifikasi update global. Versi pertama yang terlihat saat boot jadi acuan.
// Poll tiap 15 detik plus saat tab fokus. Bila versi server beda dari acuan,
// tampil panel kecil di atas-tengah layar pada semua ukuran.
// Isi: judul PEMBARUAN TERSEDIA, teks ajakan refresh, hitung mundur 5 detik
// lalu hilang otomatis, tanpa reload paksa. Ada tombol Refresh sekarang dan
// tombol tutup X. SFX basmalah bunyi sekali saat notifikasi muncul.
// Versi yang sudah hilang tidak dimunculkan lagi dalam sesi yang sama
// (sessionStorage), acuan hanya maju saat reload. Versi terlihat tetap
// disimpan di IndexedDB + mirror localStorage agar semua tab ikut sinkron
// via BroadcastChannel dan storage event.
const SEEN_KEY = "versi-terlihat";
const LS_KEY = "ws:" + SEEN_KEY;
const BC_NAME = "arahkhatam-update";
const CDN_FALLBACK =
  "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3";

// Backdoor demo hanya di non-prod (atau NEXT_PUBLIC_ALLOW_DEMO=1). Di prod param diabaikan.
const ALLOW_DEMO =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ALLOW_DEMO === "1";

function playSfx() {
  try {
    const a = new Audio("/sfx/bismillah.mp3");
    a.addEventListener("error", () => {
      try {
        const fb = new Audio(CDN_FALLBACK);
        void fb.play().catch(() => {
          // browser memblokir autoplay sebelum interaksi, abaikan
        });
      } catch {
        // abaikan
      }
    });
    void a.play().catch(() => {
      // browser memblokir autoplay sebelum interaksi, abaikan
    });
  } catch {
    // Audio tidak tersedia, abaikan
  }
}

function readSeenSync(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

function isDismissed(v: string): boolean {
  try {
    return sessionStorage.getItem("update-dismissed-" + v) === "1";
  } catch {
    return false;
  }
}

function markDismissed(v: string) {
  try {
    sessionStorage.setItem("update-dismissed-" + v, "1");
  } catch {
    // abaikan, mode privat
  }
}

export default function UpdatePopup() {
  const [version, setVersion] = useState<string | null>(null);
  const [count, setCount] = useState(5);
  const [show, setShow] = useState(false);
  const baseline = useRef<string | null>(null);
  // Boot sinkron: acuan dibaca dari mirror localStorage agar semua tab/reload satu suara.
  if (baseline.current === null) {
    const s = readSeenSync();
    if (s) baseline.current = s;
  }
  const lastShown = useRef<string | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const pathname = usePathname();
  // Di /tv popup tetap muncul tapi bisu agar display masjid tidak berbunyi.
  const bisu = (pathname ?? "").startsWith("/tv");
  const bisuRef = useRef(bisu);
  bisuRef.current = bisu;

  useEffect(() => {
    // Mode uji coba (non-prod saja): buka /?demoUpdate=1 untuk melihat notifikasi
    if (ALLOW_DEMO) {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("demoUpdate") === "1") {
          baseline.current = "demo-dasar";
          setVersion("demo-baru");
          setShow(true);
          if (!bisuRef.current) playSfx();
          return;
        }
      } catch {
        // abaikan, lanjut ke cek versi normal
      }
    }

    const announce = async (v: string, broadcast: boolean) => {
      if (!v || v === baseline.current) return;
      if (lastShown.current === v) return;
      if (isDismissed(v)) return;
      lastShown.current = v;
      try {
        await clearScheduleCache();
      } catch {
        // abaikan, lanjut walau cache gagal dibersihkan
      }
      try {
        await kvSet(SEEN_KEY, v);
      } catch {
        // abaikan, lanjut walau IndexedDB gagal
      }
      if (broadcast) {
        try {
          bcRef.current?.postMessage({ version: v });
        } catch {
          // abaikan
        }
      }
      setVersion(v);
      setShow(true);
      if (!bisuRef.current) playSfx();
    };

    try {
      const bc = new BroadcastChannel(BC_NAME);
      bcRef.current = bc;
      bc.onmessage = (ev) => {
        try {
          const v = String((ev.data as { version?: unknown } | null)?.version ?? "");
          if (v) void announce(v, false);
        } catch {
          // abaikan
        }
      };
    } catch {
      bcRef.current = null;
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key !== LS_KEY || !e.newValue) return;
      void announce(e.newValue, false);
    };
    window.addEventListener("storage", onStorage);

    let timer: ReturnType<typeof setInterval>;
    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const json = await res.json();
        const v = String(json.version ?? "");
        if (!v) return;
        if (baseline.current === null) {
          baseline.current = v;
          try {
            await kvSet(SEEN_KEY, v);
          } catch {
            // abaikan, lanjut walau IndexedDB gagal
          }
          return;
        }
        if (v !== baseline.current) {
          await announce(v, true);
        }
      } catch {
        // abaikan, coba lagi pada interval berikut
      }
    };

    void check();
    timer = setInterval(check, 15000);
    const onFocus = () => {
      void check();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void check();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      try {
        bcRef.current?.close();
      } catch {
        // abaikan
      }
      bcRef.current = null;
    };
  }, []);

  // Hitung mundur 5 detik lalu hilang otomatis, tanpa reload paksa.
  // Acuan TIDAK maju di sini; sesi ini ditandai dismissed agar tidak nagging.
  // Acuan hanya maju saat reload (boot baca versi baru dari localStorage).
  useEffect(() => {
    if (!show) return;
    setCount(5);
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(t);
          if (version) markDismissed(version);
          setShow(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [show, version]);

  // Kabari halaman TV agar popup azan bisa geser saat tampil bersamaan.
  // Tidak menyentuh fullscreen, tidak reload, hanya event satu arah.
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("tv-update-tampil", { detail: { tampil: show } }));
    } catch {
      // abaikan
    }
  }, [show]);

  const dismiss = () => {
    if (version) markDismissed(version);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div data-update-toast="1" className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center p-3">
      <div
        className="update-toast pointer-events-auto w-full max-w-md rounded-3xl border border-[#E8A33D]/40 bg-[#0E2A22] p-5 shadow-2xl"
        role="status"
        aria-live="polite"
        aria-label="Pembaruan tersedia"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">PEMBARUAN TERSEDIA</p>
            <p className="mt-2 text-sm leading-relaxed text-[#F6F1E7]/85">
              Ada update, silahkan refresh halaman agar fitur terbaru masuk.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Tutup notifikasi"
            className="pressable shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-[#F6F1E7] hover:bg-white/20"
          >
            X
          </button>
        </div>
        <p className="mt-2 text-xs tabular-nums text-[#F6F1E7]/60">Hilang dalam {count} detik</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full w-full origin-left rounded-full bg-[#E8A33D]"
            style={{ transform: "scaleX(" + count / 5 + ")", transition: "transform 1s linear" }}
          />
        </div>
        <button
          onClick={() => {
            try {
              if (ALLOW_DEMO) {
                const params = new URLSearchParams(window.location.search);
                if (params.get("demoUpdate") === "1") {
                  window.location.replace(window.location.pathname);
                  return;
                }
              }
            } catch {
              // abaikan, lanjut reload biasa
            }
            window.location.reload();
          }}
          className="pressable mt-3 w-full rounded-full bg-[#E8A33D] px-5 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
        >
          Refresh sekarang
        </button>
      </div>
    </div>
  );
}
