"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Splash pembuka saat entry/refresh. Fullscreen di atas segalanya (z-100),
// memutar SFX basmalah sekali, lalu memudar dan memanggil onDone agar di-unmount.
// Hanya dimount sekali oleh parent (bukan tiap navigasi).
const FALLBACK_MS = 4500;
const MIN_MS = 2500;
const MAX_MS = 9000;
const LEAVE_MS = 700;

const ARAB_WORDS = ["بِسْمِ", "اللَّهِ", "الرَّحْمَٰنِ", "الرَّحِيمِ"];

export default function BismillahSplash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");
  const [blocked, setBlocked] = useState(false);
  const [durationMs, setDurationMs] = useState(FALLBACK_MS);
  const [barOn, setBarOn] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishTimer = useRef<number | null>(null);
  const rafIds = useRef<number[]>([]);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    setPhase("leaving");
    window.setTimeout(() => {
      setPhase("gone");
      onDone();
    }, LEAVE_MS);
  }, [onDone]);

  const armFinish = useCallback(
    (ms: number) => {
      if (finished.current) return;
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
      finishTimer.current = window.setTimeout(finish, ms);
    },
    [finish],
  );

  // Nyalakan progress bar di frame berikut agar transisi 0 -> 100% jalan.
  // Dipanggil dari event handler (replay) dan dijadwalkan async dari effect.
  const turnBarOn = useCallback(() => {
    rafIds.current.push(
      window.requestAnimationFrame(() => {
        rafIds.current.push(window.requestAnimationFrame(() => setBarOn(true)));
      }),
    );
  }, []);

  const restartBar = useCallback(() => {
    setBarOn(false);
    turnBarOn();
  }, [turnBarOn]);

  useEffect(() => {
    const audio = new Audio("/sfx/bismillah.mp3");
    audioRef.current = audio;
    audio.preload = "auto";

    const onMeta = () => {
      const secs = Number.isFinite(audio.duration) ? audio.duration : FALLBACK_MS / 1000;
      const ms = Math.min(MAX_MS, Math.max(MIN_MS, Math.round(secs * 1000)));
      setDurationMs(ms);
      armFinish(ms);
    };
    const onEnded = () => finish();

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    // Fallback bila metadata lambat / autoplay digagalkan: animasi tetap jalan.
    armFinish(FALLBACK_MS);
    turnBarOn();

    void audio.play().catch((err: unknown) => {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") setBlocked(true);
      // Tanpa suara pun splash tetap lanjut dengan durasi fallback.
    });

    // Kunci scroll selama splash tampil.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
      rafIds.current.forEach((id) => window.cancelAnimationFrame(id));
      rafIds.current = [];
      document.body.style.overflow = prevOverflow;
    };
  }, [armFinish, finish, turnBarOn]);

  if (phase === "gone") return null;

  const replayWithSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
    } catch {
      // abaikan, langsung coba putar
    }
    void audio
      .play()
      .then(() => {
        setBlocked(false);
        setAnimKey((k) => k + 1);
        restartBar();
        armFinish(durationMs);
      })
      .catch(() => {
        // tetap diblokir, biarkan tombol tampil
      });
  };

  return (
    <div
      role="status"
      aria-label="Pembuka, bacaan basmalah"
      className={
        "bismillah-shell fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0b1e24]" +
        (phase === "leaving" ? " bismillah-leaving" : "")
      }
    >
      {/* Latar motif tepi: cover center, responsif untuk mobile + desktop */}
      <Image
        src="/subtle_islamic_border.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Overlay: tengah pekat agar teks terbaca, tepi diangkat agar motif emas terlihat */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(11,30,36,0.88) 0%, rgba(11,30,36,0.72) 55%, rgba(11,30,36,0.45) 100%)",
        }}
      />

      <div key={animKey} className="relative flex flex-col items-center px-6 text-center">
        <Image
          src="/arahkhatam_logo_B2.png"
          alt="Logo ArahKhatam"
          width={96}
          height={96}
          priority
          className="bismillah-logo h-24 w-24 rounded-2xl shadow-2xl shadow-black/50"
        />

        <p
          dir="rtl"
          lang="ar"
          className="font-arab mt-6 text-4xl leading-[1.9] text-[#E8A33D] sm:text-5xl"
        >
          {ARAB_WORDS.map((w, i) => (
            <span key={w} className="bismillah-word" style={{ animationDelay: `${150 + i * 200}ms` }}>
              {w}
              {i < ARAB_WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

        <p className="bismillah-word mt-2 text-sm tracking-wide text-[#F6F1E7]/75" style={{ animationDelay: "950ms" }}>
          Bismillahirrahmanirrahim
        </p>

        {/* Progress tipis, lebar dikendalikan JS mengikuti durasi audio */}
        <div className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#E8A33D]"
            style={{
              width: barOn ? "100%" : "0%",
              transitionProperty: "width",
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: "linear",
            }}
          />
        </div>

        {blocked && (
          <button
            type="button"
            onClick={replayWithSound}
            className="pressable mt-5 rounded-full border border-[#E8A33D]/60 bg-white/10 px-5 py-2.5 text-sm font-bold text-[#F6F1E7] backdrop-blur-sm hover:bg-white/20"
          >
            Ketuk untuk memutar suara
          </button>
        )}
      </div>
    </div>
  );
}
