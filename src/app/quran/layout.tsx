import type { Metadata } from "next";
import { Amiri } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { SITE_URL } from "@/lib/site";

// Font arab hanya dimuat di halaman quran agar landing tetap ringan.
const amiri = Amiri({
  variable: "--font-arab",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const TITLE = "Baca AlQuran dan Terjemah";
const DESCRIPTION =
  "Baca 114 surah AlQuran dengan teks arab, latin, terjemah Kemenag, audio per ayat, tafsir, dan pelacak khatam.";

export const metadata: Metadata = {
  title: { default: TITLE + " | ArahKhatam", template: "%s | ArahKhatam" },
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL + "/quran" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "ArahKhatam",
    url: SITE_URL + "/quran",
    title: TITLE + " | ArahKhatam",
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ArahKhatam" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE + " | ArahKhatam",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={amiri.variable + " min-h-screen bg-[#F6F1E7] pb-20 md:pb-0"}>
      <Navbar />
      {children}
      <div className="border-t border-[#0B1F1A]/10 bg-[#F6F1E7] py-5">
        <p className="mx-auto max-w-6xl px-5 text-center text-xs text-[#0B1F1A]/60">
          Sumber bacaan: EQuran.id dan Kemenag RI. Audio langsung dari CDN EQuran.id.
          Mode karaoke memakai audio dan timing Quran Foundation. Quran data provided by Quran Foundation.
        </p>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
