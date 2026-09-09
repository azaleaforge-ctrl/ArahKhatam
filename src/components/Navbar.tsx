"use client";

import { useEffect, useState } from "react";
import { ripple } from "./fx";

const DONASI_URL = process.env.NEXT_PUBLIC_SOCIABUZZ_URL ?? "https://sociabuzz.com/azaleaforge15/tribe";
const LINKS = [
  { href: "/#jadwal", label: "Jadwal" },
  { href: "/#bulanan", label: "Bulanan" },
  { href: "/#kiblat", label: "Kiblat" },
  { href: "/quran", label: "AlQuran" },
  { href: "/iqro", label: "Iqro" },
  { href: "/#cara", label: "Cara Kerja" },
  { href: "/tv", label: "TV" },
  { href: "/#donasi", label: "Donasi" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-colors " +
        (scrolled ? "bg-[#0B1F1A]/90 backdrop-blur-md shadow-lg" : "bg-transparent")
      }
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-5">
        <a href="/#atas" className="flex min-w-0 flex-1 items-center gap-2.5 md:flex-none">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#E8A33D] font-display text-xl text-[#0B1F1A]">
            A
          </span>
          <span className="min-w-0 leading-tight">
            <span className="font-display block truncate text-lg text-[#F6F1E7]">ArahKhatam</span>
            <span className="block truncate text-[11px] tracking-wide text-[#F6F1E7]/70">
              penunjuk kiblat & khatam harian Indonesia
            </span>
          </span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="pressable rounded-full px-4 py-2 text-sm font-semibold text-[#F6F1E7]/85 hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#donasi"
            onClick={ripple}
            className="ripple-host pressable ml-2 rounded-full bg-[#E8A33D] px-5 py-2 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
          >
            Dukung
          </a>
        </div>
        <div className="flex min-w-0 shrink-0 items-center gap-2 md:hidden">
          <a
            href={DONASI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable max-w-[118px] truncate rounded-full border border-white/25 px-2.5 py-1.5 text-center text-[11px] font-bold leading-tight text-[#F6F1E7]"
          >
            Sedekah Semampunya
          </a>
          <a
            href={DONASI_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={ripple}
            className="ripple-host pressable max-w-[118px] truncate rounded-full bg-[#E8A33D] px-2.5 py-1.5 text-center text-[11px] font-bold leading-tight text-[#0B1F1A]"
          >
            Donasi via Sociabuzz
          </a>
        </div>
      </nav>
    </header>
  );
}
