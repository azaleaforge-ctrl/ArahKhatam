"use client";

import Reveal from "./Reveal";
import SafeImage from "./SafeImage";
import { ripple, tilt, tiltReset } from "./fx";

export default function QuranTeaser() {
  return (
    <section className="bg-[#F6F1E7] pb-12 md:pb-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <article
            onMouseMove={tilt}
            onMouseLeave={tiltReset}
            className="lift relative overflow-hidden rounded-[2rem] bg-[#0B1F1A] p-6 md:p-12"
          >
            <div className="kawung-dark absolute inset-0" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60"
              style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.4), transparent)" }}
            />
            <div className="absolute inset-0" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F1A] via-[#0B1F1A]/85 to-[#0B1F1A]/40" />
              <SafeImage
                src="/media/masjid-senja.jpg"
                alt=""
                className="h-full w-full object-cover opacity-25"
              />
            </div>
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">BARU: BACA ALQURAN</p>
                <h2 className="font-display mt-2 max-w-xl text-3xl leading-tight text-[#F6F1E7] md:text-5xl">
                  114 surah, audio merdu, tafsir, pelacak khatam.
                </h2>
                <p className="mt-3 max-w-xl text-[#F6F1E7]/75">
                  Lanjut dari ayat terakhir yang kamu tandai, dengar per ayat atau satu surah
                  penuh dengan 6 pilihan qari, lalu tandai surah selesai hingga khatam.
                </p>
              </div>
              <a
                href="/quran"
                onClick={ripple}
                className="ripple-host pressable w-full justify-self-start rounded-full bg-[#E8A33D] px-8 py-3.5 text-center font-bold text-[#0B1F1A] hover:bg-[#f2b558] md:w-auto md:justify-self-end"
              >
                Buka AlQuran
              </a>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
