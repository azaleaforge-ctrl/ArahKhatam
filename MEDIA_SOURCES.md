# Sumber Media ArahKhatam

Web merujuk file lokal berikut (jangan hotlink langsung):

- `/media/masjid-agung-bandung.jpg` , hero landing atas (Masjid Raya Bandung)
- `/media/masjid-senja.jpg` , hero malam hijau
- `/media/sajadah.jpg` , section donasi hangat
- `/media/kota-pagi.jpg` , latar jadwal harian

Bila file belum ada, komponen `SafeImage` menyembunyikan tag img dan gradient
bawaan tetap tampil sehingga web tetap cantik.

## Cara mengunduh

Jalankan:

```
node scripts/fetch-media.mjs
```

Script mengunduh 3 foto gratis dari Pexels ke `public/media`.

## Sumber dan atribusi (foto asli terpasang 09-09-2026)

1. Masjid Raya Bandung dan Alun-alun Bandung
   - File: `/media/masjid-agung-bandung.jpg`
   - Halaman: https://commons.wikimedia.org/wiki/File:Masjid_Raya_Bandung_dan_Alun-alun_Bandung_(potrait).jpg
   - Fotografer: Rhmtdns, lisensi CC BY-SA 3.0 https://creativecommons.org/licenses/by-sa/3.0
2. Sajadah (alas sholat)
   - File: `/media/sajadah.jpg`
   - Halaman: https://commons.wikimedia.org/wiki/File:Sajadah.jpg
   - Fotografer: Wawanriza78, lisensi CC BY-SA 4.0 https://creativecommons.org/licenses/by-sa/4.0
3. Masjid saat senja
   - File: `/media/masjid-senja.jpg`
   - Halaman: https://commons.wikimedia.org/wiki/File:Sultan_Omar_Ali_Saifuddin_Mosque_02.jpg
   - Fotografer: sam garza, lisensi CC BY 2.0 https://creativecommons.org/licenses/by/2.0

Semua foto dari Wikimedia Commons, boleh dipakai komersial dengan atribusi di atas.
