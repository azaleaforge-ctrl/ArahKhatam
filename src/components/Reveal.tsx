"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

// Reveal saat masuk viewport, hanya opacity dan transform, dukung stagger via delay.
export default function Reveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    // Safety-net: bila callback tak fire (observer tak didukung penuh),
    // paksa tampil agar konten tak terkunci opacity:0.
    const t = window.setTimeout(() => {
      el.classList.add("is-visible");
      try {
        io.disconnect();
      } catch {
        // abaikan
      }
    }, 2000);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={"reveal " + (className ?? "")} style={{ transitionDelay: delay + "ms" }}>
      {children}
    </div>
  );
}
