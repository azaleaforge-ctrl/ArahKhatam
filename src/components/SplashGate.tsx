"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const BismillahSplash = dynamic(() => import("@/components/BismillahSplash"), { ssr: false });

export default function SplashGate() {
  const [splash, setSplash] = useState(true);
  if (!splash) return null;
  return <BismillahSplash onDone={() => setSplash(false)} />;
}
