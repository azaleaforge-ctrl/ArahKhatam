import { getTafsir } from "@/lib/quran";

type Ctx = {
  params: Promise<{ nomor: string }>;
};

// Tafsir dimuat malas dari klien lewat sini agar fetch upstream tetap dari server.
export async function GET(_req: Request, ctx: Ctx) {
  const { nomor } = await ctx.params;
  const n = Number(nomor);
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    return Response.json({ error: "Nomor surah harus 1 sampai 114." }, { status: 400 });
  }
  try {
    const { tafsir } = await getTafsir(n);
    return Response.json({ tafsir });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Tafsir belum bisa dimuat." },
      { status: 502 }
    );
  }
}
