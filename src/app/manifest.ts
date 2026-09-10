import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArahKhatam",
    short_name: "ArahKhatam",
    start_url: "/",
    display: "standalone",
    display_override: ["fullscreen", "standalone"],
    background_color: "#F6F1E7",
    theme_color: "#0B1F1A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
