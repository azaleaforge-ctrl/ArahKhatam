import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJilid } from "@/lib/iqro";
import { SITE_URL } from "@/lib/site";
import JilidView from "@/components/iqro/JilidView";

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((jilid) => ({ jilid: String(jilid) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jilid: string }>;
}): Promise<Metadata> {
  const { jilid } = await params;
  const n = Number(jilid);
  if (!Number.isInteger(n) || n < 1 || n > 6) return { robots: { index: false, follow: false } };
  const title = "Iqro Jilid " + n + " | ArahKhatam";
  const description =
    "Belajar Iqro jilid " + n + " online: bacaan per halaman, audio, latihan, dan ujian dengan penanda selesai di ArahKhatam.";
  const url = SITE_URL + "/iqro/" + n;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "id_ID",
      siteName: "ArahKhatam",
      url,
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}

export default async function JilidPage({ params }: { params: Promise<{ jilid: string }> }) {
  const { jilid } = await params;
  const n = Number(jilid);
  const data = getJilid(n);
  if (!data) notFound();
  return <JilidView jilid={data} />;
}
