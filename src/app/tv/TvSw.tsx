"use client";

import { useEffect } from "react";

export default function TvSw() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/tv/sw.js", { scope: "/tv", updateViaCache: "none" })
      .catch(() => {});
  }, []);
  return null;
}
