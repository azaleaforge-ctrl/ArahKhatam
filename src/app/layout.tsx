import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import UpdatePopup from "@/components/UpdatePopup";
import CursorGlow from "@/components/CursorGlow";
import SociabuzzFloat from "@/components/SociabuzzFloat";
import SplashGate from "@/components/SplashGate";
import { SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const DEFAULT_TITLE = "ArahKhatam: Jadwal Sholat, Arah Kiblat, Al-Quran & Iqro Indonesia";
const DESCRIPTION =
  "Jadwal sholat akurat seluruh Indonesia, kompas arah kiblat, baca Al-Quran terjemah Kemenag, dan belajar Iqro 1-6 online gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: "%s | ArahKhatam" },
  description: DESCRIPTION,
  keywords: [
    "jadwal sholat",
    "waktu sholat indonesia",
    "arah kiblat",
    "kompas kiblat",
    "baca al-quran online",
    "terjemah kemenag",
    "belajar iqro",
    "iqro 1-6",
  ],
  authors: [{ name: "ArahKhatam" }],
  creator: "ArahKhatam",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "ArahKhatam",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ArahKhatam" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/arahkhatam_logo_B2.png", apple: "/arahkhatam_logo_B2.png" },
};

export const viewport: Viewport = {
  themeColor: "#0B1F1A",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL,
      name: "ArahKhatam",
      inLanguage: "id-ID",
      publisher: { "@id": SITE_URL + "/#organization" },
    },
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "ArahKhatam",
      url: SITE_URL,
      logo: SITE_URL + "/arahkhatam_logo_B2.png",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable + " " + fraunces.variable + " h-full antialiased"}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SplashGate />
        <CursorGlow />
        {children}
        <UpdatePopup />
        <SociabuzzFloat />
      </body>
    </html>
  );
}
