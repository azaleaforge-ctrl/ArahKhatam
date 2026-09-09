"use client";

import { useEffect } from "react";

export default function TvLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.title = "Display TV | ArahKhatam";
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/tv/sw.js", { scope: "/tv", updateViaCache: "none" })
      .catch(() => {});
  }, []);

  return <div className="min-h-screen bg-[#0B1F1A] text-[#F6F1E7]">{children}</div>;
}
