export default function Footer() {
  return (
    <footer className="kawung-dark bg-[#0B1F1A] py-10 text-[#F6F1E7] md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-3 md:gap-8">
        <div>
          <p className="font-display text-2xl">ArahKhatam</p>
          <p className="mt-1 text-sm text-[#F6F1E7]/60">penunjuk kiblat & khatam harian Indonesia</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#F6F1E7]/70">
            Jadwal harian 8 waktu, tren bulanan 30 hari, countdown live, dan kompas kiblat.
            Data Kemenag RI via MyQuran v2, cadangan Aladhan method 20.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">NAVIGASI</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:block md:space-y-2">
            <li><a href="#jadwal" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Jadwal harian</a></li>
            <li><a href="#bulanan" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Jadwal bulanan</a></li>
            <li><a href="#kiblat" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Kompas kiblat</a></li>
            <li><a href="/quran" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Baca AlQuran</a></li>
            <li><a href="/iqro" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Belajar Iqro</a></li>
            <li><a href="#donasi" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Donasi</a></li>
            <li><a href="/tv" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Display TV</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#E8A33D]">SUMBER DATA</p>
          <ul className="mt-3 space-y-2 text-sm text-[#F6F1E7]/75">
            <li><a href="https://api.myquran.com/v2/sholat" target="_blank" rel="noreferrer" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">MyQuran v2 sholat</a></li>
            <li><a href="https://api.aladhan.com" target="_blank" rel="noreferrer" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Aladhan method 20</a></li>
            <li><a href="https://geocoding-api.open-meteo.com" target="_blank" rel="noreferrer" className="inline-block py-1.5 hover:text-[#E8A33D] md:py-0">Open-Meteo geocoding</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-5 text-xs text-[#F6F1E7]/50">
        <p>Dibuat dengan teliti di Indonesia. Waktu hijriah bersifat perkiraan (kalender Umm al-Qura).</p>
        <p className="mt-1">Audio basmalah notifikasi dari EQuran.id, qari Misyari Rasyid Al-Afasi.</p>
        <p className="mt-1">Materi Iqro merujuk pada Buku Iqra Cara Cepat Belajar Membaca Al-Quran, KH Asad Humam dan Team Tadarus AMM Yogyakarta.</p>
        <p className="mt-1">Foto: Masjid Raya Bandung oleh Rhmtdns (CC BY-SA 3.0), Sajadah oleh Wawanriza78 (CC BY-SA 4.0), Masjid senja oleh sam garza (CC BY 2.0), via Wikimedia Commons.</p>
      </div>
    </footer>
  );
}
