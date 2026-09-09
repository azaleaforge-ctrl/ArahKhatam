"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Reveal from "../Reveal";
import { ripple } from "../fx";
import { sfxBenar } from "@/lib/sfx";
import { bicaraItem, hentiSuara, suaraAktif } from "@/lib/suara";
import { getFinishedIqroLessons, setLastIqro, toggleIqroLesson } from "@/lib/db";
import type { IqroJilid } from "@/lib/iqro";

type Props = {
  jilid: IqroJilid;
};

// Soal tampil saja: tanpa kunci jawaban. Penilaian mutlak di server.
type SoalTampil = {
  id: string;
  arab: string;
  options: string[];
};

const JUMLAH_SOAL = 10;
// Display saja, bukan otoritas kelulusan. Otoritas: res.lulus dari POST /api/iqro/ujian.
const AMBANG_LULUS_DISPLAY = 7;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

// 10 soal acak dari item jilid. Tanpa audio agar tetap ujian.
function buildSoal(jilid: IqroJilid): SoalTampil[] {
  const pool = jilid.pelajaran.flatMap((p) => p.items);
  if (!pool.length) return [];
  const unik = [...new Set(pool.map((x) => x.latin))];
  const acak = shuffle(pool);
  return Array.from({ length: JUMLAH_SOAL }, (_, i) => {
    const item = acak[i % acak.length];
    const lain = shuffle(unik.filter((l) => l !== item.latin));
    while (lain.length < 3) lain.push(...shuffle(unik));
    return { id: item.arab, arab: item.arab, options: shuffle([item.latin, ...lain.slice(0, 3)]) };
  });
}

type HasilServer = { score: number; lulus: boolean; threshold: number };

