"use client";

import { useEffect } from "react";

// Cahaya lembut mengikuti mouse via rAF, mati di sentuh dan reduced motion.
export default function CursorGlow() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = document.getElementById("cursor-glow");
    if (!el) return;
    let x = -500;
    let y = -500;
    let cx = x;
    let cy = y;
    let raf = 0;
    let shown = false;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
    };
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = "translate(" + (cx - 160) + "px," + (cy - 160) + "px)";
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div id="cursor-glow" aria-hidden="true" />;
}
