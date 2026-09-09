"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
        "fixed inset-x-0 top-0 z-50 border-b transition-colors " +
        (scrolled
          ? "border-white/[0.06] bg-[#0B1F1A]/90 shadow-lg backdrop-blur-xl"
          : "border-transparent bg-[#0B1F1A]/60 backdrop-blur-xl")
      }
    >
      <nav className="mx-auto flex h-[64px] w-full max-w-[680px] items-center justify-between gap-2 px-4 md:max-w-6xl md:px-6">
        <a href="/#atas" className="flex min-w-0 flex-1 items-center gap-3">
          <Image src="/arahkhatam_logo_B2.png" alt="ArahKhatam" width={36} height={36} className="h-9 w-9 rounded-full object-cover" priority />
          <span className="min-w-0 flex-1 leading-none">
            <span className="flex min-w-0 items-baseline gap-1">
              <span className="font-display block truncate text-[17px] font-bold tracking-tight text-[#F6F1E7]">
                ArahKhatam
              </span>
              <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-white/40 min-[375px]:hidden">
                kiblat & khatam
              </span>
            </span>
            <span className="mt-[2px] block truncate text-[11px] tracking-wide text-white/50 min-[375px]:text-white/40">
              penunjuk kiblat & khatam
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
            className="ripple-host pressable ml-2 inline-flex h-9 items-center rounded-full bg-[#E8A33D] px-5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
          >
            Dukung
          </a>
        </div>
        <div className="flex shrink-0 items-center md:hidden">
          <a
            href={DONASI_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={ripple}
            className="ripple-host pressable inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#E8A33D] px-4 text-[13px] font-bold tracking-tight text-[#0B1F1A] hover:brightness-105"
          >
            Donasi
          </a>
        </div>
      </nav>
    </header>
  );
}
