"use client";

import { useState } from "react";
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

  return (
    <main className="min-h-screen bg-[#F6F1E7] pb-20 md:pb-0">
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
