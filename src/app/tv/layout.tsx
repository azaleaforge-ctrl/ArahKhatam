import type { Metadata } from "next";
import TvSw from "./TvSw";

export const metadata: Metadata = {
  title: { absolute: "Display TV Masjid | ArahKhatam" },
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B1F1A] text-[#F6F1E7]">
      <TvSw />
      {children}
    </div>
  );
}
