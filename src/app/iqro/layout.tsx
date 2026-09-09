import type { Metadata } from "next";
import { Amiri } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

// Font arab hanya dimuat di halaman quran dan iqro agar landing tetap ringan.
const amiri = Amiri({
  variable: "--font-arab",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Belajar Iqro 1 sampai 6 | ArahKhatam",
  description:
    "Belajar Iqro jilid 1 sampai 6 dengan bacaan pendek, kuis tebak bacaan, makhraj 28 huruf, dan latihan Juz Amma.",
};

export default function IqroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={amiri.variable + " min-h-screen bg-[#F6F1E7] pb-20 md:pb-0"}>
      <Navbar />
      {children}
      <div className="border-t border-[#0B1F1A]/10 bg-[#F6F1E7] py-5">
        <p className="mx-auto max-w-6xl px-5 text-center text-xs leading-relaxed text-[#0B1F1A]/60">
          Materi merujuk pada Buku Iqra Cara Cepat Belajar Membaca Al-Quran, KH Asad Humam dan
          Team Tadarus AMM Yogyakarta. Latihan Juz Amma memakai teks runtime dari EQuran.id.
        </p>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
