"use client";

import { useEffect, useState } from "react";

export type DisplayProfile = "compact" | "normal";

export type DisplayInfo = {
  w: number;
  h: number;
  sw: number;
  sh: number;
  dpr: number;
  orientation: string;
  colorDepth: number;
  profile: DisplayProfile;
  uaHint: string;
};

export function classifyProfile(w: number, h: number): DisplayProfile {
  return h < 800 || w < 1400 ? "compact" : "normal";
}

function detectUaHint(): string {
  try {
    const ua =
      typeof navigator !== "undefined" ? String(navigator.userAgent || "") : "";
    if (!ua) return "-";
    const u = ua.toLowerCase();
    if (u.includes("tizen")) return "Samsung TV (Tizen)";
    if (u.includes("webos")) return "LG TV (webOS)";
    if (u.includes("googletv") || u.includes("google tv")) return "Google TV";
    if (u.includes("android") && u.includes("tv")) return "Android TV";
    if (u.includes("smart-tv") || u.includes("smarttv") || u.includes("hbbtv"))
      return "Smart TV";
    if (u.includes("mobile") || u.includes("android") || u.includes("iphone"))
      return "HP";
    return "Browser";
  } catch {
    return "-";
  }
}

function readDisplayInfo(): DisplayInfo {
  const fallback: DisplayInfo = {
    w: 0,
    h: 0,
    sw: 0,
    sh: 0,
    dpr: 0,
    orientation: "-",
    colorDepth: 0,
    profile: "normal",
    uaHint: detectUaHint(),
  };
  try {
    if (typeof window === "undefined") return fallback;
    const w =
      typeof window.innerWidth === "number" ? window.innerWidth : 0;
    const h =
      typeof window.innerHeight === "number" ? window.innerHeight : 0;
    let sw = 0;
    let sh = 0;
    let colorDepth = 0;
    try {
      sw = typeof window.screen?.width === "number" ? window.screen.width : 0;
      sh = typeof window.screen?.height === "number" ? window.screen.height : 0;
      colorDepth =
        typeof window.screen?.colorDepth === "number"
          ? window.screen.colorDepth
          : 0;
    } catch {
      // screen tak tersedia (browser TV tua), pakai 0
    }
    let dpr = 0;
    try {
      dpr =
        typeof window.devicePixelRatio === "number"
          ? window.devicePixelRatio
          : 0;
    } catch {
      // abaikan
    }
    let orientation = "-";
    try {
      const so = window.screen?.orientation?.type;
      if (typeof so === "string" && so) {
        orientation = so.startsWith("portrait") ? "portrait" : "landscape";
      } else if (typeof window.matchMedia === "function") {
        orientation = window.matchMedia("(orientation: portrait)").matches
          ? "portrait"
          : "landscape";
      } else if (w && h) {
        orientation = h >= w ? "portrait" : "landscape";
      }
    } catch {
      // abaikan, tetap "-"
    }
    return {
      w,
      h,
      sw,
      sh,
      dpr,
      orientation,
      colorDepth,
      profile: classifyProfile(w, h),
      uaHint: detectUaHint(),
    };
  } catch {
    return fallback;
  }
}

// Snapshot sekali jalan (non-hook) untuk effect display branch.
export function snapshotDisplayProfile(): DisplayProfile {
  try {
    if (typeof window === "undefined") return "normal";
    return classifyProfile(window.innerWidth || 0, window.innerHeight || 0);
  } catch {
    return "normal";
  }
}

const INITIAL: DisplayInfo = {
  w: 0,
  h: 0,
  sw: 0,
  sh: 0,
  dpr: 0,
  orientation: "-",
  colorDepth: 0,
  profile: "normal",
  uaHint: "-",
};

export function useDisplayInfo(): DisplayInfo {
  const [info, setInfo] = useState<DisplayInfo>(INITIAL);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      try {
        setInfo(readDisplayInfo());
      } catch {
        // abaikan, nilai lama tetap dipakai
      }
    };
    update();
    window.addEventListener("resize", update);
    try {
      window.addEventListener("orientationchange", update);
    } catch {
      // browser tua tanpa orientationchange, resize cukup
    }
    return () => {
      window.removeEventListener("resize", update);
      try {
        window.removeEventListener("orientationchange", update);
      } catch {
        // abaikan
      }
    };
  }, []);

  return info;
}

export default useDisplayInfo;
