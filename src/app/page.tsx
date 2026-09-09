"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CaraKerja from "@/components/CaraKerja";
import JadwalHarian from "@/components/JadwalHarian";
import JadwalBulanan from "@/components/JadwalBulanan";
import KiblatCompass from "@/components/KiblatCompass";
import QuranTeaser from "@/components/QuranTeaser";
import IqroTeaser from "@/components/IqroTeaser";
import Donasi from "@/components/Donasi";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const [cityId, setCityId] = useState("1301");

  // Landing selalu dibuka di paling atas. Tanpa ini browser mengembalikan
  // posisi scroll lama (scrollRestoration auto) atau tertarik jangkar.
  useEffect(() => {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch {
      // abaikan, fallback scrollTo di bawah tetap jalan
    }
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#F6F1E7] pb-[92px] md:pb-0">
      <Navbar />
      <Hero cityId={cityId} onCityChange={setCityId} />
      <CaraKerja />
      <JadwalHarian cityId={cityId} />
      <JadwalBulanan cityId={cityId} />
      <KiblatCompass cityId={cityId} />
      <QuranTeaser />
      <IqroTeaser />
      <Donasi />
      <Footer />
      <BottomNav />
    </main>
  );
}
