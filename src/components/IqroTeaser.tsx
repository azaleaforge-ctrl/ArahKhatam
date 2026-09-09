"use client";

import Reveal from "./Reveal";
import { ripple } from "./fx";

export default function IqroTeaser() {
  return (
    <section className="bg-[#F6F1E7] pb-6 md:pb-8">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <article className="lift relative overflow-hidden rounded-[2rem] border border-[#0E5E4A]/20 bg-[#fffdf7] p-6 shadow-none md:p-10">
            <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-[#0E5E4A]">BELAJAR IQRO 1 SAMPAI 6</p>
                <h2 className="font-display mt-2 max-w-xl text-3xl leading-tight text-[#0B1F1A] md:text-4xl">
                  Eja huruf dari jilid 1 sampai 6.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#0B1F1A]/70">
                  Enam jilid bertahap dengan kartu baca arab besar, mode sembunyi latin
                  untuk latihan, dan penanda pelajaran selesai di perangkatmu.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <span
                      key={n}
                      className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white"
                      style={{
                        background: ["#B91C1C", "#15803D", "#0284C7", "#CA8A04", "#7C3AED", "#78350F"][n - 1],
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href="/iqro"
                onClick={ripple}
                className="ripple-host pressable w-full justify-self-start rounded-full bg-[#0E5E4A] px-8 py-3.5 text-center font-bold text-white hover:bg-[#147a5f] md:w-auto md:justify-self-end"
              >
                Buka Belajar Iqro
              </a>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
