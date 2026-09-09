import type { Metadata } from "next";
import { MAKHRAJ_LIST, MAKHRAJ_UTAMA } from "@/lib/iqro";
import MakhrajView from "@/components/iqro/MakhrajView";

export const metadata: Metadata = {
  title: "Makhraj 28 Huruf | Belajar Iqro ArahKhatam",
  description:
    "Referensi makhraj 28 huruf hijaiyah berdasar 5 makhraj utama, lengkap dengan tempat keluar dan contoh.",
};

export default function MakhrajPage() {
  return <MakhrajView makhraj={MAKHRAJ_LIST} utama={MAKHRAJ_UTAMA} />;
}
