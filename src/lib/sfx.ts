// SFX ujian Iqro via WebAudio oscillator. Tanpa file mp3.
// Aman di server dan dibungkus try catch.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") {
      try {
        void ctx.resume().catch(() => {
          // abaikan, nada tetap dijadwalkan
        });
      } catch {
        // abaikan
      }
    }
    return ctx;
  } catch {
    return null;
  }
}

function nada(frek: number, jeda: number, lama: number, tipe: OscillatorType, vol: number): void {
  try {
    const ac = audio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const t0 = ac.currentTime + jeda;
    osc.type = tipe;
    osc.frequency.setValueAtTime(frek, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + lama);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + lama + 0.05);
  } catch {
    // abaikan, SFX hanya pelengkap
  }
}

export function sfxBenar(): void {
  try {
    nada(660, 0, 0.16, "sine", 0.25);
    nada(880, 0.13, 0.26, "sine", 0.25);
  } catch {
    // abaikan
  }
}

export function sfxSalah(): void {
  try {
    nada(220, 0, 0.28, "sawtooth", 0.12);
    nada(174, 0.12, 0.34, "sawtooth", 0.12);
  } catch {
    // abaikan
  }
}
