import { notFound } from "next/navigation";
import { getJilid } from "@/lib/iqro";
import JilidView from "@/components/iqro/JilidView";

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((jilid) => ({ jilid: String(jilid) }));
}

export async function generateMetadata({ params }: { params: Promise<{ jilid: string }> }) {
  const { jilid } = await params;
  return {
    title: "Iqro Jilid " + jilid + " | Belajar Iqro ArahKhatam",
    description: "Pelajaran Iqro jilid " + jilid + " dengan latihan baca, ujian, dan penanda selesai.",
  };
}

export default async function JilidPage({ params }: { params: Promise<{ jilid: string }> }) {
  const { jilid } = await params;
  const n = Number(jilid);
  const data = getJilid(n);
  if (!data) notFound();
  return <JilidView jilid={data} />;
}
