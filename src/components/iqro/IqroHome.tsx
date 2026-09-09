"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Reveal from "../Reveal";
import { ripple } from "../fx";
import { getFinishedIqroLessons, getLastIqro, type LastIqro } from "@/lib/db";
import type { IqroJilid } from "@/lib/iqro";

type Props = {
  jilids: IqroJilid[];
};

export default function IqroHome({ jilids }: Props) {
  const [done, setDone] = useState<string[]>([]);
  const [last, setLast] = useState<LastIqro | null>(null);

  useEffect(() => {
    getFinishedIqroLessons().then(setDone).catch(() => {});
    getLastIqro().then(setLast).catch(() => {});
  }, []);

  const totalLessons = useMemo(() => jilids.reduce((a, j) => a + j.pelajaran.length, 0), [jilids]);
  const doneCount = done.length;

  const lastJilid = last ? jilids.find((j) => j.jilid === last.jilid) : null;
  const lastLesson = lastJilid?.pelajaran.find((p) => p.id === last?.lessonId) ?? null;

  return (
    <main className="min-w-0 overflow-x-clip">
      <section className="kawung-dark relative overflow-hidden bg-[#0B1F1A] pt-28 pb-10 md:pt-36 md:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[760px] max-w-[100vw] -translate-x-1/2 rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.4), transparent)" }}
        />
        <div className="relative mx-auto w-full max-w-[680px] min-w-0 px-4 md:max-w-6xl md:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E8A33D]">BELAJAR IQRO</p>
            <h1 className="font-display mt-2 max-w-2xl text-balance text-[1.9rem] leading-tight tracking-tight text-[#F6F1E7] md:text-6xl">
              Dari huruf tunggal sampai lancar waqaf.
            </h1>
            <p className="mt-4 max-w-2xl text-[#F6F1E7]/75">
              Enam jilid bertahap dengan kartu baca arab besar, mode sembunyi latin untuk
              latihan, dan progress tersimpan di perangkatmu.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">
                  PROGRESS: {doneCount}/{totalLessons} PELAJARAN
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full w-full origin-left rounded-full bg-[#E8A33D]"
                    style={{ transform: "scaleX(" + (totalLessons ? doneCount / totalLessons : 0) + ")" }}
                  />
                </div>
              </div>
              {last && lastJilid ? (
                <Link
                  href={"/iqro/" + last.jilid + "#" + last.lessonId}
                  className="ripple-host pressable shrink-0 rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] max-md:min-h-[52px] max-md:w-full max-md:py-3.5 max-md:text-center max-md:text-base"
                >
                  Lanjutkan: Jilid {last.jilid}{lastLesson ? ", " + lastLesson.judul : ""}
                </Link>
              ) : (
                <Link
                  href="/iqro/1"
                  onClick={ripple}
                  className="ripple-host pressable shrink-0 rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] max-md:min-h-[52px] max-md:w-full max-md:py-3.5 max-md:text-center max-md:text-base"
                >
                  Mulai dari Jilid 1
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-8 md:py-14">
        <div className="mx-auto w-full max-w-[680px] min-w-0 px-4 md:max-w-6xl md:px-6">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0E5E4A]">ENAM JILID</p>
            <h2 className="font-display mt-2 text-[1.65rem] tracking-tight text-[#0B1F1A] md:text-4xl">Pilih jilid belajarmu</h2>
          </Reveal>
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {jilids.map((j, i) => {
              const ids = j.pelajaran.map((p) => p.id);
              const n = ids.filter((id) => done.includes(id)).length;
              const pct = Math.round((n / ids.length) * 100);
              return (
                <Reveal key={j.jilid} delay={Math.min(i % 6, 5) * 60}>
                  <Link
                    href={"/iqro/" + j.jilid}
                    className="lift block h-full overflow-hidden rounded-3xl border border-[#0B1F1A]/10 bg-[#fffdf7]"
                  >
                    <div className="flex items-center gap-4 p-5" style={{ background: j.cover }}>
                      <span
                        className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
                        style={{ background: "rgba(255,255,255,0.22)", color: j.coverText }}
                      >
                        {j.jilid}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold tracking-[0.2em] opacity-80" style={{ color: j.coverText }}>
                          JILID {j.jilid}
                        </p>
                        <p className="truncate text-lg font-bold leading-snug" style={{ color: j.coverText }}>
                          {j.judul.replace("Jilid " + j.jilid + ": ", "")}
                        </p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm leading-relaxed text-[#0B1F1A]/70">{j.deskripsi}</p>
                      <p className="mt-3 text-xs font-bold text-[#0E5E4A]">
                        {n}/{ids.length} PELAJARAN ({pct}%)
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#0B1F1A]/10">
                        <div
                          className="h-full w-full origin-left rounded-full bg-[#0E5E4A]"
                          style={{ transform: "scaleX(" + pct / 100 + ")" }}
                        />
                      </div>
                      <p className="mt-3 text-sm font-bold text-[#0B1F1A]">
                        {j.pelajaran.length} pelajaran plus ujian 10 soal
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf7] py-8 md:py-14">
        <div className="mx-auto grid w-full max-w-[680px] min-w-0 grid-cols-1 gap-3 px-4 sm:grid-cols-2 md:max-w-6xl md:gap-4 md:px-6">
          <Reveal>
            <Link
              href="/iqro/makhraj"
              className="lift block h-full min-w-0 rounded-[2rem] bg-[#0B1F1A] p-8 max-md:rounded-3xl max-md:p-4"
            >
              <p className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">REFERENSI</p>
              <h2 className="font-display mt-2 text-2xl text-[#F6F1E7] md:text-3xl">
                Makhraj 28 huruf
              </h2>
              <p className="mt-2 text-sm text-[#F6F1E7]/70">
                Tempat keluar tiap huruf berdasar 5 makhraj utama, bisa disaring.
              </p>
            </Link>
          </Reveal>
          <Reveal delay={90}>
            <Link
              href="/iqro/latihan"
              className="lift block h-full min-w-0 rounded-[2rem] border border-[#0E5E4A]/20 bg-[#F6F1E7] p-8 max-md:rounded-3xl max-md:p-4"
            >
              <p className="text-xs font-bold tracking-[0.25em] text-[#0E5E4A]">PRAKTIK</p>
              <h2 className="font-display mt-2 text-2xl text-[#0B1F1A] md:text-3xl">
                Latihan Juz Amma
              </h2>
              <p className="mt-2 text-sm text-[#0B1F1A]/70">
                Rekomendasi 10 surah pendek untuk latihan setelah Iqro.
              </p>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
