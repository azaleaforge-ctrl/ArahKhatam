"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    sbBoW?: {
      draw: (
        username: string,
        title: string,
        position: string,
        bgColor: string,
        textColor: string,
      ) => void;
    };
  }
}

const USERNAME = "azaleaforge15";
const TITLE = "U2VkZWthaCBTZW1hbXB1bnlh";
const POSITION = "position-bottom-right";
const BG = "#76CC11";
const FG = "#FFFFFF";

function drawWidget() {
  try {
    window.sbBoW?.draw(USERNAME, TITLE, POSITION, BG, FG);
  } catch {
    // abaikan: widget opsional, jangan ganggu halaman
  }
}

function looksLikeWidget(el: Element): boolean {
  try {
    const id = (el.id || "").toLowerCase();
    const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
    if (id.includes("sb") || id.includes("sociabuzz") || cls.includes("sb") || cls.includes("sociabuzz")) return true;
    const html = el.outerHTML ?? "";
    if (html.includes("sociabuzz") || html.includes("sbBoW")) return true;
    const frame = el.querySelector?.('iframe[src*="sociabuzz"]');
    if (frame) return true;
    if (el.tagName === "IFRAME") {
      const src = (el.getAttribute("src") || "").toLowerCase();
      if (src.includes("sociabuzz")) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function SociabuzzFloat() {
  const pathname = usePathname();
  const isTv = (pathname ?? "").startsWith("/tv");
  const isTvRef = useRef(isTv);
  isTvRef.current = isTv;
  const widgetNodes = useRef<Element[]>([]);
  const hidden = useRef<{ el: HTMLElement; prev: string }[]>([]);
  // Skrip pihak ketiga hanya dimuat di desktop; SSR tak punya window
  // sehingga default null (aman), effect mengoreksi setelah mount.
  const [isDesktop, setIsDesktop] = useState(false);

  const hideWidget = () => {
    try {
      // Node yang tercatat dari hasil draw.
      for (const el of widgetNodes.current) {
        if (document.body.contains(el) && el instanceof HTMLElement && el.style.display !== "none") {
          hidden.current.push({ el, prev: el.style.display });
          el.style.display = "none";
        }
      }
      // Sweep: node susulan yang cocok signature widget tapi belum tercatat.
      for (const el of Array.from(document.body.children)) {
        if (widgetNodes.current.includes(el)) continue;
        if (!(el instanceof HTMLElement)) continue;
        if (el.style.display === "none") continue;
        if (looksLikeWidget(el)) {
          if (!widgetNodes.current.includes(el)) widgetNodes.current.push(el);
          hidden.current.push({ el, prev: el.style.display });
          el.style.display = "none";
        }
      }
    } catch {
      // abaikan
    }
  };

  const restoreWidget = () => {
    try {
      for (const { el, prev } of hidden.current) {
        if (document.body.contains(el)) el.style.display = prev;
      }
      hidden.current = [];
    } catch {
      // abaikan
    }
  };

  const drawAndTrack = () => {
    // Mobile: widget hijau disembunyikan, jadi jangan digambar.
    try {
      if (window.matchMedia("(max-width: 767px)").matches) {
        hideWidget();
        return;
      }
    } catch {
      // abaikan, lanjut draw seperti biasa
    }
    let before: Element[] = [];
    try {
      before = Array.from(document.body.children);
    } catch {
      before = [];
    }
    drawWidget();
    // Widget inject async: catat selisih children sesudah draw.
    window.setTimeout(() => {
      try {
        if (isTvRef.current) {
          hideWidget();
          return;
        }
        const after = Array.from(document.body.children);
        for (const el of after) {
          if (!before.includes(el) && !widgetNodes.current.includes(el)) {
            widgetNodes.current.push(el);
          }
        }
      } catch {
        // abaikan
      }
    }, 900);
  };

  useEffect(() => {
    // Widget hanya untuk desktop. Pindah ke HP: sembunyikan, kembali ke
    // desktop: tampilkan lagi.
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => {
      setIsDesktop(!mq.matches);
      if (mq.matches || isTvRef.current) hideWidget();
      else {
        restoreWidget();
        if (window.sbBoW) drawAndTrack();
      }
    };
    onChange();
    type LegacyMQ = MediaQueryList & {
      addListener?: (cb: () => void) => void;
      removeListener?: (cb: () => void) => void;
    };
    const legacy = mq as LegacyMQ;
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    } else if (typeof legacy.addListener === "function" && typeof legacy.removeListener === "function") {
      legacy.addListener(onChange);
      return () => legacy.removeListener?.(onChange);
    }
    return () => {
      // peramban tanpa API listener: tak ada yang perlu dibersihkan
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTv) {
      hideWidget();
      // Sapu susulan: skrip bisa inject terlambat saat pindah ke /tv.
      const t = window.setTimeout(hideWidget, 1500);
      return () => window.clearTimeout(t);
    }
    restoreWidget();
    if (window.sbBoW) drawAndTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTv]);

  return (
    <>
      {isDesktop ? (
        <Script
          src="https://storage.sociabuzz.com/storage/js/main/buttononwebsite/index.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (isTvRef.current) {
              hideWidget();
              return;
            }
            drawAndTrack();
          }}
        />
      ) : null}
      {/* Pengaman CSS: widget pihak ketiga yang telat inject tetap sembunyi di HP. */}
      <style>{`@media (max-width: 767px){[id*="sociabuzz" i],[class*="sociabuzz" i],[id*="sb-bow" i],[class*="sbow" i],body>iframe[src*="sociabuzz" i]{display:none !important;}}`}</style>
    </>
  );
}
