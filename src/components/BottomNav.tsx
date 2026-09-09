"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Bottom bar khusus mobile. Jempol mudah capai, indikator aktif hanya
// transform/opacity agar 60fps. Desktop disembunyikan total via md:hidden.
function Ikon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const TABS = [
  { id: "jadwal", label: "Jadwal", href: "/#jadwal", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2" },
  { id: "kiblat", label: "Kiblat", href: "/#kiblat", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5 13 13l-4.5 2.5L11 11Z" },
  { id: "quran", label: "Quran", href: "/quran", icon: "M4 5.5C6 4.5 9 4.5 12 6v13c-3-1.5-6-1.5-8-.5ZM20 5.5c-2-1-5-1-8 .5v13c3-1.5 6-1.5 8-.5Z" },
  { id: "iqro", label: "Iqro", href: "/iqro", icon: "M4 20h16M6 20V7l6-3 6 3v13M10 11h4M10 14.5h4" },
  { id: "tv", label: "TV", href: "/tv", icon: "M3 6h18v11H3ZM9 21h6M12 17v4" },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const [spot, setSpot] = useState("jadwal");

  // Pantau section landing saja. Quran/Iqro/TV ikut pathname.
  useEffect(() => {
    if (pathname !== "/") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setSpot(e.target.id === "kiblat" ? "kiblat" : "jadwal");
        }
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    for (const id of ["jadwal", "bulanan", "kiblat"]) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [pathname]);

  const aktif =
    pathname.startsWith("/quran") ? "quran" : pathname.startsWith("/iqro") ? "iqro" : pathname.startsWith("/tv") ? "tv" : pathname === "/" ? spot : "";

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0B1F1A] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5">
        {TABS.map((t) => {
          const nyala = aktif === t.id;
          return (
            <a
              key={t.id}
              href={t.href}
              aria-current={nyala ? "page" : undefined}
              className={
                "relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold " +
                (nyala ? "text-[#E8A33D]" : "text-[#F6F1E7]/60")
              }
            >
              <span
                aria-hidden="true"
                className={
                  "absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#E8A33D] transition-opacity transition-transform duration-300 " +
                  (nyala ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0")
                }
              />
              <Ikon d={t.icon} />
              {t.label}
            </a>
          );
        })}
      </div>
      {/* Widget pihak ketiga diangkat di atas FAB donasi + BottomNav pada HP. */}
      <style>{`@media (max-width: 767px){[id*="sociabuzz" i],[class*="sociabuzz" i],[id*="sb-bow" i],[class*="sbow" i],body>iframe[src*="sociabuzz" i]{bottom:148px !important;right:12px !important;transform:scale(.82);transform-origin:bottom right;}}`}</style>
    </nav>
  );
}
