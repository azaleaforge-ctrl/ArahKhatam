import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: SITE_URL + "/", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: SITE_URL + "/quran", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: SITE_URL + "/iqro", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];
  for (let n = 1; n <= 114; n++) {
    urls.push({
      url: SITE_URL + "/quran/" + n,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }
  for (let j = 1; j <= 6; j++) {
    urls.push({
      url: SITE_URL + "/iqro/" + j,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }
  urls.push(
    { url: SITE_URL + "/iqro/makhraj", lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: SITE_URL + "/iqro/latihan", lastModified: now, changeFrequency: "monthly", priority: 0.7 }
  );
  return urls;
}
