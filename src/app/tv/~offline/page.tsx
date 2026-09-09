export default function TvOfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B1F1A] px-6 text-center text-[#F6F1E7]">
      <p className="text-xs font-bold tracking-[0.3em] text-[#E8A33D]">
        ARAHKHATAM • DISPLAY MASJID
      </p>
      <h1 className="mt-2 text-3xl">TV sedang offline</h1>
      <p className="mt-2 max-w-md text-sm text-[#F6F1E7]/70">
        Tidak ada koneksi. Jadwal terakhir yang tersimpan akan tampil otomatis
        setelah koneksi kembali.
      </p>
      <a
        href="/tv"
        className="mt-6 rounded-full bg-[#E8A33D] px-6 py-3 text-sm font-bold text-[#0B1F1A]"
      >
        Coba lagi
      </a>
    </main>
  );
}
