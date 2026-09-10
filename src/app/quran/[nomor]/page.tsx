import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSuratDetail, sanitizeDeskripsi } from "@/lib/quran";
import { SITE_URL } from "@/lib/site";
import SurahView from "@/components/quran/SurahView";
import Reveal from "@/components/Reveal";

export const revalidate = 86400;

// 114 entri statis tanpa fetch, tiap halaman mengambil datanya sendiri.
export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ nomor: String(i + 1) }));
}

const NOINDEX: Metadata = { robots: { index: false, follow: false } };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nomor: string }>;
}): Promise<Metadata> {
  const { nomor } = await params;
  const n = Number(nomor);
  if (!Number.isInteger(n) || n < 1 || n > 114) return NOINDEX;
  try {
    const { detail } = await getSuratDetail(n);
    const title = "QS. " + detail.namaLatin + " (" + detail.arti + ") — " + detail.jumlahAyat + " Ayat | ArahKhatam";
    const description =
      "Baca QS. " + detail.namaLatin + " (" + detail.arti + ") — " + detail.jumlahAyat + " ayat, teks Arab, latin, terjemah Kemenag, audio per ayat, dan tafsir di ArahKhatam.";
    const url = SITE_URL + "/quran/" + n;
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        locale: "id_ID",
        siteName: "ArahKhatam",
        url,
        title,
        description,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/opengraph-image"],
      },
    };
  } catch {
    return NOINDEX;
  }
}

export default async function SurahPage({ params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  const n = Number(nomor);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();

  let detail = null;
  let sumber = "equran";
  let error = "";
  try {
    const r = await getSuratDetail(n);
    detail = r.detail;
    sumber = r.sumber;
  } catch (e) {
    error = e instanceof Error ? e.message : "Surah belum bisa dimuat.";
  }

  if (!detail) {
    return (
      <main className="mx-auto max-w-4xl px-5 pt-28 pb-14 md:pt-36">
        <div className="rounded-3xl border border-[#C05621]/30 bg-white p-8 text-center">
          <p className="font-display text-2xl text-[#0B1F1A]">Surah belum bisa dimuat</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#0B1F1A]/65">{error}</p>
          <a
            href={"/quran/" + n}
            className="pressable mt-5 inline-block rounded-full bg-[#0B1F1A] px-7 py-3 text-sm font-bold text-[#F6F1E7]"
          >
            Muat ulang
          </a>
        </div>
      </main>
    );
  }

  const url = SITE_URL + "/quran/" + n;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "QS. " + detail.namaLatin + " (" + detail.arti + ") — " + detail.jumlahAyat + " Ayat",
    description:
      "Baca QS. " + detail.namaLatin + " (" + detail.arti + ") — " + detail.jumlahAyat + " ayat, teks Arab, latin, terjemah Kemenag, audio per ayat, dan tafsir.",
    inLanguage: "id-ID",
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "ArahKhatam", url: SITE_URL },
    publisher: { "@type": "Organization", name: "ArahKhatam", url: SITE_URL },
  };

  return (
    <main className="min-w-0 overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <section className="kawung-dark relative overflow-hidden bg-[#0B1F1A] pt-28 pb-10 md:pt-36 md:pb-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[380px] w-[700px] max-w-[100vw] -translate-x-1/2 rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(232,163,61,0.4), transparent)" }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <Reveal>
            <a href="/quran" className="text-xs font-bold tracking-[0.25em] text-[#E8A33D]">
              KEMBALI KE DAFTAR SURAH
            </a>
            <p className="font-arab mt-4 min-w-0 break-words text-5xl leading-[1.9] text-[#F6F1E7] md:text-7xl" dir="rtl" lang="ar">
              {detail.nama}
            </p>
            <h1 className="font-display mt-3 text-3xl text-[#F6F1E7] md:text-5xl">{detail.namaLatin}</h1>
            <p className="mt-2 text-sm text-[#F6F1E7]/70">
              {detail.arti} , {detail.jumlahAyat} ayat , {detail.tempatTurun}
              {sumber === "gading" ? " , mode cadangan" : ""}
            </p>
            {detail.deskripsi && (
              <div
                className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#F6F1E7]/70"
                dangerouslySetInnerHTML={{ __html: sanitizeDeskripsi(detail.deskripsi) }}
              />
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F6F1E7] py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-5">
          <SurahView detail={detail} />
        </div>
      </section>
    </main>
  );
}
