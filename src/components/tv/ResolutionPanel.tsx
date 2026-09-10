"use client";

import { useDisplayInfo } from "@/hooks/useDisplayInfo";

export default function ResolutionPanel() {
  const info = useDisplayInfo();
  const compact = info.profile === "compact";

  return (
    <section
      className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7"
      aria-label="Info layar"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">
          LAYAR TV
        </p>
        <span
          className={
            "rounded-full px-4 py-1.5 text-xs font-bold " +
            (compact
              ? "bg-[#E8A33D] text-[#0B1F1A]"
              : "border border-white/20 text-[#F6F1E7]/85")
          }
          role="status"
        >
          {compact ? "Compact" : "Normal"}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#071410] px-3 py-2">
          <dt className="text-[#F6F1E7]/50">Jendela</dt>
          <dd className="mt-0.5 font-bold">
            {info.w || "-"} × {info.h || "-"}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#071410] px-3 py-2">
          <dt className="text-[#F6F1E7]/50">Layar</dt>
          <dd className="mt-0.5 font-bold">
            {info.sw || "-"} × {info.sh || "-"}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#071410] px-3 py-2">
          <dt className="text-[#F6F1E7]/50">DPR</dt>
          <dd className="mt-0.5 font-bold">{info.dpr || "-"}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#071410] px-3 py-2">
          <dt className="text-[#F6F1E7]/50">Orientasi</dt>
          <dd className="mt-0.5 font-bold">{info.orientation}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#071410] px-3 py-2">
          <dt className="text-[#F6F1E7]/50">Warna</dt>
          <dd className="mt-0.5 font-bold">
            {info.colorDepth ? info.colorDepth + "-bit" : "-"}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#071410] px-3 py-2">
          <dt className="text-[#F6F1E7]/50">Perangkat</dt>
          <dd className="mt-0.5 font-bold">{info.uaHint}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-[#F6F1E7]/60">
        Data tersimpan per-perangkat (localStorage). Sinkron TV→HP butuh server
        (fase berikutnya, bukan sekarang).
      </p>
    </section>
  );
}
