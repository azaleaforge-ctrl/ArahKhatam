"use client";

import SafeImage from "./SafeImage";
import Reveal from "./Reveal";
import { ripple, tilt, tiltReset } from "./fx";

const URL = process.env.NEXT_PUBLIC_SOCIABUZZ_URL ?? "https://sociabuzz.com/azaleaforge15/tribe";

const REASONS = [
  {
    title: "Operasional API",
    desc: "Jadwal diambil live setiap hari dari MyQuran dan Aladhan. Donasimu menjaga server dan kuota tetap jalan.",
  },
  {
    title: "Bebas iklan",
    desc: "Kami ingin halaman jadwal tetap bersih saat dilihat sebelum azan. Dukunganmu mengganti slot iklan.",
  },
  {
    title: "Sedekah jariah",
    desc: "Setiap orang yang sholat tepat waktu karena web ini, insya Allah jadi pahala yang terus mengalir.",
  },
];

export default function Donasi() {
  return (
    <section id="donasi" className="relative overflow-hidden bg-[#E8A33D] py-12 md:py-24">
      <div className="kawung absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8A33D] via-[#E8A33D]/85 to-[#C05621]/90" />
        <SafeImage src="/media/sajadah.jpg" alt="" className="h-full w-full object-cover opacity-20" />
      </div>
      <div className="relative mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.25em] text-[#0B1F1A]">DONASI</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl text-[#0B1F1A] md:text-5xl">
            Jaga web ini tetap gratis dan bebas iklan.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <article
                onMouseMove={tilt}
                onMouseLeave={tiltReset}
                onClick={ripple}
                className="lift ripple-host h-full rounded-3xl bg-[#0B1F1A] p-5 text-[#F6F1E7] shadow-none md:p-6"
              >
                <h3 className="font-display text-xl text-[#E8A33D]">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F6F1E7]/80">{r.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={140}>
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl bg-[#F6F1E7] p-5 text-center md:flex-row md:justify-between md:p-7 md:text-left">
            <div>
              <p className="font-display text-2xl text-[#0B1F1A]">Dukung via Sociabuzz</p>
              <p className="text-sm text-[#0B1F1A]/65">Nominal bebas, bisa sekali atau rutin tiap bulan.</p>
            </div>
            <a
              href={URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={ripple}
              className="ripple-host pressable w-full rounded-full bg-[#C05621] px-8 py-3.5 text-center font-bold text-white hover:bg-[#a8481b] md:w-auto"
            >
              Donasi sekarang
            </a>
          </div>
        </Reveal>
      </div>
      <a
        href={URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 truncate rounded-full bg-[#0B1F1A] px-5 py-3 text-center text-sm font-bold text-[#F6F1E7] shadow-2xl md:hidden"
      >
        Donasi via Sociabuzz
      </a>
    </section>
  );
}
