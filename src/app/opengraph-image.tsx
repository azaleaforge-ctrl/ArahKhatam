import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B1F1A",
          borderTop: "12px solid #E8A33D",
          borderBottom: "12px solid #E8A33D",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800, color: "#F6F1E7", letterSpacing: -2 }}>
          ArahKhatam
        </div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#E8A33D", fontWeight: 600 }}>
          Jadwal Sholat • Arah Kiblat • Al-Quran • Iqro
        </div>
      </div>
    ),
    { ...size }
  );
}
