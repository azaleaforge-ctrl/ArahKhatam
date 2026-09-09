export type City = {
  id: string;
  nama: string;
  lat: number;
  lon: number;
};

export const DEFAULT_CITIES: City[] = [
  { id: "1301", nama: "KOTA JAKARTA", lat: -6.2088, lon: 106.8456 },
  { id: "1638", nama: "KOTA SURABAYA", lat: -7.2575, lon: 112.7521 },
  { id: "1219", nama: "KOTA BANDUNG", lat: -6.9175, lon: 107.6191 },
  { id: "0228", nama: "KOTA MEDAN", lat: 3.5952, lon: 98.6722 },
  { id: "2622", nama: "KOTA MAKASSAR", lat: -5.1477, lon: 119.4327 },
];

export function findDefaultCity(id: string): City | undefined {
  return DEFAULT_CITIES.find((c) => c.id === id);
}

export async function geocodeCity(name: string): Promise<City | null> {
  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(name) +
      "&count=1&language=id&format=json";
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const first = json?.results?.[0];
    if (!first) return null;
    return {
      id: "geo-" + String(first.id ?? first.name).toLowerCase().replace(/\s+/g, "-"),
      nama: String(first.name).toUpperCase(),
      lat: Number(first.latitude),
      lon: Number(first.longitude),
    };
  } catch {
    return null;
  }
}
