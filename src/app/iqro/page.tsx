import { JILID_LIST } from "@/lib/iqro";
import IqroHome from "@/components/iqro/IqroHome";

export const revalidate = 86400;

export default function IqroPage() {
  return <IqroHome jilids={JILID_LIST} />;
}
