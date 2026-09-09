"use client";

import { useEffect, useRef, useState } from "react";
import { activePrayer, getDailySchedule, PRAYER_ORDER, type JadwalSholat } from "@/lib/api";
import SafeImage from "./SafeImage";
import Reveal from "./Reveal";
import { ripple, tilt, tiltReset } from "./fx";

type Props = { cityId: string };

const META: Record<string, { label: string; desc: string }> = {
  imsak: { label: "Imsak", desc: "Batas sahur" },
  subuh: { label: "Subuh", desc: "Awal fajar" },
  terbit: { label: "Terbit", desc: "Syuruq" },
  dhuha: { label: "Dhuha", desc: "Pagi cerah" },
  dzuhur: { label: "Dzuhur", desc: "Tengah hari" },
  ashar: { label: "Ashar", desc: "Sore hari" },
  maghrib: { label: "Maghrib", desc: "Senja" },
  isya: { label: "Isya", desc: "Malam hari" },
};

export default function JadwalHarian({ cityId }: Props) {
  const [jadwal, setJadwal] = useState<JadwalSholat | null>(null);
  const [lokasi, setLokasi] = useState("");
  const [sumber, setSumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [nowTick, setNowTick] = useState(() => new Date());
  const tanggalRef = useRef("");

  const tanggalKunci = (d: Date) => d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

  useEffect(() => {
    let alive = true;
    const muat = (d: Date) => {
      setLoading(true);
      getDailySchedule(cityId, d.getFullYear(), d.getMonth() + 1, d.getDate())
        .then((res) => {
          if (!alive) return;
          setJadwal(res.jadwal);
          setLokasi(res.lokasi);
          setSumber(res.sumber);
          tanggalRef.current = tanggalKunci(d);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    };
    tanggalRef.current = tanggalKunci(new Date());
    muat(new Date());
    // Hitung ulang waktu aktif tiap 30 detik, lewati saat tab tersembunyi.
    // Bila tanggal berganti sejak data dimuat, fetch ulang jadwal hari itu.
    const t = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      const now = new Date();
      setNowTick(now);
      if (tanggalKunci(now) !== tanggalRef.current) muat(now);
    }, 30000);
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      const now = new Date();
      setNowTick(now);
      if (tanggalKunci(now) !== tanggalRef.current) muat(now);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [cityId]);

  const active = jadwal ? activePrayer(jadwal, nowTick) : null;

  return (
    <section id="jadwal" className="relative overflow-hidden bg-[#F6F1E7] pb-12 md:pb-24">
      <div className="absolute inset-0" aria-hidden="true">
        <SafeImage src="/media/masjid-senja.jpg" alt="" className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F6F1E7] via-[#F6F1E7]/60 to-[#F6F1E7]/85" />
        <div
          className="absolute -top-24 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full opacity-40"
          style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.35), transparent)" }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.25em] text-[#C05621]">JADWAL HARIAN</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-3xl text-[#0B1F1A] md:text-5xl">
              Delapan waktu hari ini.
            </h2>
            <p className="rounded-full bg-[#0B1F1A] px-4 py-1.5 text-sm font-bold text-[#F6F1E7]">
              {loading ? "Memuat..." : lokasi}
            </p>
          </div>
          <p className="mt-2 text-sm text-[#0B1F1A]/65">
            {nowTick.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {sumber ? " , sumber: " + sumber : ""}
          </p>
        </Reveal>
        <div className="mt-6 flex flex-col gap-2.5 md:mt-8 md:grid md:grid-cols-4 md:gap-4">
          {PRAYER_ORDER.map((key, i) => {
            const isActive = active === key;
            return (
              <Reveal key={key} delay={(i % 4) * 80}>
                <article
                  onMouseMove={tilt}
                  onMouseLeave={tiltReset}
                  onClick={ripple}
                  className={
                    "lift ripple-host flex items-center justify-between gap-3 rounded-2xl border p-4 text-left shadow-none md:block md:rounded-3xl md:p-5 " +
                    (isActive
                      ? "border-[#E8A33D] bg-[#0B1F1A] text-[#F6F1E7] md:shadow-[0_20px_50px_-20px_rgba(11,31,26,0.7)]"
                      : "border-[#0E5E4A]/15 bg-[#fffdf7] text-[#0B1F1A]")
                  }
                >
                  <div className="min-w-0">
                    <p className={"text-[11px] font-bold tracking-[0.2em] " + (isActive ? "text-[#E8A33D]" : "text-[#0E5E4A]")}>
                      {isActive ? "SEDANG MASUK" : META[key].desc.toUpperCase()}
                    </p>
                    <h3 className="font-display mt-1 text-xl md:text-2xl">{META[key].label}</h3>
                    {isActive && (
                      <span className="mt-2 inline-block rounded-full bg-[#E8A33D] px-3 py-1 text-xs font-bold text-[#0B1F1A] md:mt-3">
                        Waktu aktif
                      </span>
                    )}
                  </div>
                  <p className="font-display shrink-0 text-[1.7rem] tabular-nums md:mt-2 md:text-4xl">{loading ? "--:--" : jadwal ? jadwal[key] : "--:--"}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
