"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Reveal from "../Reveal";
import { ripple } from "../fx";
import { getFinishedIqroLessons, setLastIqro, toggleIqroLesson } from "@/lib/db";
import { bicaraItem, hentiSuara, simpanPilihanSuara, suaraAktif, suaraTersedia } from "@/lib/suara";
import type { IqroJilid } from "@/lib/iqro";

type Props = {
  jilid: IqroJilid;
};

export default function JilidView({ jilid }: Props) {
  const [done, setDone] = useState<string[]>([]);
  const [hideLatin, setHideLatin] = useState(false);
  const [peek, setPeek] = useState<Record<string, boolean>>({});
  const [suaraOn, setSuaraOn] = useState(true);
  const [ttsOk, setTtsOk] = useState(false);

  useEffect(() => {
    getFinishedIqroLessons().then(setDone).catch(() => {});
  }, []);

  useEffect(() => {
    setSuaraOn(suaraAktif());
    setTtsOk(suaraTersedia());
    return () => {
      hentiSuara();
    };
  }, []);

  const ids = useMemo(() => jilid.pelajaran.map((p) => p.id), [jilid]);
  const doneHere = ids.filter((id) => done.includes(id)).length;
  const pct = ids.length ? Math.round((doneHere / ids.length) * 100) : 0;

  // Tandai manual = progress lokal saja, bukan bukti lulus.
  // Bukti lulus resmi hanya dari server via ujian.
  const toggleDone = async (lessonId: string) => {
    hentiSuara();
    const next = await toggleIqroLesson(lessonId).catch(() => done);
    setDone(next);
    await setLastIqro({ jilid: jilid.jilid, lessonId }).catch(() => {});
  };

  const ucap = (arab: string, latin: string) => {
    if (suaraOn) bicaraItem(arab, latin);
  };

  const toggleSuara = () => {
    const next = !suaraOn;
    setSuaraOn(next);
    simpanPilihanSuara(next);
    if (!next) hentiSuara();
  };

  return (
    <main>
      <section className="relative overflow-hidden pt-28 pb-10 md:pt-36" style={{ background: jilid.cover }}>
        <div className="kawung-dark absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal>
            <Link href="/iqro" className="text-xs font-bold tracking-[0.25em] opacity-80" style={{ color: jilid.coverText }}>
              KEMBALI KE DAFTAR JILID
            </Link>
            <h1 className="font-display mt-3 text-4xl leading-tight md:text-6xl" style={{ color: jilid.coverText }}>
              {jilid.judul}
            </h1>
            <p className="mt-3 max-w-2xl opacity-85" style={{ color: jilid.coverText }}>
              {jilid.deskripsi}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div
              className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl p-5"
              style={{ background: "rgba(255,255,255,0.16)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-[0.2em]" style={{ color: jilid.coverText }}>
                  PROGRESS JILID {jilid.jilid}: {doneHere}/{ids.length} ({pct}%)
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/20">
                  <div
                    className="h-full w-full origin-left rounded-full bg-white"
                    style={{ transform: "scaleX(" + pct / 100 + ")" }}
                  />
                </div>
              </div>
              <button
                onClick={() => setHideLatin((v) => !v)}
                className="pressable shrink-0 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#0B1F1A] max-md:min-h-[48px]"
              >
                {hideLatin ? "Tampilkan latin" : "Sembunyi latin"}
              </button>
              <Link
                href={"/iqro/" + jilid.jilid + "/ujian"}
                className="pressable shrink-0 rounded-full bg-[#0B1F1A] px-6 py-2.5 text-sm font-bold text-[#F6F1E7] max-md:min-h-[48px] max-md:py-3"
              >
                Mulai ujian (penentu lulus server)
              </Link>
              <p className="w-full text-xs opacity-70" style={{ color: jilid.coverText }}>
                Tandai manual hanya progress lokal. Lulus resmi wajib via ujian server.
              </p>
              {ttsOk && (
                <button
                  onClick={toggleSuara}
                  aria-pressed={suaraOn}
                  className="tombol-suara pressable shrink-0 rounded-full bg-white/25 px-6 py-2.5 text-sm font-bold max-md:min-h-[48px]"
                  style={{ color: jilid.coverText }}
                >
                  {suaraOn ? "Suara on" : "Suara off"}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-10 md:py-14">
        <div className="mx-auto max-w-6xl space-y-8 px-5">
          {jilid.pelajaran.map((pel, idx) => {
            const isDone = done.includes(pel.id);
            return (
              <Reveal key={pel.id} delay={Math.min(idx % 4, 3) * 60}>
                <article id={pel.id} className="scroll-mt-28 rounded-[2rem] border border-[#0B1F1A]/10 bg-[#fffdf7] p-6 md:p-8 max-md:rounded-3xl max-md:p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate text-xs font-bold tracking-[0.2em] text-[#0E5E4A]">
                        {pel.judul.toUpperCase()}
                      </p>
                      <p className="mt-1 min-w-0 text-sm break-words text-[#0B1F1A]/65">{pel.tujuan}</p>
                    </div>
                    <button
                      onClick={() => toggleDone(pel.id)}
                      className={
                        "pressable min-h-[44px] shrink-0 rounded-full px-5 py-2.5 text-sm font-bold max-md:w-full max-md:min-h-[48px] " +
                        (isDone
                          ? "bg-[#0E5E4A] text-white"
                          : "bg-[#0B1F1A] text-[#F6F1E7] hover:bg-[#0E2A22]")
                      }
                    >
                      {isDone ? "Selesai (manual), batalkan" : "Tandai selesai (manual)"}
                    </button>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pel.items.map((it) => {
                      const key = pel.id + it.arab + it.latin;
                      const shown = !hideLatin || peek[key];
                      return (
                        <div key={key} className="lift min-w-0 rounded-3xl bg-[#F6F1E7] p-5 text-center max-md:p-4">
                          <button
                            onClick={() => ucap(it.arab, it.latin)}
                            aria-label={"Dengar bacaan " + it.latin}
                            className="tombol-suara pressable block w-full min-w-0 cursor-pointer touch-manipulation select-none"
                          >
                            <span className="font-arab block min-w-0 text-5xl leading-[2] break-words text-[#0B1F1A] md:text-6xl" dir="rtl" lang="ar">
                              {it.arab}
                            </span>
                          </button>
                          {ttsOk && (
                            <button
                            onClick={() => ucap(it.arab, it.latin)}
                              className="tombol-suara pressable mt-3 rounded-full bg-[#0E5E4A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#147a5f] max-md:min-h-[44px] max-md:px-6 max-md:py-2.5 max-md:text-sm"
                            >
                              Dengar
                            </button>
                          )}
                          <div className="mt-2 min-h-7">
                            {shown ? (
                              <p className="text-lg font-bold text-[#0E5E4A]">{it.latin}</p>
                            ) : (
                              <button
                                onClick={(e) => {
                                  ripple(e);
                                  setPeek((p) => ({ ...p, [key]: true }));
                                }}
                                className="pressable rounded-full border border-[#0B1F1A]/20 px-4 py-1.5 text-xs font-bold text-[#0B1F1A]/70"
                              >
                                Intip latin
                              </button>
                            )}
                          </div>
                          {hideLatin && peek[key] && (
                            <button
                              onClick={() => setPeek((p) => ({ ...p, [key]: false }))}
                              className="mt-1 text-xs font-semibold text-[#0B1F1A]/50 hover:text-[#0B1F1A]"
                            >
                              Sembunyi lagi
                            </button>
                          )}
                          <p className="mt-2 inline-block rounded-full bg-[#E8A33D]/20 px-3 py-1 text-xs font-bold text-[#8a5a12]">
                            {it.kaidah}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-[#0B1F1A]/65">{it.catatan}</p>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </Reveal>
            );
          })}

          <div className="cta-iqro-bar rounded-3xl bg-[#fffdf7]/95 p-4 md:bg-transparent md:p-0 max-md:rounded-2xl max-md:border max-md:border-[#0B1F1A]/10">
            <p className="text-xs font-bold tracking-[0.2em] text-[#0E5E4A] md:hidden">
              JILID {jilid.jilid}: {doneHere}/{ids.length} ({pct}%)
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 max-md:mt-2 max-md:grid max-md:grid-cols-1 max-md:gap-2.5">
            <Link href="/iqro" className="pressable text-sm font-bold text-[#0E5E4A] hover:text-[#0B1F1A] max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center max-md:rounded-full max-md:border max-md:border-[#0B1F1A]/15">
              Kembali ke daftar jilid
            </Link>
            {jilid.jilid < 6 ? (
              <Link
                href={"/iqro/" + (jilid.jilid + 1)}
                className="pressable rounded-full bg-[#0B1F1A] px-6 py-3 text-sm font-bold text-[#F6F1E7] max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center max-md:text-base"
              >
                Lanjut ke Jilid {jilid.jilid + 1}
              </Link>
            ) : (
              <Link
                href="/iqro/latihan"
                className="pressable rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center max-md:text-base"
              >
                Latihan Juz Amma
              </Link>
            )}
          </div>
          </div>
        </div>
      </section>
    </main>
  );
}
