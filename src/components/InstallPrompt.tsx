"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Minimal lokal, tanpa lib baru.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  try {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches
    );
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [siap, setSiap] = useState(false);
  const [tutup, setTutup] = useState(false); // in-memory saja: refresh → muncul lagi
  const [terpasang, setTerpasang] = useState<boolean>(() => isStandalone());
  const eventRef = useRef<BeforeInstallPromptEvent | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return;
    const onPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch {
        // abaikan
      }
      eventRef.current = e as BeforeInstallPromptEvent;
      setSiap(true);
    };
    const onInstalled = () => {
      eventRef.current = null;
      setSiap(false);
      setTerpasang(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const pasang = useCallback(async () => {
    const ev = eventRef.current;
    if (!ev) return;
    try {
      await ev.prompt();
      const pilih = await ev.userChoice;
      if (pilih && pilih.outcome === "accepted") {
        eventRef.current = null;
        setSiap(false);
      }
    } catch {
      // abaikan, popup tetap tampil
    }
  }, []);

  if (terpasang || tutup || !siap) return null;
  if (typeof pathname === "string" && pathname.startsWith("/tv")) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md"
      role="dialog"
      aria-label="Pasang aplikasi"
    >
      <div className="rounded-3xl border border-[#E8A33D]/40 bg-[#0B1F1A] p-4 text-[#F6F1E7] shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Pasang ArahKhatam?</p>
            <p className="mt-1 text-xs leading-relaxed text-[#F6F1E7]/70">
              Akses jadwal sholat & kiblat lebih cepat dari layar utama.
            </p>
          </div>
          <button
            onClick={() => setTutup(true)}
            aria-label="Tutup"
            className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-[#F6F1E7]/80 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <button
          onClick={() => void pasang()}
          className="mt-3 w-full rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
