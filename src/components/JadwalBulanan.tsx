"use client";

import { useEffect, useMemo, useState } from "react";
import { getMonthlySchedule, type MonthlyRow } from "@/lib/api";
import Reveal from "./Reveal";
import { ripple } from "./fx";

type Props = { cityId: string };

export default function JadwalBulanan({ cityId }: Props) {
  const [nowTick, setNowTick] = useState(() => new Date());
  const [month, setMonth] = useState(nowTick.getMonth() + 1);
  const [year, setYear] = useState(nowTick.getFullYear());
  const [autoFollow, setAutoFollow] = useState(true);
  const [rows, setRows] = useState<MonthlyRow[]>([]);
  const [lokasi, setLokasi] = useState("");
  const [sumber, setSumber] = useState("myquran");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getMonthlySchedule(cityId, year, month)
      .then((d) => {
        if (!alive) return;
        setRows(d.rows);
        setLokasi(d.lokasi);
        setSumber(d.sumber || "myquran");
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [cityId, month, year]);

  const trend = useMemo(() => {
    if (rows.length < 2) return "";
    const toMin = (s: string) => {
      const [h, m] = s.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const dMaghrib = toMin(rows[rows.length - 1].maghrib) - toMin(rows[0].maghrib);
    const dSubuh = toMin(rows[rows.length - 1].subuh) - toMin(rows[0].subuh);
    const arah = (d: number) => (d > 0 ? "mundur " + d + " menit" : d < 0 ? "maju " + Math.abs(d) + " menit" : "stabil");
    return "Maghrib " + arah(dMaghrib) + " dan Subuh " + arah(dSubuh) + " sepanjang bulan ini.";
  }, [rows]);

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  // Jam berjalan: penanda hari pindah sendiri maksimal 30 detik setelah
  // ganti hari, dan tampilan ikut pindah bulan bila user tidak sedang
  // melihat bulan lain secara manual.
  useEffect(() => {
    const tick = () => setNowTick(new Date());
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") tick();
    }, 30000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const nowD = nowTick.getDate();
  const nowM = nowTick.getMonth() + 1;
  const nowY = nowTick.getFullYear();
  const hariIniLabel = nowTick.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const lihatBulanIni = month === nowM && year === nowY;

  useEffect(() => {
    if (autoFollow && (month !== nowM || year !== nowY)) {
      setMonth(nowM);
      setYear(nowY);
    }
  }, [autoFollow, month, year, nowM, nowY]);

  // Format API: "Selasa, 08/09/2026", jadi ambil angka dd/mm/yyyy di ujung.
  const parseTanggal = (tanggal: string) => {
    const m1 = tanggal.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m1) return { dd: Number(m1[1]), mm: Number(m1[2]), yyyy: Number(m1[3]) };
    const m2 = tanggal.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m2) return { dd: Number(m2[3]), mm: Number(m2[2]), yyyy: Number(m2[1]) };
    return null;
  };

  // Satu indeks pasti, findIndex berhenti di kecocokan pertama.
  const todayIdx = useMemo(() => {
    if (!lihatBulanIni || rows.length === 0) return -1;
    return rows.findIndex((r) => {
      const p = parseTanggal(r.tanggal);
      return !!p && p.dd === nowD && p.mm === nowM && p.yyyy === nowY;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, lihatBulanIni, nowTick]);

  // Bawa baris hari ini ke tengah layar begitu data termuat.
  useEffect(() => {
    if (loading || todayIdx < 0) return;
    const t = window.setTimeout(() => {
      try {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Layar sempit: nearest agar halaman tidak meloncat saat data termuat.
        const sempit = window.matchMedia("(max-width: 767px)").matches;
        document
          .getElementById("tren-hari-ini")
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: sempit ? "nearest" : "center" });
      } catch {
        // abaikan, sorot baris tetap terlihat
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [loading, todayIdx]);

  const shift = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
    setAutoFollow(false);
  };

  return (
    <section id="bulanan" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.25em] text-[#0E5E4A]">JADWAL BULANAN</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-3xl text-[#0B1F1A] md:text-5xl">Tren 30 hari penuh.</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  ripple(e);
                  shift(-1);
                }}
                className="ripple-host pressable min-h-[44px] rounded-full border border-[#0B1F1A]/15 px-4 py-2 text-sm font-bold hover:bg-[#F6F1E7] md:min-h-0"
              >
                earlier
              </button>
              <span className="min-w-36 text-center text-sm font-bold capitalize">{monthName}</span>
              <button
                onClick={(e) => {
                  ripple(e);
                  shift(1);
                }}
                className="ripple-host pressable min-h-[44px] rounded-full border border-[#0B1F1A]/15 px-4 py-2 text-sm font-bold hover:bg-[#F6F1E7] md:min-h-0"
              >
                later
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#0B1F1A]/65">
            {loading ? "Memuat tabel..." : lokasi + " , " + rows.length + " hari. " + trend}
          </p>
          {!loading && rows.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0B1F1A] px-4 py-1.5 text-xs font-bold capitalize text-[#F6F1E7]">
                Hari ini: {hariIniLabel}
              </span>
              <span className="rounded-full bg-[#E8A33D] px-4 py-1.5 text-xs font-bold text-[#0B1F1A]">
                1 sampai {rows.length} {monthName}
              </span>
              <span className="rounded-full border border-[#0B1F1A]/15 px-4 py-1.5 text-xs font-semibold text-[#0B1F1A]/60">
                Sumber data: {sumber === "myquran" ? "MyQuran" : sumber}
              </span>
            </div>
          )}
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-[#0B1F1A]/10 shadow-none md:shadow-[0_18px_40px_-28px_rgba(11,31,26,0.5)]">
            <table className="w-full min-w-[760px] border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-[#0B1F1A] text-left text-[#F6F1E7]">
                  {["Tanggal", "Imsak", "Subuh", "Terbit", "Dhuha", "Dzuhur", "Ashar", "Maghrib", "Isya"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs tracking-wider">
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const today = i === todayIdx;
                  return (
                    <tr
                      key={r.tanggal + i}
                      id={today ? "tren-hari-ini" : undefined}
                      className={
                        today
                          ? "bg-[#E8A33D]/25 shadow-[inset_4px_0_0_0_#C05621]"
                          : i % 2
                            ? "bg-[#F6F1E7]/60"
                            : "bg-white"
                      }
                    >
                      <td className="px-4 py-3 md:py-2.5 font-bold">
                        <span className="flex items-center gap-2">
                          <span className={today ? "text-[#C05621]" : ""}>{r.tanggal}</span>
                          {today && (
                            <span className="rounded-full bg-[#C05621] px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-white">
                              Hari ini
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 md:py-2.5">{r.imsak}</td>
                      <td className="px-4 py-3 font-semibold md:py-2.5">{r.subuh}</td>
                      <td className="px-4 py-3 md:py-2.5">{r.terbit}</td>
                      <td className="px-4 py-3 md:py-2.5">{r.dhuha}</td>
                      <td className="px-4 py-3 font-semibold md:py-2.5">{r.dzuhur}</td>
                      <td className="px-4 py-3 md:py-2.5">{r.ashar}</td>
                      <td className="px-4 py-3 font-semibold text-[#C05621] md:py-2.5">{r.maghrib}</td>
                      <td className="px-4 py-3 md:py-2.5">{r.isya}</td>
                    </tr>
                  );
                })}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center opacity-60">
                      Data bulan ini belum tersedia, coba bulan berjalan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
