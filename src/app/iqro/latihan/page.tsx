import type { Metadata } from "next";
import Link from "next/link";
import { JUZ_AMMA_LATIHAN } from "@/lib/iqro";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Latihan Juz Amma | Belajar Iqro ArahKhatam",
  description:
    "Rekomendasi 10 surah pendek Juz Amma untuk latihan setelah belajar Iqro. Teks dibaca di halaman AlQuran.",
};

export default function LatihanPage() {
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
              Latihan Juz Amma.
            </h1>
            <p className="mt-4 max-w-2xl text-[#F6F1E7]/75">
              Rekomendasi 10 surah pendek untuk praktik setelah Iqro. Ini rekomendasi
              latihan, bukan isi buku Iqro. Teks tiap surah dibaca langsung di halaman
              AlQuran saat kartu dibuka.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-8 md:py-14">
        <div className="mx-auto w-full max-w-[680px] min-w-0 px-4 md:max-w-6xl md:px-6">
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {JUZ_AMMA_LATIHAN.map((s, i) => (
              <Reveal key={s.nomor} delay={Math.min(i % 4, 3) * 60}>
                <Link
                  href={"/quran/" + s.nomor}
                  className="lift block h-full min-w-0 rounded-3xl border border-[#0B1F1A]/10 bg-[#fffdf7] p-6 max-md:min-h-[56px] max-md:rounded-2xl max-md:p-4 max-md:active:scale-[0.99]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0B1F1A] text-sm font-bold text-[#E8A33D]">
                      {s.nomor}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display truncate text-xl text-[#0B1F1A]">{s.namaLatin}</h2>
                      <p className="truncate text-sm text-[#0B1F1A]/65">{s.arti}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#0E5E4A]">{s.alasan}</p>
                  <p className="pressable mt-3 inline-block rounded-full bg-[#E8A33D] px-5 py-2 text-sm font-bold text-[#0B1F1A] max-md:min-h-[48px] max-md:py-3">
                    Buka surah
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="cta-iqro-bar mt-6 rounded-3xl border border-[#0B1F1A]/10 bg-[#fffdf7]/95 p-4 max-md:rounded-2xl md:mt-8">
            <div className="flex min-w-0 flex-wrap items-center gap-3 max-md:grid max-md:grid-cols-1 max-md:gap-2.5">
              <p className="min-w-0 flex-1 text-sm font-semibold text-[#0B1F1A]/70">
                10 surah pendek. Tanda selesai ditandai di halaman surah masing-masing.
              </p>
              <Link
                href="/iqro"
                className="pressable rounded-full bg-[#0B1F1A] px-6 py-3 text-center text-sm font-bold text-[#F6F1E7] max-md:flex max-md:min-h-[52px] max-md:items-center max-md:justify-center"
              >
                Kembali ke Iqro
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
