// Suara baca Iqro via speechSynthesis bawaan browser.
// Tidak ada API audio per huruf, jadi suara dibuat lokal di perangkat anak.
// Semua fungsi aman di server dan dibungkus try catch.

const PILIHAN_KEY = "iqro-suara";

export function suaraTersedia(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined"
    );
  } catch {
    return false;
  }
}

export function suaraAktif(): boolean {
  try {
    if (typeof localStorage === "undefined") return true;
    return localStorage.getItem(PILIHAN_KEY) !== "0";
  } catch {
    return true;
  }
}

export function simpanPilihanSuara(on: boolean): void {
  try {
    localStorage.setItem(PILIHAN_KEY, on ? "1" : "0");
  } catch {
    // abaikan, mode privat atau penyimpanan penuh
  }
}

export function hentiSuara(): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  } catch {
    // abaikan
  }
}

function suaraSiap(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      const awal = synth.getVoices();
      if (awal.length) {
        resolve(awal);
        return;
      }
      let selesai = false;
      const done = () => {
        if (selesai) return;
        selesai = true;
        try {
          resolve(synth.getVoices());
        } catch {
          resolve([]);
        }
      };
      const t = window.setTimeout(done, 900);
      try {
        synth.addEventListener(
          "voiceschanged",
          () => {
            window.clearTimeout(t);
            done();
          },
          { once: true }
        );
      } catch {
        window.clearTimeout(t);
        done();
      }
    } catch {
      resolve([]);
    }
  });
}

// Bunyikan satu item Iqro. Bila perangkat punya suara Arab, baca teks Arab.
// Bila tidak (umum di Chrome desktop Windows), baca latinnya dengan suara
// bawaan agar anak tetap mendengar bunyi yang benar.
export function bicaraItem(arab: string, latin: string): void {
  try {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    const a = arab.trim();
    const l = latin.trim();
    if (!a && !l) return;
    const synth = window.speechSynthesis;
    try {
      synth.cancel();
    } catch {
      // abaikan
    }
    void suaraSiap().then((daftar) => {
      try {
        const arabVoice = daftar.filter((v) => (v.lang || "").toLowerCase().startsWith("ar"));
        const lokal = arabVoice.filter((v) => v.localService);
        const pilihan = lokal[0] ?? arabVoice[0] ?? null;
        const u =
          pilihan && a
            ? new SpeechSynthesisUtterance(a)
            : new SpeechSynthesisUtterance(l || a);
        if (pilihan && a) {
          u.voice = pilihan;
          u.lang = pilihan.lang || "ar-SA";
          u.rate = 0.75;
        } else {
          u.lang = "id-ID";
          u.rate = 0.9;
        }
        u.pitch = 1;
        try {
          synth.cancel();
        } catch {
          // abaikan
        }
        try {
          // Bangunkan mesin suara yang macet dalam status paused.
          synth.resume();
        } catch {
          // abaikan, lanjut bicara
        }
        synth.speak(u);
      } catch {
        // abaikan, suara hanya pelengkap latihan
      }
    });
  } catch {
    // abaikan, suara hanya pelengkap latihan
  }
}

export function bicaraArab(teks: string): void {
  bicaraItem(teks, "");
}
