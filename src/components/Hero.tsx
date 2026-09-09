"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CITIES } from "@/lib/cities";
import { getDailySchedule, nextPrayer, type JadwalResponse } from "@/lib/api";
import { getSelectedCityId, setSelectedCityId } from "@/lib/db";
import { formatHijriah } from "@/lib/qibla";
import SafeImage from "./SafeImage";
import Reveal from "./Reveal";
import { ripple } from "./fx";

type Props = {
  cityId: string;
  onCityChange: (id: string) => void;
};

function fmtCountdown(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return p(h) + ":" + p(m) + ":" + p(s);
}

const LABEL: Record<string, string> = {
  subuh: "Subuh",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};

export default function Hero({ cityId, onCityChange }: Props) {
  const [data, setData] = useState<JadwalResponse | null>(null);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; lokasi: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const [hijri, setHijri] = useState("");

  useEffect(() => {
    setHijri(formatHijriah(new Date()));
  }, []);

  useEffect(() => {
    getSelectedCityId().then((id) => {
      if (id && id !== cityId) onCityChange(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    const now = new Date();
    getDailySchedule(cityId, now.getFullYear(), now.getMonth() + 1, now.getDate())
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [cityId]);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Parallax ringan, hanya transform
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = "translateY(" + window.scrollY * 0.18 + "px)";
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const now = useMemo(() => new Date(Date.now() + tick * 0), [tick]);
  const next = data ? nextPrayer(data.jadwal, now) : null;

  const doSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { searchCities } = await import("@/lib/api");
      const r = await searchCities(query.trim());
      setResults(r.slice(0, 8));
    } finally {
      setSearching(false);
    }
  };

  const pick = (id: string) => {
    onCityChange(id);
    setSelectedCityId(id);
    setResults([]);
    setQuery("");
  };

  const activeCity = DEFAULT_CITIES.find((c) => c.id === cityId);

  return (
    <section id="atas" className="kawung-dark relative overflow-hidden bg-[#0B1F1A] pt-[88px] pb-8 md:pt-36 md:pb-24">
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[640px] -translate-x-1/2 rounded-full opacity-60 md:h-[560px] md:w-[900px]"
        style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.45), rgba(192,86,33,0.18), transparent)" }}
      />
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F1A] via-[#0B1F1A]/60 to-[#0B1F1A]" />
        <SafeImage
          src="/media/masjid-agung-bandung.jpg"
          alt="Masjid Raya Bandung"
          className="h-full w-full object-cover object-center opacity-30"
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-[680px] gap-6 px-4 md:max-w-6xl md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-10 md:px-6">
        <div className="order-2 min-w-0 md:order-1">
          <Reveal>
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#E8A33D]/40 bg-white/5 px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#E8A33D]">
              SENJA KHATULISTIWA, DATA KEMENAG RI
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="font-display mt-4 text-balance text-[2rem] leading-[1.08] tracking-tight text-[#F6F1E7] md:text-6xl md:leading-[1.05]">
              Waktu sholat akurat, tenang setiap hari.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-[#F6F1E7]/80 md:mt-5 md:text-lg">
              ArahKhatam adalah web jadwal sholat, kiblat, dan ngaji harian Indonesia. Lihat 8 waktu dalam
              sehari, pantau countdown live ke sholat berikut, cek tren 30 hari, dan arah kiblat
              presisi. Sumber data Kemenag RI via MyQuran, dengan cadangan Aladhan method 20.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-5 flex flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center">
              <a
                href="#jadwal"
                onClick={ripple}
                className="ripple-host pressable inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#E8A33D] px-7 py-3 text-center text-[15px] font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
              >
                Lihat jadwal hari ini
              </a>
              <a
                href="#kiblat"
                onClick={ripple}
                className="ripple-host pressable inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/25 px-7 py-3 text-center text-[15px] font-bold text-[#F6F1E7] hover:bg-white/10"
              >
                Cek arah kiblat
              </a>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm leading-relaxed text-[#F6F1E7]/70 md:mt-6 md:border-0 md:bg-transparent md:p-0">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D] md:mb-0 md:inline md:text-xs md:normal-case md:tracking-normal md:text-[#F6F1E7]/70">
                Hijriah hari ini:
              </span>{" "}
              <span className="block text-[15px] font-bold leading-snug text-[#F6F1E7] md:inline md:text-sm md:font-normal" suppressHydrationWarning>
                {hijri || "…"}
              </span>{" "}
              <span className="mt-0.5 block text-xs opacity-70 md:inline">(perkiraan)</span>
            </p>
          </Reveal>
        </div>

        <Reveal delay={140} className="relative order-1 min-w-0 md:order-2">
          <div className="rounded-[20px] border border-white/10 bg-[#122e33] p-4 min-[375px]:p-5 md:bg-white/[0.07] md:p-7 md:backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E8A33D]">PILIH KOTA</p>
            <div className="scrollbar-hide -mx-1 mt-3 flex max-w-full gap-2 overflow-x-auto whitespace-nowrap px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:whitespace-normal md:px-0 md:pb-0">
              {DEFAULT_CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={(e) => {
                    ripple(e);
                    pick(c.id);
                  }}
                  aria-pressed={cityId === c.id}
                  className={
                    "pressable min-h-[44px] shrink-0 rounded-full px-4 py-2 text-sm font-bold " +
                    (cityId === c.id
                      ? "bg-[#E8A33D] text-[#0B1F1A] shadow-[0_2px_12px_rgba(232,164,74,0.35)]"
                      : "border border-white/5 bg-white/[0.08] text-white/80 hover:bg-white/15")
                  }
                >
                  {c.nama.replace("KOTA ", "")}
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                  placeholder="Cari kota lain, misal Semarang"
                  aria-label="Cari kota"
                  className="h-[44px] w-full min-w-0 rounded-full border border-white/10 bg-[#1a353a] pl-11 pr-4 text-[14px] text-[#F6F1E7] placeholder:text-white/35 focus:border-[#E8A33D]/40 focus:bg-[#1e3d42] focus:outline-none"
                />
                <button
                  onClick={(e) => {
                    ripple(e);
                    doSearch();
                  }}
                  className="ripple-host pressable h-[44px] shrink-0 rounded-full bg-[#E8A33D] px-5 text-sm font-bold text-[#0B1F1A] hover:brightness-105"
                >
                  {searching ? "..." : "Cari"}
                </button>
              </div>
            </div>
            {results.length > 0 && (
              <ul className="mt-3 max-h-44 overflow-auto rounded-[20px] border border-white/10 bg-[#0B1F1A] p-1">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => pick(r.id)}
                      className="min-h-[44px] w-full rounded-xl px-3 py-2 text-left text-sm text-[#F6F1E7] hover:bg-white/10"
                    >
                      {r.lokasi} <span className="opacity-50">({r.id})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="relative mt-4 overflow-hidden rounded-[20px] bg-[#fdf6e7] p-5 text-[#122e33]">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#E8A33D]/15" />
              <div className="relative">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#122e33]/60">
                  {activeCity ? activeCity.nama : data?.lokasi ?? "MEMUAT"} , MENUJU {next ? LABEL[next.key].toUpperCase() : "..."}
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-[46px] font-bold leading-none tracking-tight tabular-nums">
                    {next ? fmtCountdown(next.diffSec) : "--:--:--"}
                  </span>
                  <span className="ml-2 text-[12px] font-medium text-[#122e33]/50">menit lagi</span>
                </p>
                <p className="mt-4 flex flex-wrap gap-2 text-[12px] font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#122e33]/5 px-3 py-1.5">
                    Subuh {data ? data.jadwal.subuh : "--:--"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#122e33]/5 px-3 py-1.5">
                    Dzuhur {data ? data.jadwal.dzuhur : "--:--"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8A33D]/20 px-3 py-1.5 font-bold">
                    Maghrib {data ? data.jadwal.maghrib : "--:--"}
                  </span>
                </p>
                {!data && (
                  <p className="mt-2 text-[13px] text-[#122e33]/60">Memuat jadwal dari MyQuran...</p>
                )}
              {data?.sumber === "aladhan" && (
                <p className="mt-1 text-xs font-semibold text-[#C05621]">
                  Mode cadangan Aladhan aktif (method Kemenag RI).
                </p>
              )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
