"use client";

import { useEffect, useRef, useState } from "react";

type WakeLockSentinelLike = { release: () => Promise<void> };

type NavWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

function hasWakeLock(nav: Navigator): nav is NavWithWakeLock & { wakeLock: NonNullable<NavWithWakeLock["wakeLock"]> } {
  return "wakeLock" in nav && !!(nav as NavWithWakeLock).wakeLock?.request;
}

// Fallback iOS/Safari lama: video bisu 1px looping cegah sleep.
function ensureFallbackVideo(): HTMLVideoElement | null {
  try {
    let v = document.querySelector<HTMLVideoElement>("[data-wakelock-fallback]");
    if (v) return v;
    v = document.createElement("video");
    v.setAttribute("data-wakelock-fallback", "1");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    (v as HTMLVideoElement & { disablePictureInPicture?: boolean }).disablePictureInPicture = true;
    v.setAttribute("aria-hidden", "true");
    // honey: 1px offscreen, no layout impact; remove if Safari adds WakeLock.
    v.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0;";
    // honey: tiny silent mp4 data URI; play().catch ignored if codec unsupported.
    v.src =
      "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAAAAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAG21kYXQAAAAAAAAAAgAAAAE=";
    document.body.appendChild(v);
    return v;
  } catch {
    return null;
  }
}

export function useScreenWakeLock(active: boolean): { supported: boolean; locked: boolean } {
  const [supported, setSupported] = useState(false);
  const [locked, setLocked] = useState(false);
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof document === "undefined") return;
    setSupported(hasWakeLock(navigator));

    let dead = false;
    const acquire = async () => {
      if (!activeRef.current) return;
      if (document.visibilityState !== "visible") return;
      try {
        if (!hasWakeLock(navigator)) return;
        if (sentinelRef.current) return;
        const s = await navigator.wakeLock.request("screen");
        if (dead || !activeRef.current) {
          try {
            await s.release();
          } catch {
            // abaikan
          }
          return;
        }
        sentinelRef.current = s;
        setLocked(true);
        s.release = s.release.bind(s);
        // Sentinel auto-release oleh OS tidak ada event; poll ringan via visibility/fullscreen saja.
      } catch {
        // NotAllowedError/NotSupportedError: fallback video saja, tanpa crash.
      }
    };
    const release = async () => {
      const s = sentinelRef.current;
      sentinelRef.current = null;
      if (!s) return;
      try {
        await s.release();
      } catch {
        // abaikan
      } finally {
        if (!dead) setLocked(false);
      }
    };
    const stopFallback = () => {
      try {
        const v = document.querySelector<HTMLVideoElement>("[data-wakelock-fallback]");
        v?.pause();
      } catch {
        // abaikan
      }
    };
    const startFallback = () => {
      try {
        const v = ensureFallbackVideo();
        void v?.play().catch(() => {});
      } catch {
        // abaikan
      }
    };

    if (active) {
      void acquire();
      startFallback();
    } else {
      void release();
      stopFallback();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible" && activeRef.current) {
        sentinelRef.current = null;
        setLocked(false);
        void acquire();
        startFallback();
      }
    };
    const onFs = () => {
      // Re-assert hanya bila masih fullscreen (atau tanpa fullscreen API, mis. iOS).
      if (!activeRef.current) return;
      const inFs = !!document.fullscreenElement || typeof document.fullscreenEnabled === "undefined";
      if (inFs && document.visibilityState === "visible") {
        sentinelRef.current = null;
        setLocked(false);
        void acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      dead = true;
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("fullscreenchange", onFs);
      void release();
      stopFallback();
    };
  }, [active]);

  return { supported, locked };
}

export default useScreenWakeLock;
