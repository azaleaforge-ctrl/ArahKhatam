"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CITIES } from "@/lib/cities";
import { compassLabel, qiblaBearing } from "@/lib/qibla";
import Reveal from "./Reveal";
import { ripple } from "./fx";

type Props = { cityId: string };

// iOS 13+: izin sensor hanya lewat gestur, via requestPermission bila ada.
type DOE = DeviceOrientationEvent & { webkitCompassHeading?: number };
type DOEStatic = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };

export default function KiblatCompass({ cityId }: Props) {
  const fallback = DEFAULT_CITIES.find((c) => c.id === cityId) ?? DEFAULT_CITIES[0];
  const [lat, setLat] = useState(String(fallback.lat));
  const [lon, setLon] = useState(String(fallback.lon));
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"manual" | "live">("manual");
  const [heading, setHeading] = useState<number | null>(null);
  const [liveMsg, setLiveMsg] = useState("");
  const headingBox = useRef<number | null>(null);
  const rafId = useRef(0);
  const liveRef = useRef(false);

  const deg = useMemo(() => {
    const la = Number(lat);
    const lo = Number(lon);
    if (Number.isNaN(la) || Number.isNaN(lo)) return fallback ? qiblaBearing(fallback.lat, fallback.lon) : 295.15;
    return qiblaBearing(la, lo);
  }, [lat, lon, fallback]);

  const useCity = (id: string) => {
    const c = DEFAULT_CITIES.find((x) => x.id === id);
    if (c) {
      setLat(String(c.lat));
      setLon(String(c.lon));
      setStatus("Koordinat diset ke " + c.nama);
    }
  };

  const useGps = () => {
    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS.");
      return;
    }
    setStatus("Meminta lokasi...");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(String(p.coords.latitude.toFixed(5)));
        setLon(String(p.coords.longitude.toFixed(5)));
        setStatus("Lokasi browser berhasil dipakai.");
      },
      () => setStatus("Izin lokasi ditolak, isi manual saja."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Dipanggil dari klik tombol agar dihitung sebagai gestur di iOS.
  const aktifkanKompas = async () => {
    setLiveMsg("");
    try {
      const DOE = window.DeviceOrientationEvent as unknown as DOEStatic | undefined;
      if (!DOE) {
        setLiveMsg("Perangkat ini tidak punya sensor kompas. Tetap pakai mode manual.");
        return;
      }
      if (typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          setLiveMsg("Izin sensor ditolak. Tetap pakai mode manual.");
          return;
        }
      }
      headingBox.current = null;
      liveRef.current = true;
      setMode("live");
      setLiveMsg("Kompas aktif. Putar badan hingga jarum menunjuk ke atas.");
    } catch {
      setLiveMsg("Kompas tidak tersedia di browser ini. Tetap pakai mode manual.");
    }
  };

  const matikanKompas = () => {
    liveRef.current = false;
    setMode("manual");
    setLiveMsg("");
  };

  // Dengarkan sensor hanya saat mode live. Update di-throttle via rAF.
  useEffect(() => {
    if (mode !== "live") {
      setHeading(null);
      return;
    }
    const onOri = (e: DeviceOrientationEvent) => {
      const ev = e as DOE;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") h = ev.webkitCompassHeading;
      else if (typeof e.alpha === "number" && e.alpha !== null) h = (360 - e.alpha) % 360;
      if (h === null || Number.isNaN(h)) return;
      headingBox.current = h;
      if (!rafId.current) {
        rafId.current = window.requestAnimationFrame(() => {
          rafId.current = 0;
          if (headingBox.current !== null) setHeading(headingBox.current);
        });
      }
    };
    window.addEventListener("deviceorientation", onOri);
    // Bila 3 detik tanpa data (desktop atau sensor mati), kembali ke manual.
    const t = window.setTimeout(() => {
      if (headingBox.current === null && liveRef.current) {
        liveRef.current = false;
        setMode("manual");
        setLiveMsg("Tidak ada data sensor. Mungkin dibuka di desktop. Tetap pakai mode manual.");
      }
    }, 3000);
    return () => {
      window.removeEventListener("deviceorientation", onOri);
      window.clearTimeout(t);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, [mode]);

  // Sudut relatif agar jarum menunjuk kiblat sesuai arah badan saat live.
  const live = mode === "live" && heading !== null;
  const jarum = live ? (deg - (heading as number) + 360) % 360 : deg;

  return (
    <section id="kiblat" className="stars relative overflow-x-clip bg-[#0B1F1A] py-8 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[720px] max-w-[100vw] -translate-x-1/2 rounded-full opacity-50"
        style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.35), transparent)" }}
      />
      <div className="relative mx-auto grid w-full max-w-[680px] min-w-0 grid-cols-1 gap-6 px-4 md:max-w-6xl md:grid-cols-2 md:items-center md:gap-10 md:px-6">
        <Reveal className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E8A33D]">KOMPAS KIBLAT</p>
          <h2 className="font-display mt-2 text-[1.65rem] leading-tight tracking-tight text-[#F6F1E7] md:text-5xl">
            Hadap Kakbah dengan yakin.
          </h2>
          <p className="mt-3 max-w-lg text-[#F6F1E7]/75">
            Kakbah di 21.422487, 39.826206. Bearing dihitung dengan rumus great circle.
            Dari Jakarta hasilnya 295.15 derajat. Putar badan hingga jarum menunjuk angka itu.
          </p>
          <div className="scrollbar-hide -mx-4 mt-5 flex gap-2 overflow-x-auto whitespace-nowrap px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:whitespace-normal md:px-0">
            {DEFAULT_CITIES.map((c) => (
              <button
                key={c.id}
                onClick={(e) => {
                  ripple(e);
                  useCity(c.id);
                }}
                className="pressable min-h-[44px] shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#F6F1E7] hover:bg-white/20"
              >
                {c.nama.replace("KOTA ", "")}
              </button>
            ))}
          </div>
          <div className="mt-5 grid min-w-0 grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="text-xs font-bold text-[#F6F1E7]/70">LATITUDE</span>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                className="mt-1 min-h-[48px] w-full min-w-0 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#E8A33D] focus:outline-none"
              />
            </label>
            <label className="block min-w-0">
              <span className="text-xs font-bold text-[#F6F1E7]/70">LONGITUDE</span>
              <input
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                inputMode="decimal"
                className="mt-1 min-h-[48px] w-full min-w-0 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#E8A33D] focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={(e) => {
                ripple(e);
                useGps();
              }}
              className="ripple-host pressable inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#E8A33D] px-6 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] md:w-auto"
            >
              Pakai lokasi saya
            </button>
          </div>
          {status && <p className="mt-3 text-sm text-[#E8A33D]">{status}</p>}
        </Reveal>

        <Reveal delay={120} className="min-w-0">
          <div className="mx-auto w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] p-4 text-center min-[375px]:p-5 min-[420px]:max-w-sm md:p-8 md:backdrop-blur-md">
            <div className="mx-auto mb-5 grid w-full max-w-[280px] grid-cols-2 gap-1 rounded-full bg-white/10 p-1 md:inline-flex md:w-auto" role="tablist" aria-label="Mode kompas">
              <button
                role="tab"
                aria-selected={mode === "manual"}
                onClick={(e) => {
                  ripple(e);
                  matikanKompas();
                }}
                className={
                  "pressable inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-2 text-sm font-bold " +
                  (mode === "manual" ? "bg-[#E8A33D] text-[#0B1F1A]" : "text-[#F6F1E7]/80 hover:bg-white/10")
                }
              >
                Manual
              </button>
              <button
                role="tab"
                aria-selected={mode === "live"}
                onClick={(e) => {
                  ripple(e);
                  if (mode !== "live") void aktifkanKompas();
                }}
                className={
                  "pressable inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-2 text-sm font-bold " +
                  (mode === "live" ? "bg-[#E8A33D] text-[#0B1F1A]" : "text-[#F6F1E7]/80 hover:bg-white/10")
                }
              >
                Kompas HP
              </button>
            </div>
            <div className="relative mx-auto h-52 w-52 max-w-full min-[375px]:h-60 min-[375px]:w-60">
              <div className="absolute inset-0 rounded-full border-2 border-[#E8A33D]/50" />
              <div className="absolute inset-3 rounded-full border border-white/15" />
              {[
                { d: "U", cls: "left-1/2 top-[5%] -translate-x-1/2" },
                { d: "T", cls: "right-[5%] top-1/2 -translate-y-1/2" },
                { d: "S", cls: "bottom-[5%] left-1/2 -translate-x-1/2" },
                { d: "B", cls: "left-[5%] top-1/2 -translate-y-1/2" },
              ].map((s) => (
                <span key={s.d} className={"absolute text-sm font-bold text-[#F6F1E7]/70 " + s.cls}>
                  {s.d}
                </span>
              ))}
              <div
                className={live ? "absolute inset-0" : "compass-needle absolute inset-0"}
                style={{ transform: "rotate(" + jarum + "deg)" }}
              >
                <div className="absolute left-1/2 top-6 h-24 w-1.5 -translate-x-1/2 rounded-full bg-[#E8A33D]" />
                <div className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#0B1F1A] bg-[#E8A33D]" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F6F1E7]" />
              </div>
            </div>
            <p className="font-display mt-6 min-w-0 break-words text-4xl tabular-nums text-[#F6F1E7] min-[375px]:text-5xl">{deg.toFixed(2)}°</p>
            {live && <p className="mt-1 text-xs text-[#F6F1E7]/60">Arah HP: {(heading as number).toFixed(0)}°</p>}
            <p className="mt-1 text-sm font-bold text-[#E8A33D]">{compassLabel(deg)}</p>
            {mode === "live" && (
              <p className="mt-2 text-xs text-[#F6F1E7]/60">
                Kalibrasi: jauhkan dari logam, ayun bentuk 8 bila loncat.
              </p>
            )}
            {liveMsg && <p className="mt-2 text-xs text-[#E8A33D]">{liveMsg}</p>}
            <p className="mt-2 min-w-0 break-all text-xs text-[#F6F1E7]/60">
              {lat}, {lon} menuju Kakbah
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
