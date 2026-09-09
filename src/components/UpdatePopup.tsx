"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { kvSet } from "@/lib/db";

// Notifikasi update global. Versi pertama yang terlihat saat boot jadi acuan.
// Poll tiap 15 detik plus saat tab fokus. Bila versi server beda dari acuan,
// tampil panel kecil di atas-tengah layar pada semua ukuran.
// Isi: judul PEMBARUAN TERSEDIA, teks ajakan refresh, hitung mundur 5 detik
// lalu hilang otomatis, tanpa reload paksa. Ada tombol Refresh sekarang dan
// tombol tutup X. SFX basmalah bunyi sekali saat notifikasi muncul.
// Versi yang sudah hilang tidak dimunculkan lagi sampai ada versi yang beda.
// Versi terlihat tetap disimpan di IndexedDB agar semua tab ikut sinkron.
const SEEN_KEY = "versi-terlihat";
const CDN_FALLBACK =
  "https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3";

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

export default function UpdatePopup() {
  const [version, setVersion] = useState<string | null>(null);
  const [count, setCount] = useState(5);
  const [show, setShow] = useState(false);
  const baseline = useRef<string | null>(null);
  const pathname = usePathname();
  // Di /tv popup tetap muncul tapi bisu agar display masjid tidak berbunyi.
  const bisu = (pathname ?? "").startsWith("/tv");
  const bisuRef = useRef(bisu);
  bisuRef.current = bisu;

  useEffect(() => {
    // Mode uji coba: buka /?demoUpdate=1 untuk melihat notifikasi
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

    let timer: ReturnType<typeof setInterval>;
    const check = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const json = await res.json();
        const v = String(json.version ?? "");
        if (!v) return;
        try {
          await kvSet(SEEN_KEY, v);
        } catch {
          // abaikan, lanjut walau IndexedDB gagal
        }
        if (baseline.current === null) {
          baseline.current = v;
          return;
        }
        if (v !== baseline.current) {
          setVersion(v);
          setShow(true);
          if (!bisuRef.current) playSfx();
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
    };
  }, []);

  // Hitung mundur 5 detik lalu hilang otomatis, tanpa reload paksa.
  // Acuan maju ke versi ini agar tidak muncul lagi sampai ada versi yang beda.
  useEffect(() => {
    if (!show) return;
    setCount(5);
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(t);
          if (version) baseline.current = version;
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
    if (version) baseline.current = version;
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
              const params = new URLSearchParams(window.location.search);
              if (params.get("demoUpdate") === "1") {
                window.location.replace(window.location.pathname);
                return;
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
