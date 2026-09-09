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
    <section id="atas" className="kawung-dark relative overflow-hidden bg-[#0B1F1A] pt-24 pb-10 md:pt-36 md:pb-24">
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

      <div className="relative mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-[1.2fr_0.8fr] md:items-center md:gap-10">
        <div className="order-2 md:order-1">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/40 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-widest text-[#E8A33D]">
              SENJA KHATULISTIWA, DATA KEMENAG RI
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="font-display mt-5 text-[1.9rem] leading-[1.08] text-[#F6F1E7] md:text-6xl md:leading-[1.05]">
              Waktu sholat akurat, tenang setiap hari.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#F6F1E7]/80 md:text-lg">
              ArahKhatam adalah web jadwal sholat, kiblat, dan ngaji harian Indonesia. Lihat 8 waktu dalam
              sehari, pantau countdown live ke sholat berikut, cek tren 30 hari, dan arah kiblat
              presisi. Sumber data Kemenag RI via MyQuran, dengan cadangan Aladhan method 20.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
              <a
                href="#jadwal"
                onClick={ripple}
                className="ripple-host pressable rounded-full bg-[#E8A33D] px-7 py-3 text-center font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
              >
                Lihat jadwal hari ini
              </a>
              <a
                href="#kiblat"
                onClick={ripple}
                className="ripple-host pressable rounded-full border border-white/25 px-7 py-3 text-center font-bold text-[#F6F1E7] hover:bg-white/10"
              >
                Cek arah kiblat
              </a>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <p className="mt-6 text-sm text-[#F6F1E7]/70 max-md:mt-5 max-md:rounded-2xl max-md:border max-md:border-white/10 max-md:bg-white/5 max-md:p-3.5 max-md:leading-relaxed">
              <span className="max-md:mb-1 max-md:block max-md:text-[11px] max-md:font-bold max-md:uppercase max-md:tracking-[0.2em] max-md:text-[#E8A33D]">
                Hijriah hari ini:
              </span>{" "}
              <span className="font-bold text-[#F6F1E7] max-md:block max-md:text-[15px] max-md:leading-snug" suppressHydrationWarning>
                {hijri || "…"}
              </span>{" "}
              <span className="opacity-70 max-md:mt-0.5 max-md:block max-md:text-xs">(perkiraan)</span>
            </p>
          </Reveal>
        </div>

        <Reveal delay={140} className="relative order-1 md:order-2">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 md:bg-white/[0.07] md:p-7 md:backdrop-blur-md">
            <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">PILIH KOTA</p>
            <div className="mt-3 flex max-w-full gap-2 overflow-x-auto whitespace-nowrap pb-1 -mx-1 px-1 md:mx-0 md:flex-wrap md:overflow-visible md:whitespace-normal md:px-0 md:pb-0">
              {DEFAULT_CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={(e) => {
                    ripple(e);
                    pick(c.id);
                  }}
                  className={
                    "pressable min-h-[44px] shrink-0 rounded-full px-4 py-2 text-sm font-bold md:min-h-0 " +
                    (cityId === c.id
                      ? "bg-[#E8A33D] text-[#0B1F1A]"
                      : "bg-white/10 text-[#F6F1E7] hover:bg-white/20")
                  }
                >
                  {c.nama.replace("KOTA ", "")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
                placeholder="Cari kota lain, misal Semarang"
                className="w-full min-h-[44px] rounded-2xl border border-white/15 bg-[#0B1F1A]/60 px-4 py-2.5 text-sm text-[#F6F1E7] placeholder:text-white/40 focus:border-[#E8A33D] focus:outline-none md:min-h-0"
              />
              <button
                onClick={(e) => {
                  ripple(e);
                  doSearch();
                }}
                className="ripple-host pressable shrink-0 rounded-2xl bg-[#0E5E4A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#147a5f]"
              >
                {searching ? "..." : "Cari"}
              </button>
            </div>
            {results.length > 0 && (
              <ul className="mt-3 max-h-44 overflow-auto rounded-2xl border border-white/10 bg-[#0B1F1A] p-1">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => pick(r.id)}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#F6F1E7] hover:bg-white/10"
                    >
                      {r.lokasi} <span className="opacity-50">({r.id})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 rounded-2xl bg-[#F6F1E7] p-5 text-[#0B1F1A]">
              <p className="text-xs font-bold tracking-widest opacity-60">
                {activeCity ? activeCity.nama : data?.lokasi ?? "MEMUAT"} , MENUJU {next ? LABEL[next.key].toUpperCase() : "..."}
              </p>
              <p className="font-display mt-1 text-4xl tabular-nums md:text-5xl">
                {next ? fmtCountdown(next.diffSec) : "--:--:--"}
              </p>
              <p className="mt-2 text-sm opacity-70">
                {data
                  ? "Subuh " + data.jadwal.subuh + " , Dzuhur " + data.jadwal.dzuhur + " , Maghrib " + data.jadwal.maghrib
                  : "Memuat jadwal dari MyQuran..."}
              </p>
              {data?.sumber === "aladhan" && (
                <p className="mt-1 text-xs font-semibold text-[#C05621]">
                  Mode cadangan Aladhan aktif (method Kemenag RI).
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
