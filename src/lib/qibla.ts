export const KAABAH_LAT = 21.422487;
export const KAABAH_LON = 39.826206;

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

// Rumus bearing great circle dari titik pengguna ke Kakbah.
// Hasil 0 sampai 360 derajat, searah jarum jam dari utara.
export function qiblaBearing(lat: number, lon: number): number {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABAH_LAT);
  const delta = toRad(KAABAH_LON - lon);
  const y = Math.sin(delta) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(delta);
  const b = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return Math.round(b * 100) / 100;
}

export function compassLabel(deg: number): string {
  const arah = [
    "Utara",
    "Timur Laut",
    "Timur",
    "Tenggara",
    "Selatan",
    "Barat Daya",
    "Barat",
    "Barat Laut",
  ];
  const idx = Math.round(deg / 45) % 8;
  return arah[idx];
}

export function formatHijriah(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("id-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat("id", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  }
}
