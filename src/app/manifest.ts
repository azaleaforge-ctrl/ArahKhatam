import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArahKhatam",
    short_name: "ArahKhatam",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F1E7",
    theme_color: "#0B1F1A",
    icons: [
      { src: "/arahkhatam_logo_B2.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/arahkhatam_logo_B2.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
  };
}
