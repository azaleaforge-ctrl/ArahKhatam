"use client";

import Reveal from "./Reveal";
import { ripple, tilt, tiltReset } from "./fx";

const STEPS = [
  {
    n: "01",
    title: "Pilih kotamu",
    desc: "Ketuk Jakarta, Surabaya, Bandung, Medan, Makassar, atau cari ratusan kota lain. Pilihan tersimpan otomatis di perangkat.",
  },
  {
    n: "02",
    title: "Pantau countdown live",
    desc: "Delapan waktu tampil jelas setiap hari: imsak sampai isya. Waktu aktif menyala, countdown berdetak tiap detik.",
  },
  {
    n: "03",
    title: "Cek kiblat dan tren",
    desc: "Buka kompas kiblat animasi pegas plus tabel 30 hari untuk melihat pergeseran jam sholat dari pekan ke pekan.",
  },
  {
    n: "04",
    title: "Baca Quran dan kejar khatam",
    desc: "114 surah lengkap dengan audio 6 qari, tafsir, dan bookmark ayat terakhir. Tandai surah selesai satu per satu hingga khatam.",
  },
  {
    n: "05",
    title: "Belajar Iqro 1 sampai 6",
    desc: "Kartu baca arab besar bertahap dari jilid 1 sampai 6, mode sembunyi latin untuk latihan, plus ujian dan makhraj 28 huruf.",
  },
  {
    n: "06",
    title: "Tampilkan di TV masjid",
    desc: "Atur nama masjid, foto latar, dan kota di editor, lalu tampilkan fullscreen otomatis dengan jam live, kutipan, dan countdown.",
  },
  {
    n: "07",
    title: "Dengarkan azan otomatis",
    desc: "Suara azan bebas lisensi berbunyi tiap 5 waktu fardhu di display TV. Pilih suara favorit, coba dulu, dan atur popup pengingat.",
  },
];

export default function CaraKerja() {
  return (
    <section id="cara" className="bg-[#F6F1E7] py-12 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.25em] text-[#0E5E4A]">CARA KERJA</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl leading-tight text-[#0B1F1A] md:text-5xl">
            Tujuh langkah menuju sholat tepat waktu.
          </h2>
          <p className="mt-3 max-w-2xl text-[#0B1F1A]/70">
            Web ini dibuat sederhana agar semua umur bisa pakai. Tanpa akun, tanpa iklan
            mengganggu, langsung tampil guna utamanya.
          </p>
        </Reveal>
        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:mt-10 md:grid md:snap-none md:gap-5 md:overflow-visible md:pb-0 md:px-0 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} className="min-w-[80%] snap-center sm:min-w-[60%] md:min-w-0">
              <article
                onMouseMove={tilt}
                onMouseLeave={tiltReset}
                onClick={ripple}
                className="lift ripple-host kawung h-full rounded-3xl border border-[#0E5E4A]/15 bg-[#fffdf7] p-6 shadow-none md:p-7 md:shadow-[0_18px_40px_-24px_rgba(11,31,26,0.4)]"
              >
                <span className="font-display text-5xl text-[#E8A33D]">{s.n}</span>
                <h3 className="font-display mt-4 text-2xl text-[#0B1F1A]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0B1F1A]/70">{s.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div className="mt-8 rounded-3xl bg-[#0B1F1A] p-6 text-sm leading-relaxed text-[#F6F1E7]/85 md:flex md:items-center md:gap-6 md:p-7">
            <span className="inline-block shrink-0 rounded-full bg-[#E8A33D] px-4 py-1.5 text-xs font-bold text-[#0B1F1A]">
              SUMBER DATA
            </span>
            <p>
              Jadwal diambil dari API MyQuran v2 yang merujuk jadwal Kemenag RI. Bila MyQuran sibuk,
              sistem otomatis memakai Aladhan method 20 (Kemenag RI) agar jadwal tetap tampil.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