export default function UjianView({ jilid }: Props) {
  const [ronde, setRonde] = useState(0);
  const [qi, setQi] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [selesai, setSelesai] = useState(false);
  const [ditandai, setDitandai] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilServer | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const soal = useMemo(() => buildSoal(jilid), [jilid, ronde]);
  const ids = useMemo(() => jilid.pelajaran.map((p) => p.id), [jilid]);

  useEffect(() => {
    getFinishedIqroLessons()
      .then((done) => setDitandai(ids.every((id) => done.includes(id))))
      .catch(() => {});
  }, [ids]);

  useEffect(
    () => () => {
      hentiSuara();
    },
    []
  );

  const nilaiKeServer = async (finalPicks: string[]) => {
    setMengirim(true);
    setGalat(null);
    try {
      const res = await fetch("/api/iqro/ujian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jilid: jilid.jilid,
          answers: soal.map((s, i) => ({ id: s.id, pick: finalPicks[i] ?? "" })),
        }),
      });
      const data = (await res.json()) as HasilServer & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Penilaian gagal.");
      setHasil({ score: data.score, lulus: data.lulus, threshold: data.threshold });
      if (data.lulus) {
        try {
          sfxBenar();
          if (suaraAktif()) bicaraItem("الْحَمْدُ لِلَّهِ", "Alhamdulillah");
        } catch {
          // abaikan
        }
      }
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Penilaian gagal, coba lagi.");
    } finally {
      setMengirim(false);
    }
  };

  const current = soal[qi] ?? null;
  const lulus = hasil?.lulus === true;

  const jawab = (opt: string, e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    if (picked || !current || selesai) return;
    setPicked(opt);
    const finalPicks = [...picks, opt];
    setTimeout(() => {
      setPicks(finalPicks);
      if (qi + 1 >= soal.length) {
        setSelesai(true);
        void nilaiKeServer(finalPicks);
      } else {
        setQi(qi + 1);
        setPicked(null);
      }
    }, 350);
  };

  const ulangi = (e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    hentiSuara();
    setRonde((r) => r + 1);
    setQi(0);
    setPicks([]);
    setPicked(null);
    setSelesai(false);
    setHasil(null);
    setGalat(null);
  };

  const cobaNilaiLagi = (e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    if (picks.length >= soal.length && soal.length) void nilaiKeServer(picks);
  };

  const tandaiSemua = async (e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    if (hasil?.lulus !== true) return;
    try {
      const done = await getFinishedIqroLessons();
      for (const id of ids) {
        if (!done.includes(id)) await toggleIqroLesson(id);
      }
      await setLastIqro({ jilid: jilid.jilid, lessonId: ids[ids.length - 1] });
      setDitandai(true);
    } catch {
      // abaikan, coba lagi dari tombol yang sama
    }
  };

  return (
    <main className="min-w-0 overflow-x-clip">
      <section className="relative overflow-hidden pt-28 pb-8 md:pt-36 md:pb-10" style={{ background: jilid.cover }}>
        <div className="kawung-dark absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-3xl min-w-0 px-4 text-center">
          <Reveal>
            <Link href={"/iqro/" + jilid.jilid} className="text-xs font-bold tracking-[0.25em] opacity-80" style={{ color: jilid.coverText }}>
              KEMBALI KE JILID {jilid.jilid}
            </Link>
            <h1 className="font-display mt-3 text-4xl leading-tight md:text-5xl" style={{ color: jilid.coverText }}>
              Ujian Jilid {jilid.jilid}
            </h1>
            <p className="mx-auto mt-3 max-w-xl opacity-85" style={{ color: jilid.coverText }}>
              {JUMLAH_SOAL} soal acak dari jilid ini. Nilai kelulusan {AMBANG_LULUS_DISPLAY * 10} (penentu: server).
              Tanpa suara bacaan agar tetap ujian.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0B1F1A] py-8 md:py-12">
        <div className="mx-auto w-full max-w-[680px] min-w-0 px-4 md:max-w-3xl md:px-6">
          <Reveal>
            <div className="rounded-3xl border border-[#E8A33D]/40 bg-[#0E2A22] p-6 max-md:p-4 md:p-8">
              {!selesai && current ? (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">
                    SOAL {qi + 1}/{soal.length}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-[#E8A33D]"
                      style={{ width: Math.round((qi / soal.length) * 100) + "%" }}
                    />
                  </div>
                  <p className="font-arab mt-4 min-w-0 max-w-full text-center text-4xl leading-[2] break-words text-[#F6F1E7] min-[375px]:text-5xl max-md:px-2" dir="rtl" lang="ar">
                    {current.arab}
                  </p>
                  <p className="mt-2 text-center text-sm text-[#F6F1E7]/70">
                    Pilih bacaan latin yang tepat. Tanpa suara, tebak dari ingatanmu.
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2 max-md:gap-3">
                    {current.options.map((opt) => {
                      const dipilih = picked === opt;
                      return (
                        <button
                          key={opt}
                          onClick={(e) => jawab(opt, e)}
                          disabled={!!picked}
                          className={
                            "pressable rounded-2xl px-5 py-3 text-sm font-bold max-md:min-h-[56px] max-md:py-4 max-md:text-base " +
                            (dipilih
                              ? "bg-[#E8A33D] text-[#0B1F1A]"
                              : "bg-white/10 text-[#F6F1E7] hover:bg-white/20")
                          }
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {mengirim ? (
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">MENILAI</p>
                      <p className="mt-2 text-sm text-[#F6F1E7]/80">Mengirim jawaban ke server…</p>
                    </div>
                  ) : galat && !hasil ? (
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">GAGAL MENILAI</p>
                      <p className="mx-auto mt-2 max-w-md text-sm text-[#F6F1E7]/80">{galat}</p>
                      <div className="mt-5 flex flex-wrap justify-center gap-2 max-md:grid max-md:grid-cols-1">
                        <button
                          onClick={cobaNilaiLagi}
                          className="pressable inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#E8A33D] px-6 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558]"
                        >
                          Coba kirim lagi
                        </button>
                        <button
                          onClick={ulangi}
                          className="pressable inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-bold text-[#F6F1E7] hover:bg-white/10"
                        >
                          Ulangi ujian
                        </button>
                      </div>
                    </div>
                  ) : hasil ? (
                    <div>
                      <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">
                        {lulus ? "LULUS (SERVER)" : "BELUM LULUS (SERVER)"}
                      </p>
                      <p className="font-display mt-2 text-5xl text-[#F6F1E7]">
                        {hasil.score * 10}
                      </p>
                      <p className="mt-1 text-sm text-[#F6F1E7]/70">
                        {hasil.score} dari {soal.length} soal benar, batas lulus {hasil.threshold * 10}.
                      </p>
                      {lulus ? (
                        <div>
                          <p className="font-arab mt-4 text-4xl text-[#E8A33D]" dir="rtl" lang="ar">
                            الْحَمْدُ لِلَّهِ
                          </p>
                          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#F6F1E7]/80">
                            Selamat, kamu lulus ujian Jilid {jilid.jilid}. Barakallah, tandai pelajaran
                            jilid ini selesai lalu lanjut ke jilid berikutnya.
                          </p>
                          <div className="cta-iqro-bar mt-5 flex flex-wrap justify-center gap-2 rounded-2xl max-md:grid max-md:grid-cols-1 max-md:gap-2.5 max-md:bg-[#0E2A22]/95 max-md:p-3">
                            {ditandai ? (
                              <span className="rounded-full bg-[#0E5E4A] px-6 py-2.5 text-center text-sm font-bold text-white max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center">
                                Jilid ini sudah ditandai selesai
                              </span>
                            ) : (
                              <button
                                onClick={tandaiSemua}
                                className="ripple-host pressable rounded-full bg-[#E8A33D] px-6 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] max-md:min-h-[52px] max-md:w-full"
                              >
                                Tandai selesai (lulus ujian server)
                              </button>
                            )}
                            {jilid.jilid < 6 ? (
                              <Link
                                href={"/iqro/" + (jilid.jilid + 1)}
                                className="pressable rounded-full border border-white/25 px-6 py-2.5 text-sm font-bold text-[#F6F1E7] hover:bg-white/10 max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center"
                              >
                                Lanjut ke Jilid {jilid.jilid + 1}
                              </Link>
                            ) : (
                              <Link
                                href="/iqro/latihan"
                                className="pressable rounded-full border border-white/25 px-6 py-2.5 text-sm font-bold text-[#F6F1E7] hover:bg-white/10 max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center"
                              >
                                Latihan Juz Amma
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#F6F1E7]/80">
                            Skor {hasil.score * 10} belum sampai {hasil.threshold * 10}. Baca ulang kartu pelajaran jilid ini,
                            lalu coba lagi sampai lulus.
                          </p>
                          <div className="cta-iqro-bar mt-5 flex flex-wrap justify-center gap-2 rounded-2xl max-md:grid max-md:grid-cols-1 max-md:gap-2.5 max-md:bg-[#0E2A22]/95 max-md:p-3">
                            <button
                              onClick={ulangi}
                              className="ripple-host pressable min-h-[44px] rounded-full bg-[#E8A33D] px-6 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] max-md:min-h-[52px] max-md:w-full"
                            >
                              Coba lagi
                            </button>
                            <Link
                              href={"/iqro/" + jilid.jilid}
                              className="pressable rounded-full border border-white/25 px-6 py-2.5 text-sm font-bold text-[#F6F1E7] hover:bg-white/10 max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center"
                            >
                              Baca pelajaran dulu
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
