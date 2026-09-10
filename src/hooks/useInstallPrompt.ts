"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal lokal, tanpa dep baru.
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

const FLAG = "arahkhatam-installed";

function bacaFlag(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

function tulisFlag(): void {
  try {
    localStorage.setItem(FLAG, "1");
  } catch {
    // abaikan (mode privat)
  }
}

function hapusFlag(): void {
  try {
    localStorage.removeItem(FLAG);
  } catch {
    // abaikan
  }
}

export function useInstallPrompt() {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone() || bacaFlag());
  const [canPrompt, setCanPrompt] = useState(false);
  const eventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return;
    const onPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch {
        // abaikan
      }
      // SELF-HEALING: event = Chrome menyatakan belum terinstal → bersihkan flag basi.
      hapusFlag();
      setInstalled(false);
      eventRef.current = e as BeforeInstallPromptEvent;
      setInstallable(true);
      setCanPrompt(true);
    };
    const onInstalled = () => {
      eventRef.current = null;
      setInstallable(false);
      setCanPrompt(false);
      tulisFlag();
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // "prompted": prompt native jalan; "manual": tak ada event (browser tua/sudah terinstal/iOS).
  const install = useCallback(async (): Promise<"prompted" | "manual"> => {
    const ev = eventRef.current;
    if (!ev) return "manual";
    try {
      await ev.prompt();
      const pilih = await ev.userChoice;
      if (pilih && pilih.outcome === "accepted") {
        eventRef.current = null;
        setInstallable(false);
        setCanPrompt(false);
        tulisFlag();
        setInstalled(true);
      }
      return "prompted";
    } catch {
      return "manual";
    }
  }, []);

  return { installable, installed, canPrompt, install };
}

export default useInstallPrompt;
