"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SurahItem } from "@/lib/quran";
import { getFinishedSurahs, getLastRead, type LastRead } from "@/lib/db";
import Reveal from "../Reveal";

type Props = {
  list: SurahItem[];
  sumber: string;
};

export default function QuranList({ list, sumber }: Props) {
  const [q, setQ] = useState("");
  const [finished, setFinished] = useState<number[]>([]);
  const [last, setLast] = useState<LastRead | null>(null);

  useEffect(() => {
    getFinishedSurahs()
      .then(setFinished)
      .catch(() => {});
    getLastRead()
      .then(setLast)
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (x) =>
        x.namaLatin.toLowerCase().includes(s) ||
        x.arti.toLowerCase().includes(s) ||
        String(x.nomor) === s ||
        String(x.nomor).padStart(3, "0").includes(s)
    );
  }, [q, list]);

  const pct = Math.round((finished.length / 114) * 100);

  return (
    <div>
      <div className="rounded-3xl border border-[#0E5E4A]/15 bg-[#fffdf7] p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-[0.2em] text-[#0E5E4A]">
            PROGRESS KHATAM: {finished.length}/114 SURAH ({pct}%)
          </p>
          {sumber === "gading" && (
            <p className="text-xs font-semibold text-[#C05621]">Mode cadangan aktif.</p>
          )}
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#0B1F1A]/10">
          <div
            className="h-full w-full origin-left rounded-full bg-[#0E5E4A]"
            style={{ transform: "scaleX(" + pct / 100 + ")" }}
          />
        </div>
        {last && (
          <Link
            href={"/quran/" + last.surah + "#ayat-" + last.ayat}
            className="pressable mt-4 inline-block w-full rounded-full bg-[#E8A33D] px-6 py-2.5 text-center text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] md:w-auto max-md:min-h-[52px] max-md:py-3.5 max-md:text-base"
          >
            Lanjutkan: {last.namaLatin} ayat {last.ayat}
          </Link>
        )}
      </div>

      <div className="mt-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari surah, misal An-Nas atau 114"
          aria-label="Cari surah"
          className="min-h-[48px] w-full rounded-2xl border border-[#0B1F1A]/15 bg-white px-5 py-3 text-sm text-[#0B1F1A] placeholder:text-[#0B1F1A]/40 focus:border-[#E8A33D] focus:outline-none md:min-h-0 max-md:min-h-[56px] max-md:text-base"
        />
        <p className="mt-2 text-xs text-[#0B1F1A]/55">
          Menampilkan {filtered.length} dari 114 surah.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {filtered.map((s, i) => {
          const done = finished.includes(s.nomor);
          return (
            <Reveal key={s.nomor} delay={Math.min(i % 6, 5) * 60}>
              <Link
                href={"/quran/" + s.nomor}
                className="lift block h-full rounded-3xl border border-[#0E5E4A]/15 bg-[#fffdf7] p-5 max-md:min-h-[56px] max-md:rounded-2xl max-md:p-4 max-md:active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F1A] text-sm font-bold text-[#E8A33D]">
                    {s.nomor}
                  </span>
                  <span className="font-arab text-3xl leading-none text-[#0B1F1A]" dir="rtl" lang="ar">
                    {s.nama}
                  </span>
                </div>
                <h2 className="font-display mt-3 text-xl text-[#0B1F1A]">{s.namaLatin}</h2>
                <p className="mt-1 text-sm text-[#0B1F1A]/65">
                  {s.arti} , {s.jumlahAyat} ayat
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs font-bold " +
                      (s.tempatTurun === "Mekah"
                        ? "bg-[#E8A33D]/20 text-[#8a5a12]"
                        : "bg-[#0E5E4A]/15 text-[#0E5E4A]")
                    }
                  >
                    {s.tempatTurun}
                  </span>
                  {done && (
                    <span className="rounded-full bg-[#0E5E4A] px-3 py-1 text-xs font-bold text-white">
                      Selesai
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="mt-8 rounded-3xl bg-white p-8 text-center text-sm text-[#0B1F1A]/60">
          Tidak ada surah yang cocok. Coba kata kunci lain.
        </p>
      )}
    </div>
  );
}
