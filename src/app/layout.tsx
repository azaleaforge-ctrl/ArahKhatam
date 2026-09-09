import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import UpdatePopup from "@/components/UpdatePopup";
import CursorGlow from "@/components/CursorGlow";
import SociabuzzFloat from "@/components/SociabuzzFloat";
import SplashGate from "@/components/SplashGate";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArahKhatam, penunjuk kiblat & khatam harian Indonesia",
  description:
    "Jadwal sholat harian dan bulanan seluruh Indonesia, pengingat countdown live, kompas kiblat akurat, dan sumber data Kemenag RI via MyQuran.",
  icons: { icon: "/arahkhatam_logo_B2.png", apple: "/arahkhatam_logo_B2.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable + " " + fraunces.variable + " h-full antialiased"}>
      <body className="min-h-full flex flex-col">
        <SplashGate />
        <CursorGlow />
        {children}
        <UpdatePopup />
        <SociabuzzFloat />
      </body>
    </html>
  );
}
