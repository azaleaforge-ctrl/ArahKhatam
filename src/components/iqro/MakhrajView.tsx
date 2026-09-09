"use client";

import { useEffect, useMemo, useState } from "react";
import Reveal from "../Reveal";
import { ripple } from "../fx";
import { bicaraItem, hentiSuara, suaraAktif, suaraTersedia } from "@/lib/suara";
import type { MakhrajItem, MakhrajUtama } from "@/lib/iqro";

type Props = {
  makhraj: MakhrajItem[];
  utama: { nama: MakhrajUtama; arti: string }[];
};

export default function MakhrajView({ makhraj, utama }: Props) {
  const [filter, setFilter] = useState<MakhrajUtama | "Semua">("Semua");
  const [q, setQ] = useState("");
  const [ttsOk, setTtsOk] = useState(false);

  useEffect(() => {
    setTtsOk(suaraTersedia());
    return () => {
      hentiSuara();
    };
  }, []);

  const arti = useMemo(() => {
    if (filter === "Semua") return "Semua tempat keluar huruf";
    return utama.find((u) => u.nama === filter)?.arti ?? "";
  }, [filter, utama]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return makhraj.filter((m) => {
      if (filter === "Khaisyum") {
        if (!m.ghunnah) return false;
      } else if (filter !== "Semua" && m.utama !== filter) {
        return false;
      }
      if (!s) return true;
      return (
        m.nama.toLowerCase().includes(s) ||
        m.tempat.toLowerCase().includes(s) ||
        m.huruf.includes(q.trim())
      );
    });
  }, [makhraj, filter, q]);

  return (
    <main className="min-w-0 overflow-x-clip">
      <section className="kawung-dark relative overflow-hidden bg-[#0B1F1A] pt-28 pb-8 md:pt-36 md:pb-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[380px] w-[700px] max-w-[100vw] -translate-x-1/2 rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.4), transparent)" }}
        />
        <div className="relative mx-auto w-full max-w-[680px] min-w-0 px-4 md:max-w-6xl md:px-6">
          <Reveal>
            <a href="/iqro" className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">
              KEMBALI KE BELAJAR IQRO
            </a>
            <h1 className="font-display mt-2 text-4xl text-[#F6F1E7] md:text-6xl">
              Makhraj 28 huruf.
            </h1>
            <p className="mt-4 max-w-2xl text-[#F6F1E7]/75">
              Tempat keluar tiap huruf hijaiyah berdasar 5 makhraj utama. Khaisyum adalah
              rongga hidung tempat dengung keluar, muncul pada nun dan mim saat ghunnah.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-8 md:py-14">
        <div className="mx-auto w-full max-w-[680px] min-w-0 px-4 md:max-w-6xl md:px-6">
          <div className="flex flex-wrap gap-2">
            {(["Semua", ...utama.map((u) => u.nama)] as const).map((f) => (
              <button
                key={f}
                onClick={(e) => {
                  ripple(e);
                  setFilter(f);
                }}
                className={
                  "pressable rounded-full px-4 py-2 text-sm font-bold max-md:min-h-[44px] max-md:px-5 " +
                  (filter === f
                    ? "bg-[#0B1F1A] text-[#F6F1E7]"
                    : "bg-[#0B1F1A]/8 text-[#0B1F1A] hover:bg-[#0B1F1A]/15")
                }
              >
                {f}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm font-semibold text-[#0E5E4A]">{arti}</p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari huruf atau tempat, misal tenggorokan"
            aria-label="Cari makhraj"
            className="mt-3 w-full rounded-2xl border border-[#0B1F1A]/15 bg-white px-5 py-3 text-sm text-[#0B1F1A] placeholder:text-[#0B1F1A]/40 focus:border-[#E8A33D] focus:outline-none max-md:min-h-[56px] max-md:text-base"
          />
          <p className="mt-2 text-xs text-[#0B1F1A]/55">Menampilkan {filtered.length} huruf.</p>
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((m) => (
              <div key={m.huruf + m.nama} className="lift min-w-0 rounded-3xl border border-[#0B1F1A]/10 bg-[#fffdf7] p-5 max-md:rounded-2xl max-md:p-4">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="font-arab min-w-0 flex-1 basis-16 break-words text-4xl leading-[1.8] text-[#0B1F1A] md:text-5xl" dir="rtl" lang="ar">
                    {m.huruf}
                  </span>
                  <span className="rounded-full bg-[#0E5E4A]/15 px-3 py-1 text-xs font-bold text-[#0E5E4A]">
                    {filter === "Khaisyum" ? "Khaisyum" : m.utama}
                  </span>
                </div>
                <p className="mt-3 min-w-0 truncate font-bold text-[#0B1F1A]">{m.nama}</p>
                <p className="mt-1 min-w-0 text-sm break-words text-[#0B1F1A]/70">{m.tempat}</p>
                <p className="mt-2 text-sm text-[#0B1F1A]/70">
                  Contoh:{" "}
                  <span className="font-arab text-xl" dir="rtl" lang="ar">
                    {m.contoh}
                  </span>
                </p>
                {ttsOk && (
                  <button
                    onClick={() => {
                      if (suaraAktif()) bicaraItem(m.contoh, m.nama);
                    }}
                    aria-label={"Dengar contoh " + m.nama}
                    className="tombol-suara pressable mt-2 rounded-full bg-[#0E5E4A] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#147a5f] max-md:min-h-[44px] max-md:px-5 max-md:py-2.5 max-md:text-sm"
                  >
                    Dengar contoh
                  </button>
                )}
                {m.ghunnah && (
                  <p className="mt-2 text-xs font-semibold text-[#8a5a12]">
                    Dengung keluar dari Khaisyum saat bertasydid.
                  </p>
                )}
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-6 rounded-3xl bg-white p-8 text-center text-sm text-[#0B1F1A]/60">
              Tidak ada huruf yang cocok. Coba kata kunci lain.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
