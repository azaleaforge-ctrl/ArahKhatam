import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const OUT = path.join(process.cwd(), "public", "media");

const FILES = [
  { name: "masjid-senja.jpg", ids: ["3012792"] },
  { name: "sajadah.jpg", ids: ["3673262", "6815161", "2300036"] },
  { name: "kota-pagi.jpg", ids: ["373912"] },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "WaktuSholat/1.0" } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error("HTTP " + res.statusCode + " untuk " + url));
          return;
        }
        const ws = fs.createWriteStream(dest);
        res.pipe(ws);
        ws.on("finish", () => ws.close(() => resolve(true)));
        ws.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of FILES) {
    const dest = path.join(OUT, f.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 20000) {
      console.log("Lewati (sudah ada): " + f.name);
      continue;
    }
    for (const id of f.ids) {
      const url = "https://images.pexels.com/photos/" + id + "/pexels-photo-" + id + ".jpeg?auto=compress&cs=tinysrgb&w=1200";
      try {
        console.log("Mengunduh " + f.name + " dari " + id + "...");
        await download(url, dest);
        console.log("OK: " + f.name);
        break;
      } catch (e) {
        console.log("Gagal " + f.name + " (" + id + "): " + String(e));
        if (id === f.ids[f.ids.length - 1]) {
          console.log("Gradient fallback tetap dipakai, web tetap cantik tanpa file ini.");
        }
      }
    }
  }
}

main();
