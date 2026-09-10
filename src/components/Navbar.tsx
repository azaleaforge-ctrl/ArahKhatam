"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ripple } from "./fx";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

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
  const [bantuan, setBantuan] = useState(false);
  const { canPrompt, install } = useInstallPrompt();

  const klikInstall = useCallback(async () => {
    if (!canPrompt) {
      setBantuan((v) => !v);
      return;
    }
    const hasil = await install();
    setBantuan(hasil === "manual");
  }, [canPrompt, install]);

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
      <nav className="mx-auto flex h-[64px] w-full max-w-[680px] flex-nowrap items-center justify-between gap-2 px-4 md:max-w-6xl md:px-6 lg:max-w-7xl lg:gap-3">
        <a href="/#atas" className="flex min-w-0 flex-none shrink-0 items-center gap-2.5">
          <Image src="/arahkhatam_logo_B2.png" alt="ArahKhatam" width={36} height={36} className="h-9 w-9 flex-none rounded-full object-cover" priority />
          <span className="min-w-0 flex-1 leading-none">
            <span className="flex min-w-0 items-baseline gap-1">
              <span className="font-display block truncate text-[17px] font-bold tracking-tight text-[#F6F1E7]">
                ArahKhatam
              </span>
              <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-white/40 min-[375px]:hidden">
                kiblat & khatam
              </span>
            </span>
            <span className="mt-[2px] block truncate text-[11px] tracking-wide text-white/50 min-[375px]:text-white/40 lg:hidden">
              penunjuk kiblat & khatam
            </span>
          </span>
        </a>
        <div className="hidden min-w-0 flex-none items-center justify-end gap-0.5 lg:ml-auto lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="pressable whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-semibold text-[#F6F1E7]/85 hover:bg-white/10 hover:text-white xl:px-3"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => void klikInstall()}
            aria-expanded={bantuan}
            className="pressable ml-1 inline-flex h-8 flex-none items-center gap-1.5 whitespace-nowrap rounded-full border border-[#E8A33D]/50 px-3 text-[13px] font-bold text-[#E8A33D] hover:bg-[#E8A33D]/10"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M4 21h16" />
            </svg>
            Install App
          </button>
          <a
            href="/#donasi"
            onClick={ripple}
            className="ripple-host pressable ml-2 inline-flex h-8 flex-none items-center whitespace-nowrap rounded-full bg-[#E8A33D] px-4 text-[13px] font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
          >
            Dukung
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <button
            onClick={() => void klikInstall()}
            aria-expanded={bantuan}
            className="pressable inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#E8A33D]/50 px-3 text-[13px] font-bold text-[#E8A33D]"
          >
            Install
          </button>
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
      {bantuan && (
        <div className="absolute inset-x-4 top-full mx-auto max-w-md pt-2" role="dialog" aria-label="Cara memasang aplikasi">
          <div className="rounded-3xl border border-[#E8A33D]/40 bg-[#0B1F1A] p-4 text-[#F6F1E7] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold">Cara Pasang ArahKhatam</p>
              <button
                onClick={() => setBantuan(false)}
                aria-label="Tutup"
                className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-[#F6F1E7]/80 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#F6F1E7]/80">
              <li><strong className="text-[#E8A33D]">Android Chrome:</strong> menu ⋮ → Install app</li>
              <li><strong className="text-[#E8A33D]">iPhone Safari:</strong> Share → Add to Home Screen</li>
              <li><strong className="text-[#E8A33D]">TV/browser lain:</strong> gunakan browser modern (TV Bro/Chrome) lalu buka menu ini lagi.</li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
