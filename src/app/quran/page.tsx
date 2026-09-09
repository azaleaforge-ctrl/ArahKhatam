import { getSuratList } from "@/lib/quran";
import QuranList from "@/components/quran/QuranList";
import Reveal from "@/components/Reveal";

export const revalidate = 86400;

export default async function QuranPage() {
  let list = null;
  let sumber = "equran";
  let error = "";
  try {
    const r = await getSuratList();
    list = r.list;
    sumber = r.sumber;
  } catch (e) {
    error = e instanceof Error ? e.message : "Daftar surah belum bisa dimuat.";
  }

  return (
    <main>
      <section className="kawung-dark relative overflow-hidden bg-[#0B1F1A] pt-28 pb-12 md:pt-36 md:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.4), transparent)" }}
        />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">ALQURAN</p>
            <h1 className="font-display mt-2 text-4xl text-[#F6F1E7] md:text-6xl">
              Baca, dengar, khatam.
            </h1>
            <p className="mt-4 max-w-2xl text-[#F6F1E7]/75">
              114 surah lengkap dengan teks arab, latin, terjemah Kemenag, audio per ayat,
              tafsir, dan penanda bacaan terakhir plus pelacak khatam di perangkatmu.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-5">
          {error || !list ? (
            <div className="rounded-3xl border border-[#C05621]/30 bg-white p-8 text-center">
              <p className="font-display text-2xl text-[#0B1F1A]">Belum bisa memuat daftar surah</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#0B1F1A]/65">{error}</p>
              <a
                href="/quran"
                className="pressable mt-5 inline-block rounded-full bg-[#0B1F1A] px-7 py-3 text-sm font-bold text-[#F6F1E7]"
              >
                Muat ulang
              </a>
            </div>
          ) : (
            <QuranList list={list} sumber={sumber} />
          )}
        </div>
      </section>
    </main>
  );
}
