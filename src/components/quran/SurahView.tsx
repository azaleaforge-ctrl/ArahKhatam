"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_QARI,
  QARI_LIST,
  pickFullAudio,
  pickPartialAudio,
  type SurahDetail,
  type TafsirAyat,
} from "@/lib/quran";
import { getFinishedSurahs, getKaraokeTiming, setKaraokeTiming, setLastRead, toggleFinishedSurah } from "@/lib/db";
import { fetchKaraoke, type KaraokeSegment, type KaraokeTiming } from "@/lib/karaoke";
import { ripple } from "../fx";

type Props = {
  detail: SurahDetail;
};

export default function SurahView({ detail }: Props) {
  const [qari, setQari] = useState(DEFAULT_QARI);
  const [showLatin, setShowLatin] = useState(true);
  const [showArti, setShowArti] = useState(true);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState("");
  const [playingAyat, setPlayingAyat] = useState<number | null>(null);
  const [seqIdx, setSeqIdx] = useState<number | null>(null);
  const [karaoke, setKaraoke] = useState(false);
  const [kataIdx, setKataIdx] = useState<number | null>(null);
  const [karaokeData, setKaraokeData] = useState<Record<string, KaraokeTiming | null>>({});
  const kataPosRef = useRef<number | null>(null);
  const karaokeRef = useRef<Record<string, KaraokeTiming | null>>({});
  const rafSeqRef = useRef(0);
  const rafPrevRef = useRef(0);
  const sesiPrevRef = useRef(0);
  const [openTafsir, setOpenTafsir] = useState<number | null>(null);
  const [tafsir, setTafsir] = useState<TafsirAyat[] | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const seqRef = useRef<HTMLAudioElement | null>(null);
  const fullRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    getFinishedSurahs()
      .then((f) => setDone(f.includes(detail.nomor)))
      .catch(() => {});
  }, [detail.nomor]);

  useEffect(
    () => () => {
      previewRef.current?.pause();
      seqRef.current?.pause();
      fullRef.current?.pause();
      sesiPrevRef.current++;
      try {
        cancelAnimationFrame(rafSeqRef.current);
        cancelAnimationFrame(rafPrevRef.current);
      } catch {
        // abaikan
      }
    },
    []
  );

  const hentiLoopSeq = () => {
    try {
      cancelAnimationFrame(rafSeqRef.current);
    } catch {
      // abaikan
    }
  };

  const hentiLoopPrev = () => {
    try {
      cancelAnimationFrame(rafPrevRef.current);
    } catch {
      // abaikan
    }
  };

  // Ambil timing dari cache memori, IndexedDB, atau fetch malas, lalu simpan.
  const ambilTiming = async (nomorAyat: number): Promise<KaraokeTiming | null> => {
    const key = detail.nomor + ":" + nomorAyat;
    let data = karaokeRef.current[key];
    if (data !== undefined) return data;
    data = await getKaraokeTiming(key).catch(() => null);
    if (data === null) {
      try {
        const fresh = await fetchKaraoke(detail.nomor, nomorAyat);
        try {
          await setKaraokeTiming(key, fresh);
        } catch {
          // abaikan, cache hanya pemanis
        }
        data = fresh;
      } catch {
        data = null;
      }
    }
    karaokeRef.current[key] = data;
    setKaraokeData((m) => (m[key] === undefined ? { ...m, [key]: data } : m));
    return data;
  };

  // Sorot kata mengikuti posisi audio, setState hanya bila kata berubah.
  const mulaiSorot = (
    elem: HTMLAudioElement,
    segs: KaraokeSegment[],
    slot: { current: number }
  ) => {
    try {
      cancelAnimationFrame(slot.current);
    } catch {
      // abaikan
    }
    kataPosRef.current = null;
    setKataIdx(null);
    const loop = () => {
      try {
        const t = elem.currentTime * 1000;
        let pos: number | null = null;
        for (const s of segs) {
          if (t >= s.startMs && t < s.endMs) {
            pos = s.position;
            break;
          }
        }
        if (pos !== kataPosRef.current) {
          kataPosRef.current = pos;
          setKataIdx(pos);
        }
      } catch {
        // abaikan, loop lanjut jalan
      }
      slot.current = requestAnimationFrame(loop);
    };
    slot.current = requestAnimationFrame(loop);
  };

  const stopSeq = () => {
    seqRef.current?.pause();
    if (seqRef.current) seqRef.current.removeAttribute("src");
    hentiLoopSeq();
    kataPosRef.current = null;
    setKataIdx(null);
    setSeqIdx(null);
  };

  // Ganti surah berarti buang cache kata surah lama agar tidak tertukar.
  useEffect(() => {
    karaokeRef.current = {};
    kataPosRef.current = null;
    setKaraokeData({});
    setKataIdx(null);
  }, [detail.nomor]);

  // Hanya satu sumber bunyi yang boleh hidup dalam satu waktu.
  const stopFull = () => {
    try {
      fullRef.current?.pause();
    } catch {
      // abaikan
    }
  };

  const stopPreview = () => {
    sesiPrevRef.current++;
    hentiLoopPrev();
    try {
      previewRef.current?.pause();
    } catch {
      // abaikan
    }
    kataPosRef.current = null;
    setKataIdx(null);
    setPlayingAyat(null);
  };

  // Putar ayat satuan. Saat karaoke aktif ikut memakai audio verses.quran.com
  // plus highlight per kata. Eksklusivitas audio lama tetap jalan.
  const playPreview = async (ayat: number) => {
    const mauJeda = playingAyat === ayat && !(previewRef.current?.paused ?? true);
    stopSeq();
    stopFull();
    stopPreview();
    const a = previewRef.current;
    if (!a || mauJeda) return;
    const sesi = ++sesiPrevRef.current;
    if (karaoke) {
      const data = await ambilTiming(ayat).catch(() => null);
      if (sesi !== sesiPrevRef.current) return;
      if (!data) {
        setNotice("Timing kata ayat " + ayat + " belum tersedia, ayat ini diputar normal.");
        a.src = pickPartialAudio(detail.ayat[ayat - 1]?.audio, detail.nomor, ayat, qari);
      } else {
        a.src = data.audioUrl;
      }
    } else {
      a.src = pickPartialAudio(detail.ayat[ayat - 1]?.audio, detail.nomor, ayat, qari);
    }
    try {
      await a.play();
    } catch {
      if (sesi === sesiPrevRef.current) setPlayingAyat(null);
      return;
    }
    if (sesi !== sesiPrevRef.current) {
      a.pause();
      return;
    }
    setPlayingAyat(ayat);
    if (karaoke) {
      const data = karaokeRef.current[detail.nomor + ":" + ayat];
      if (data) mulaiSorot(a, data.segments, rafPrevRef);
    }
  };

  // Putar semua ayat berurutan, maju saat audio selesai.
  // Mode karaoke memakai audio verses.quran.com plus timing segments dari
  // respons yang sama. Mode mati memakai audio equran.id seperti semula.
  useEffect(() => {
    if (seqIdx === null) return;
    const item = detail.ayat[seqIdx];
    const el = seqRef.current;
    if (!item || !el) {
      setSeqIdx(null);
      return;
    }
    // Ganti ayat berarti mulai lagi dari kata pertama.
    kataPosRef.current = null;
    setKataIdx(null);
    let hidup = true;
    const onEnded = () => {
      setSeqIdx((i) => (i === null || i + 1 >= detail.ayat.length ? null : i + 1));
    };
    // Ikuti ayat yang sedang dibaca agar tidak perlu scroll manual.
    const scrollIkut = () => {
      try {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document
          .getElementById("ayat-" + item.nomorAyat)
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      } catch {
        // abaikan, pemutaran tetap jalan walau scroll gagal
      }
    };
    const putarNormal = () => {
      if (!hidup) return;
      el.src = pickPartialAudio(item.audio, detail.nomor, item.nomorAyat, qari);
      el.addEventListener("ended", onEnded);
      void el.play().catch(() => {
        if (hidup) setSeqIdx(null);
      });
      scrollIkut();
    };
    // Timing diambil malas saat ayat pertama diputar lalu disimpan agar hemat.
    const putarKaraoke = async () => {
      const data = await ambilTiming(item.nomorAyat).catch(() => null);
      if (!hidup) return;
      if (!data) {
        setNotice("Timing kata ayat " + item.nomorAyat + " belum tersedia, ayat ini diputar normal.");
        putarNormal();
        return;
      }
      el.src = data.audioUrl;
      el.addEventListener("ended", onEnded);
      try {
        await el.play();
      } catch {
        if (hidup) setSeqIdx(null);
        return;
      }
      if (!hidup) return;
      scrollIkut();
      mulaiSorot(el, data.segments, rafSeqRef);
    };
    if (karaoke) void putarKaraoke();
    else putarNormal();
    return () => {
      hidup = false;
      hentiLoopSeq();
      el.removeEventListener("ended", onEnded);
    };
  }, [seqIdx, qari, detail, karaoke]);

  const toggleKaraoke = (e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    stopSeq();
    stopPreview();
    const next = !karaoke;
    if (next) setQari(DEFAULT_QARI);
    setKaraoke(next);
  };

  // Satu state seqIdx menggerakkan audio, highlight kartu, label Diputar,
  // dan scroll pengikut sekaligus, jadi penanda selalu tepat pada ayat yang berbunyi.
  const seqAyat = seqIdx !== null ? detail.ayat[seqIdx]?.nomorAyat ?? null : null;

  const markAyat = async (ayat: number) => {
    await setLastRead({ surah: detail.nomor, ayat, namaLatin: detail.namaLatin });
    setNotice("Ditandai: " + detail.namaLatin + " ayat " + ayat + ". Lanjut lagi dari sini kapan pun.");
  };

  const toggleDone = async () => {
    const next = await toggleFinishedSurah(detail.nomor);
    setDone(next.includes(detail.nomor));
    setNotice(
      next.includes(detail.nomor)
        ? detail.namaLatin + " selesai. Barakallah, progress khatam bertambah."
        : "Tanda selesai untuk " + detail.namaLatin + " dibatalkan."
    );
  };

  const ensureTafsir = async () => {
    if (tafsir || tafsirLoading) return;
    setTafsirLoading(true);
    try {
      const res = await fetch("/api/quran/tafsir/" + detail.nomor);
      const json = await res.json();
      if (Array.isArray(json.tafsir)) setTafsir(json.tafsir);
      else setNotice("Tafsir belum bisa dimuat, coba lagi.");
    } catch {
      setNotice("Tafsir belum bisa dimuat, coba lagi.");
    } finally {
      setTafsirLoading(false);
    }
  };

  const toggleTafsirAyat = (ayat: number) => {
    setOpenTafsir((cur) => (cur === ayat ? null : ayat));
    void ensureTafsir();
  };

  const tafsirFor = (ayat: number) => tafsir?.find((t) => t.ayat === ayat)?.teks ?? "";

  const prev = detail.sebelumnya ?? (detail.nomor > 1 ? { nomor: detail.nomor - 1, namaLatin: "" } : null);
  const next = detail.sesudah ?? (detail.nomor < 114 ? { nomor: detail.nomor + 1, namaLatin: "" } : null);

  return (
    <div>
      <audio
        ref={previewRef}
        onEnded={() => {
          hentiLoopPrev();
          kataPosRef.current = null;
          setKataIdx(null);
          setPlayingAyat(null);
        }}
        className="hidden"
        preload="none"
      />
      <audio ref={seqRef} className="hidden" preload="none" />

      <div className="min-w-0 rounded-3xl border border-[#0E5E4A]/15 bg-[#fffdf7] p-5 max-md:p-4 md:p-7">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <label className="flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-2 text-sm font-bold text-[#0B1F1A]">
            Qari
            <select
              value={qari}
              disabled={karaoke}
              onChange={(e) => setQari(e.target.value)}
              className="min-w-0 max-w-full flex-1 truncate rounded-full border border-[#0B1F1A]/15 bg-white px-4 py-2 text-sm font-semibold focus:border-[#E8A33D] focus:outline-none disabled:opacity-60"
            >
              {QARI_LIST.map((q) => (
                <option key={q.code} value={q.code}>
                  {q.code} , {q.nama}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={(e) => {
                ripple(e);
                setShowLatin((v) => !v);
              }}
              className={
                "pressable rounded-full px-4 py-2 text-sm font-bold " +
                (showLatin ? "bg-[#0B1F1A] text-[#F6F1E7]" : "bg-[#0B1F1A]/10 text-[#0B1F1A]")
              }
            >
              Latin {showLatin ? "on" : "off"}
            </button>
            <button
              onClick={(e) => {
                ripple(e);
                setShowArti((v) => !v);
              }}
              className={
                "pressable rounded-full px-4 py-2 text-sm font-bold " +
                (showArti ? "bg-[#0B1F1A] text-[#F6F1E7]" : "bg-[#0B1F1A]/10 text-[#0B1F1A]")
              }
            >
              Terjemah {showArti ? "on" : "off"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-[#0B1F1A] p-4 md:p-5">
          <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">AUDIO SATU SURAH PENUH</p>
          <audio
            ref={fullRef}
            controls
            preload="none"
            src={pickFullAudio(detail.audioFull, detail.nomor, qari)}
            onPlay={() => {
              stopSeq();
              stopPreview();
            }}
            className="mt-2 w-full max-md:min-h-[48px]"
          />
          <button
            onClick={(e) => {
              ripple(e);
              if (seqIdx === null) {
                stopPreview();
                stopFull();
                setSeqIdx(0);
              } else stopSeq();
            }}
            className="ripple-host pressable mt-3 rounded-full bg-[#E8A33D] px-6 py-2.5 text-sm font-bold text-[#0B1F1A] hover:bg-[#f2b558] max-md:min-h-[48px] max-md:w-full"
          >
            {seqIdx === null ? "Putar semua ayat berurutan" : "Berhenti (" + (seqIdx + 1) + "/" + detail.ayat.length + ")"}
          </button>
          <button
            onClick={toggleKaraoke}
            aria-pressed={karaoke}
            className={
              "ripple-host pressable mt-3 rounded-full px-6 py-2.5 text-sm font-bold max-md:min-h-[48px] max-md:w-full " +
              (karaoke ? "bg-white/15 text-white hover:bg-white/25" : "border border-white/25 text-[#F6F1E7] hover:bg-white/10")
            }
          >
            Mode karaoke {karaoke ? "on" : "off"}
          </button>
          <p className="mt-2 text-xs text-[#F6F1E7]/60">
            {karaoke
              ? "Karaoke memakai audio dan timing Quran Foundation untuk putar berurutan dan putar ayat satuan, qari dikunci ke Afasy."
              : "Nyalakan karaoke agar teks per kata menyala mengikuti suara."}
          </p>
        </div>

        {notice && (
          <p className="mt-4 rounded-2xl bg-[#0E5E4A]/10 px-4 py-2.5 text-sm font-semibold text-[#0E5E4A]">
            {notice}
          </p>
        )}
      </div>

      <ol className="mt-5 space-y-4">
        {detail.ayat.map((a) => {
          const seqActive = seqAyat !== null && seqAyat === a.nomorAyat;
          const bunyiSatuan = playingAyat === a.nomorAyat;
          const kd =
            karaoke && (seqActive || bunyiSatuan) ? karaokeData[detail.nomor + ":" + a.nomorAyat] ?? null : null;
          return (
              <li
                key={a.nomorAyat}
                id={"ayat-" + a.nomorAyat}
                className={
                  "kartu-ayat-audio scroll-mt-28 rounded-3xl border p-5 transition-colors md:p-7 max-md:p-4 " +
                  (seqActive
                    ? "border-[#E8A33D] bg-[#FFF4DE] shadow-[0_0_0_3px_rgba(232,163,61,0.4)]"
                    : "border-[#0E5E4A]/15 bg-[#fffdf7]")
                }
              >
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0B1F1A] text-sm font-bold text-[#E8A33D]">
                  {a.nomorAyat}
                </span>
                {seqActive && (
                  <span className="rounded-full bg-[#E8A33D] px-3 py-1 text-xs font-bold text-[#0B1F1A]">
                    Diputar
                  </span>
                )}
              </div>
              {seqActive && (
                <p className="mt-4 inline-block rounded-full bg-[#C05621] px-3 py-1 text-xs font-bold tracking-widest text-white">
                  SEDANG DIBACA
                </p>
              )}
              <p
                className={
                  "font-arab mt-4 min-w-0 break-words text-right text-[30px] leading-[2.2] md:text-4xl " +
                  (seqActive ? "rounded-2xl bg-[#E8A33D]/25 px-3 text-[#0B1F1A]" : "text-[#0B1F1A]")
                }
                dir="rtl"
                lang="ar"
              >
                {kd && kd.words.length > 0
                  ? kd.words.map((w, i) => (
                      <span key={w.position}>
                        {i > 0 ? " " : null}
                        <span
                          className={
                            kataIdx === w.position ? "rounded bg-[#BFDBFE] px-0.5 font-bold" : undefined
                          }
                        >
                          {w.text}
                        </span>
                      </span>
                    ))
                  : a.teksArab}
              </p>
              {showLatin && <p className="mt-3 text-sm italic leading-relaxed text-[#0E5E4A]">{a.teksLatin}</p>}
              {showArti && <p className="mt-2 text-[15px] leading-relaxed text-[#0B1F1A]/80">{a.teksIndonesia}</p>}
              <div className="mt-4 flex flex-wrap gap-2 max-md:gap-2.5">
                <button
                  onClick={(e) => {
                    ripple(e);
                    playPreview(a.nomorAyat);
                  }}
                  className="ripple-host pressable rounded-full bg-[#0E5E4A] px-5 py-2 text-sm font-bold text-white hover:bg-[#147a5f] max-md:min-h-[48px] max-md:flex-1 max-md:px-4 max-md:py-3"
                >
                  {playingAyat === a.nomorAyat ? "Jeda audio" : "Putar ayat"}
                </button>
                <button
                  onClick={(e) => {
                    ripple(e);
                    void markAyat(a.nomorAyat);
                  }}
                  className="ripple-host pressable rounded-full border border-[#0B1F1A]/15 px-5 py-2 text-sm font-bold text-[#0B1F1A] hover:bg-[#F6F1E7] max-md:min-h-[48px] max-md:flex-1 max-md:px-4 max-md:py-3"
                >
                  Tandai
                </button>
                <button
                  onClick={(e) => {
                    ripple(e);
                    toggleTafsirAyat(a.nomorAyat);
                  }}
                  className="ripple-host pressable rounded-full border border-[#0B1F1A]/15 px-5 py-2 text-sm font-bold text-[#0B1F1A] hover:bg-[#F6F1E7] max-md:min-h-[48px] max-md:flex-1 max-md:px-4 max-md:py-3"
                >
                  {openTafsir === a.nomorAyat ? "Tutup tafsir" : "Tafsir"}
                </button>
              </div>
              {openTafsir === a.nomorAyat && (
                <div className="mt-4 rounded-2xl bg-[#F6F1E7] p-4 text-sm leading-relaxed text-[#0B1F1A]/80 max-md:text-[15px] max-md:leading-relaxed">
                  {tafsirLoading && !tafsir ? (
                    <p>Memuat tafsir...</p>
                  ) : tafsirFor(a.nomorAyat) ? (
                    tafsirFor(a.nomorAyat)
                      .split(/\n\n+/)
                      .map((p, i) => (
                        <p key={i} className={i > 0 ? "mt-3" : ""}>
                          {p}
                        </p>
                      ))
                  ) : (
                    <p>Tafsir ayat ini belum tersedia.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 min-w-0 rounded-3xl border border-white/10 bg-[#0B1F1A] p-5 shadow-2xl md:p-6 max-md:rounded-2xl max-md:p-4">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-xl text-[#F6F1E7]">
            {done ? "Surah ini sudah selesai." : "Sudah selesai membaca surah ini?"}
          </p>
          <button
            onClick={(e) => {
              ripple(e);
              void toggleDone();
            }}
            className={
              "ripple-host pressable rounded-full px-7 py-3 text-sm font-bold max-md:min-h-[52px] max-md:w-full " +
              (done ? "bg-white/15 text-white hover:bg-white/25" : "bg-[#E8A33D] text-[#0B1F1A] hover:bg-[#f2b558]")
            }
          >
            {done ? "Batalkan tanda selesai" : "Tandai surah selesai"}
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 max-md:grid-cols-1 max-md:gap-2.5">
          {prev ? (
            <Link
              href={"/quran/" + prev.nomor}
              className="pressable rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-[#F6F1E7] hover:bg-white/20 max-md:flex max-md:min-h-[48px] max-md:items-center"
            >
              Sebelumnya: {prev.namaLatin || "Surah " + prev.nomor}
            </Link>
          ) : (
            <span className="rounded-2xl bg-white/5 px-5 py-3 text-sm text-[#F6F1E7]/40">
              Ini surah pertama
            </span>
          )}
          {next ? (
            <Link
              href={"/quran/" + next.nomor}
              className="pressable rounded-2xl bg-white/10 px-5 py-3 text-right text-sm font-bold text-[#F6F1E7] hover:bg-white/20 max-md:flex max-md:min-h-[48px] max-md:items-center max-md:justify-end"
            >
              {next.namaLatin || "Surah " + next.nomor}: berikutnya
            </Link>
          ) : (
            <span className="rounded-2xl bg-white/5 px-5 py-3 text-right text-sm text-[#F6F1E7]/40">
              Ini surah terakhir
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
