import { notFound } from "next/navigation";
import { getJilid } from "@/lib/iqro";
import UjianView from "@/components/iqro/UjianView";

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((jilid) => ({ jilid: String(jilid) }));
}

export async function generateMetadata({ params }: { params: Promise<{ jilid: string }> }) {
  const { jilid } = await params;
  return {
    title: "Ujian Iqro Jilid " + jilid + " | Belajar Iqro ArahKhatam",
    description: "Ujian 10 soal acak Iqro jilid " + jilid + " dengan nilai kelulusan 70.",
  };
}

export default async function UjianPage({ params }: { params: Promise<{ jilid: string }> }) {
  const { jilid } = await params;
  const n = Number(jilid);
  const data = getJilid(n);
  if (!data) notFound();
  return <UjianView jilid={data} />;
}
