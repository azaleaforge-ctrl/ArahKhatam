import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Display TV | ArahKhatam",
  description:
    "Display TV masjid ArahKhatam: jam besar, countdown sholat berikutnya, dan jadwal 8 waktu hari ini.",
};

// Halaman mandiri: tanpa Navbar/Footer. Root layout hanya menyertakan
// UpdatePopup global (dibisukan di /tv) + efek latar.
export default function TvLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0B1F1A] text-[#F6F1E7]">{children}</div>;
}
