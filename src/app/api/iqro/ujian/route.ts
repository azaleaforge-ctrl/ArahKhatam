import { getJilid } from "@/lib/iqro";

export const dynamic = "force-dynamic";

const THRESHOLD = 7;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

// honey: in-memory rate-limit hanya satu instance; ganti Upstash/Vercel WAF di prod multi-instance.
const hits = new Map<string, number[]>();

function clientIp(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "anon";
  return "anon";
}

function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function GET() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(req: Request) {
  if (limited(clientIp(req.headers))) {
    return Response.json({ error: "Terlalu banyak percobaan, coba lagi sebentar." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Body tidak valid." }, { status: 400 });
  }
  const { jilid, answers } = body as { jilid?: unknown; answers?: unknown };
  if (typeof jilid !== "number" || !Number.isInteger(jilid) || jilid < 1 || jilid > 6) {
    return Response.json({ error: "jilid harus integer 1-6." }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 50) {
    return Response.json({ error: "answers harus array 1-50 item." }, { status: 400 });
  }
  for (const a of answers) {
    if (!a || typeof a !== "object") {
      return Response.json({ error: "Tiap answer harus {id, pick}." }, { status: 400 });
    }
    const { id, pick } = a as { id?: unknown; pick?: unknown };
    if (typeof id !== "string" || !id.length || id.length > 200) {
      return Response.json({ error: "answer.id harus string 1-200." }, { status: 400 });
    }
    if (typeof pick !== "string" || !pick.length || pick.length > 200) {
      return Response.json({ error: "answer.pick harus string 1-200." }, { status: 400 });
    }
  }
  const data = getJilid(jilid);
  if (!data) return Response.json({ error: "Jilid tidak ditemukan." }, { status: 404 });

  const kunci = new Map<string, string>();
  for (const p of data.pelajaran) {
    for (const it of p.items) {
      if (!kunci.has(it.arab)) kunci.set(it.arab, it.latin);
    }
  }
  let score = 0;
  for (const a of answers as { id: string; pick: string }[]) {
    if (kunci.get(a.id) === a.pick) score += 1;
  }
  const lulus = score >= THRESHOLD;
  return Response.json({ score, lulus, threshold: THRESHOLD });
}
