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

export function useInstallPrompt() {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const eventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return;
    const onPrompt = (e: Event) => {
      try {
        e.preventDefault();
      } catch {
        // abaikan
      }
      eventRef.current = e as BeforeInstallPromptEvent;
      setInstallable(true);
    };
    const onInstalled = () => {
      eventRef.current = null;
      setInstallable(false);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    const ev = eventRef.current;
    if (!ev) return;
    try {
      await ev.prompt();
      const pilih = await ev.userChoice;
      if (pilih && pilih.outcome === "accepted") {
        eventRef.current = null;
        setInstallable(false);
      }
    } catch {
      // abaikan
    }
  }, []);

  return { installable, installed, install };
}

export default useInstallPrompt;
