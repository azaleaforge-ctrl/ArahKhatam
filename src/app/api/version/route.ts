import { APP_VERSION } from "@/lib/version";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Mode dev: fingerprint dari mtime terbaru file di folder src.
// Direkursi dengan batas 500 file, dibulatkan ke detik.
function devFingerprint(): string {
  try {
    const root = path.join(process.cwd(), "src");
    let max = 0;
    let count = 0;
    const walk = (dir: string) => {
      if (count >= 500) return;
      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        if (count >= 500) return;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(p);
        } else if (e.isFile()) {
          count += 1;
          try {
            const sec = Math.floor(fs.statSync(p).mtimeMs / 1000);
            if (sec > max) max = sec;
          } catch {
            // abaikan file yang tidak bisa dibaca
          }
        }
      }
    };
    walk(root);
    return "dev-" + max;
  } catch {
    return "dev";
  }
}

export async function GET() {
  const version = process.env.NODE_ENV === "production" ? APP_VERSION : devFingerprint();
  return Response.json(
    { version },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
