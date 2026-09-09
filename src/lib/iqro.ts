// Data statis modul belajar Iqro.
// Sumber kurikulum: Buku Iqra Cara Cepat Belajar Membaca Al-Quran,
// KH Asad Humam dan Team Tadarus AMM Yogyakarta.
// Hanya materi yang pasti yang di encode. Tanpa teks ayat statis.

export type IqroItem = {
  arab: string;
  latin: string;
  kaidah: string;
  catatan: string;
};

export type IqroLesson = {
  id: string;
  judul: string;
  tujuan: string;
  items: IqroItem[];
};

export type IqroJilid = {
  jilid: number;
  judul: string;
  deskripsi: string;
  cover: string;
  coverText: string;
  pelajaran: IqroLesson[];
};

export const JILID_LIST: IqroJilid[] = [
  {
    jilid: 1,
    judul: "Jilid 1: Huruf tunggal berharakat fathah",
    deskripsi: "Kenal 28 huruf hijaiyah tunggal dengan fathah. Dibaca pendek dan terbuka.",
    cover: "#B91C1C",
    coverText: "#FFFFFF",
    pelajaran: [
      {
        id: "j1-p1",
        judul: "Pelajaran 1: a ba ta tsa",
        tujuan: "Lancar bunyi a, ba, ta, tsa dengan fathah pendek.",
        items: [
          { arab: "أَ", latin: "a", kaidah: "Fathah", catatan: "Hamzah berfathah dibaca a, pendek dan terbuka." },
          { arab: "بَ", latin: "ba", kaidah: "Fathah", catatan: "Ba berfathah dibaca ba, pendek dan jelas." },
          { arab: "تَ", latin: "ta", kaidah: "Fathah", catatan: "Ta berfathah dibaca ta, pendek dan ringan." },
          { arab: "ثَ", latin: "tsa", kaidah: "Fathah", catatan: "Tsa berfathah dibaca tsa, ujung lidah keluar sedikit." },
        ],
      },
      {
        id: "j1-p2",
        judul: "Pelajaran 2: ja ha kha da dza",
        tujuan: "Bedakan bunyi tenggorokan dan ujung lidah.",
        items: [
          { arab: "جَ", latin: "ja", kaidah: "Fathah", catatan: "Jim berfathah dibaca ja, pendek dari tengah lidah." },
          { arab: "حَ", latin: "ha", kaidah: "Fathah", catatan: "Ha kecil dibaca ha, pendek dari tengah tenggorokan." },
          { arab: "خَ", latin: "kha", kaidah: "Fathah", catatan: "Kha dibaca kha, pendek berkesan serak dari pangkal tenggorokan." },
          { arab: "دَ", latin: "da", kaidah: "Fathah", catatan: "Dal dibaca da, pendek dan tegas." },
          { arab: "ذَ", latin: "dza", kaidah: "Fathah", catatan: "Dzal dibaca dza, ujung lidah keluar sedikit." },
        ],
      },
      {
        id: "j1-p3",
        judul: "Pelajaran 3: ra za sa sya shad dha",
        tujuan: "Bedakan sin, syin, shad, dan dhad.",
        items: [
          { arab: "رَ", latin: "ra", kaidah: "Fathah", catatan: "Ra dibaca ra, pendek dan bergetar ringan." },
          { arab: "زَ", latin: "za", kaidah: "Fathah", catatan: "Za dibaca za, pendek berdengung ringan." },
          { arab: "سَ", latin: "sa", kaidah: "Fathah", catatan: "Sin dibaca sa, pendek dan tipis." },
          { arab: "شَ", latin: "sya", kaidah: "Fathah", catatan: "Syin dibaca sya, pendek dari tengah lidah." },
          { arab: "صَ", latin: "sha", kaidah: "Fathah", catatan: "Shad dibaca sha, pendek, tebal, dan penuh." },
          { arab: "ضَ", latin: "dha", kaidah: "Fathah", catatan: "Dhad dibaca dha, pendek, tebal, dari sisi lidah." },
        ],
      },
      {
        id: "j1-p4",
        judul: "Pelajaran 4: tha zha ain ghain fa qaf",
        tujuan: "Kuasai huruf tebal dan huruf bibir.",
        items: [
          { arab: "طَ", latin: "tha", kaidah: "Fathah", catatan: "Tha dibaca tha, pendek, tebal, dan mantap." },
          { arab: "ظَ", latin: "zha", kaidah: "Fathah", catatan: "Zha dibaca zha, tebal dengan ujung lidah keluar." },
          { arab: "عَ", latin: "a", kaidah: "Fathah", catatan: "Ain dibaca a dalam, pendek dari tengah tenggorokan." },
          { arab: "غَ", latin: "gha", kaidah: "Fathah", catatan: "Ghain dibaca gha, pendek dari pangkal tenggorokan." },
          { arab: "فَ", latin: "fa", kaidah: "Fathah", catatan: "Fa dibaca fa, pendek dari bibir dan gigi seri atas." },
          { arab: "قَ", latin: "qa", kaidah: "Fathah", catatan: "Qaf dibaca qa, pendek, tebal, dari pangkal lidah." },
        ],
      },
      {
        id: "j1-p5",
        judul: "Pelajaran 5: ka la ma na wa ha ya",
        tujuan: "Lancar huruf akhir hijaiyah tunggal.",
        items: [
          { arab: "كَ", latin: "ka", kaidah: "Fathah", catatan: "Kaf dibaca ka, pendek dan tipis." },
          { arab: "لَ", latin: "la", kaidah: "Fathah", catatan: "Lam dibaca la, pendek dari ujung lidah." },
          { arab: "مَ", latin: "ma", kaidah: "Fathah", catatan: "Mim dibaca ma, pendek dengan bibir merapat." },
          { arab: "نَ", latin: "na", kaidah: "Fathah", catatan: "Nun dibaca na, pendek dari ujung lidah." },
          { arab: "وَ", latin: "wa", kaidah: "Fathah", catatan: "Wawu dibaca wa, pendek dengan bibir maju." },
          { arab: "هَ", latin: "ha", kaidah: "Fathah", catatan: "Ha besar dibaca ha, pendek dan lembut." },
          { arab: "يَ", latin: "ya", kaidah: "Fathah", catatan: "Ya dibaca ya, pendek dari tengah lidah." },
        ],
      },
      {
        id: "j1-p6",
        judul: "Pelajaran 6: Latihan rangkai pendek",
        tujuan: "Merangkai huruf fathah menjadi suku kata pendek.",
        items: [
          { arab: "أَبَ", latin: "aba", kaidah: "Fathah rangkap", catatan: "Dua huruf fathah dibaca sambung, tiap huruf tetap pendek." },
          { arab: "بَتَ", latin: "bata", kaidah: "Fathah rangkap", catatan: "Dibaca bata, tidak ada huruf yang dipanjangkan." },
          { arab: "جَحَ", latin: "jaha", kaidah: "Fathah rangkap", catatan: "Dibaca jaha, jaga bunyi jim dan ha kecil tetap beda." },
          { arab: "دَرَسَ", latin: "darasa", kaidah: "Fathah rangkap", catatan: "Dibaca darasa, tiga huruf pendek berurutan." },
          { arab: "كَتَبَ", latin: "kataba", kaidah: "Fathah rangkap", catatan: "Dibaca kataba, contoh kata kerja pendek berawalan kaf." },
        ],
      },
    ],
  },
  {
    jilid: 2,
    judul: "Jilid 2: Huruf bersambung dan mad thobii",
    deskripsi: "Menyambung huruf berfathah lalu mengenal panjang alami dua harakat.",
    cover: "#15803D",
    coverText: "#FFFFFF",
    pelajaran: [
      {
        id: "j2-p1",
        judul: "Pelajaran 1: Sambung dua huruf",
        tujuan: "Lancar membaca huruf bersambung berfathah.",
        items: [
          { arab: "بَتَ", latin: "bata", kaidah: "Bersambung fathah", catatan: "Huruf bersambung berfathah dibaca pendek menyambung." },
          { arab: "حَمَلَ", latin: "hamala", kaidah: "Bersambung fathah", catatan: "Tiga huruf fathah dibaca pendek dan lancar." },
          { arab: "نَصَرَ", latin: "nashara", kaidah: "Bersambung fathah", catatan: "Shad dibaca tebal walau bersambung dengan huruf tipis." },
          { arab: "كَتَبَ", latin: "kataba", kaidah: "Bersambung fathah", catatan: "Contoh kata sambung penuh, semua pendek." },
        ],
      },
      {
        id: "j2-p2",
        judul: "Pelajaran 2: Kata tiga huruf",
        tujuan: "Mantap membaca kata berfathah tanpa terputus.",
        items: [
          { arab: "جَعَلَ", latin: "jaala", kaidah: "Bersambung fathah", catatan: "Dibaca pendek jaala versi pendek, belum ada pemanjang." },
          { arab: "فَتَحَ", latin: "fataha", kaidah: "Bersambung fathah", catatan: "Fa, ta, dan ha kecil dibaca pendek berurutan." },
          { arab: "غَفَرَ", latin: "ghafara", kaidah: "Bersambung fathah", catatan: "Ghain dan fa dibaca pendek sesuai aslinya." },
        ],
      },
      {
        id: "j2-p3",
        judul: "Pelajaran 3: Mad thobii dengan alif",
        tujuan: "Bedakan bacaan pendek dan panjang dua harakat.",
        items: [
          { arab: "بَا", latin: "baa", kaidah: "Mad thobii", catatan: "Fathah bertemu alif dibaca panjang dua harakat." },
          { arab: "جَالَ", latin: "jaala", kaidah: "Mad thobii", catatan: "Jim panjang karena alif, lam tetap pendek." },
          { arab: "كَانَ", latin: "kaana", kaidah: "Mad thobii", catatan: "Kaf panjang dua harakat, nun pendek." },
          { arab: "قَالَ", latin: "qoola", kaidah: "Mad thobii", catatan: "Qaf tebal dibaca panjang dua harakat." },
        ],
      },
    ],
  },
  {
    jilid: 3,
    judul: "Jilid 3: Kasrah, dhammah, dan panjangnya",
    deskripsi: "Bunyi i dan u plus pasangannya yang panjang.",
    cover: "#0284C7",
    coverText: "#FFFFFF",
    pelajaran: [
      {
        id: "j3-p1",
        judul: "Pelajaran 1: Kasrah",
        tujuan: "Kuasai bunyi i pendek.",
        items: [
          { arab: "بِ", latin: "bi", kaidah: "Kasrah", catatan: "Ba berkasrah dibaca bi, pendek dan ringan." },
          { arab: "كِ", latin: "ki", kaidah: "Kasrah", catatan: "Kaf berkasrah dibaca ki, pendek dan tipis." },
          { arab: "رِ", latin: "ri", kaidah: "Kasrah", catatan: "Ra berkasrah dibaca ri, tipis dan pendek." },
        ],
      },
      {
        id: "j3-p2",
        judul: "Pelajaran 2: Dhammah",
        tujuan: "Kuasai bunyi u pendek.",
        items: [
          { arab: "بُ", latin: "bu", kaidah: "Dhammah", catatan: "Ba berdhammah dibaca bu, bibir maju dan pendek." },
          { arab: "كُ", latin: "ku", kaidah: "Dhammah", catatan: "Kaf berdhammah dibaca ku, pendek dan bulat." },
          { arab: "مُ", latin: "mu", kaidah: "Dhammah", catatan: "Mim berdhammah dibaca mu, pendek dengan bibir maju." },
        ],
      },
      {
        id: "j3-p3",
        judul: "Pelajaran 3: Kata kasrah dan dhammah",
        tujuan: "Merangkai kata berharakat bawah dan depan.",
        items: [
          { arab: "كُتِبَ", latin: "kutiba", kaidah: "Dhammah dan kasrah", catatan: "Kaf dhammah, ta kasrah, ba fathah, semua pendek." },
          { arab: "رُسُلُ", latin: "rusulu", kaidah: "Dhammah dan fathah", catatan: "Ra dan sin dhammah pendek, lam dhammah pendek." },
          { arab: "سُمِعَ", latin: "sumia", kaidah: "Dhammah dan kasrah", catatan: "Sin dhammah dan mim kasrah dibaca pendek." },
        ],
      },
      {
        id: "j3-p4",
        judul: "Pelajaran 4: Panjang kasrah dan dhammah",
        tujuan: "Panjangkan i dan u dua harakat pada tempatnya.",
        items: [
          { arab: "فِي", latin: "fii", kaidah: "Mad thobii kasrah", catatan: "Kasrah bertemu ya sukun dibaca panjang dua harakat." },
          { arab: "دِينِ", latin: "diini", kaidah: "Mad thobii kasrah", catatan: "Dal panjang karena ya sukun, nun kasrah pendek." },
          { arab: "بُو", latin: "buu", kaidah: "Mad thobii dhammah", catatan: "Dhammah bertemu wawu sukun dibaca panjang dua harakat." },
          { arab: "رَسُولُ", latin: "rosuulu", kaidah: "Mad thobii dhammah", catatan: "Sin panjang karena wawu sukun, huruf lain pendek." },
        ],
      },
    ],
  },
  {
    jilid: 4,
    judul: "Jilid 4: Tanwin, layyin, idzhar, qalqalah",
    deskripsi: "Bunyi an in un, diftong lembut, bacaan jelas, dan pantulan.",
    cover: "#CA8A04",
    coverText: "#1A1405",
    pelajaran: [
      {
        id: "j4-p1",
        judul: "Pelajaran 1: Tanwin",
        tujuan: "Bedakan bunyi an, in, dan un.",
        items: [
          { arab: "بًا", latin: "ban", kaidah: "Tanwin fathah", catatan: "Tanwin atas dibaca an, pendek bernun." },
          { arab: "بٍ", latin: "bin", kaidah: "Tanwin kasrah", catatan: "Tanwin bawah dibaca in, pendek bernun." },
          { arab: "بٌ", latin: "bun", kaidah: "Tanwin dhammah", catatan: "Tanwin depan dibaca un, pendek bernun." },
        ],
      },
      {
        id: "j4-p2",
        judul: "Pelajaran 2: Bacaan layyin",
        tujuan: "Lembutkan diftong ai dan au.",
        items: [
          { arab: "بَيْتَ", latin: "baita", kaidah: "Layyin", catatan: "Fathah bertemu ya sukun dibaca ai secara lembut." },
          { arab: "خَوْفَ", latin: "khaufa", kaidah: "Layyin", catatan: "Fathah bertemu wawu sukun dibaca au secara lembut." },
        ],
      },
      {
        id: "j4-p3",
        judul: "Pelajaran 3: Nun dan mim sukun dibaca jelas",
        tujuan: "Lancar idzhar dengan bunyi terang.",
        items: [
          { arab: "مِنْ", latin: "min", kaidah: "Idzhar", catatan: "Nun sukun bertemu huruf halq dibaca jelas tanpa dengung." },
          { arab: "عَنْ", latin: "an", kaidah: "Idzhar", catatan: "Nun sukun dibaca terang dan pendek." },
          { arab: "لَمْ", latin: "lam", kaidah: "Idzhar syafawi", catatan: "Mim sukun dibaca jelas tanpa dengung berlebih." },
        ],
      },
      {
        id: "j4-p4",
        judul: "Pelajaran 4: Qalqalah",
        tujuan: "Mantulkan lima huruf saat sukun.",
        items: [
          { arab: "أَحَدْ", latin: "ahad", kaidah: "Qalqalah kubra", catatan: "Dal di ujung kata dibaca memantul dengan jelas." },
          { arab: "قَلْبِ", latin: "qolbi", kaidah: "Qalqalah sughra", catatan: "Qaf sukun di tengah dibaca memantul kecil." },
          { arab: "قُطْبُ جَدٍّ", latin: "quthbu jaddin", kaidah: "Huruf qalqalah", catatan: "Lima huruf qaf, tha, ba, jim, dal wajib memantul saat sukun." },
        ],
      },
    ],
  },
  {
    jilid: 5,
    judul: "Jilid 5: Alif lam, tasydid, dan mad praktik",
    deskripsi: "Bedakan lam yang dibaca dan yang lebur plus panjang bacaan.",
    cover: "#7C3AED",
    coverText: "#FFFFFF",
    pelajaran: [
      {
        id: "j5-p1",
        judul: "Pelajaran 1: Alif lam qamariyah",
        tujuan: "Baca lam dengan jelas.",
        items: [
          { arab: "الْقَمَرُ", latin: "al-qamaru", kaidah: "Qamariyah", catatan: "Lam sukun dibaca jelas sebelum huruf qamariyah." },
          { arab: "الْكِتَابُ", latin: "al-kitaabu", kaidah: "Qamariyah", catatan: "Lam tetap terbaca, kaf dibaca pendek." },
        ],
      },
      {
        id: "j5-p2",
        judul: "Pelajaran 2: Alif lam syamsiyah",
        tujuan: "Leburkan lam ke huruf berikutnya.",
        items: [
          { arab: "الشَّمْسُ", latin: "asy-syamsu", kaidah: "Syamsiyah", catatan: "Lam tidak dibaca, syin bertasydid dibaca tegas." },
          { arab: "النُّورُ", latin: "an-nuuru", kaidah: "Syamsiyah", catatan: "Lam lebur, nun bertasydid dibaca dengung dan jelas." },
        ],
      },
      {
        id: "j5-p3",
        judul: "Pelajaran 3: Tasydid dan idgham",
        tujuan: "Tekan huruf ganda dan leburkan nun.",
        items: [
          { arab: "إِنَّ", latin: "inna", kaidah: "Tasydid dan ghunnah", catatan: "Nun bertasydid dibaca dengung sekitar dua harakat." },
          { arab: "مَنْ يَقُولُ", latin: "may yaquulu", kaidah: "Idgham bighunnah", catatan: "Nun sukun bertemu ya dibaca lebur dengan dengung." },
          { arab: "مِنْ لَدُنْ", latin: "mil ladun", kaidah: "Idgham bilaghunnah", catatan: "Nun sukun bertemu lam dibaca lebur tanpa dengung." },
        ],
      },
      {
        id: "j5-p4",
        judul: "Pelajaran 4: Lam jalalah",
        tujuan: "Bedakan lafadz Allah yang tebal dan tipis.",
        items: [
          { arab: "اللَّهُ", latin: "allaahu", kaidah: "Tafkhim", catatan: "Lam jalalah setelah fathah dibaca tebal." },
          { arab: "بِاللَّهِ", latin: "billaahi", kaidah: "Tarqiq", catatan: "Lam jalalah setelah kasrah dibaca tipis." },
        ],
      },
      {
        id: "j5-p5",
        judul: "Pelajaran 5: Mad praktik",
        tujuan: "Praktik bacaan panjang lebih dari dua harakat.",
        items: [
          { arab: "جَاءَ", latin: "jaa-a", kaidah: "Mad wajib", catatan: "Mad bertemu hamzah satu kata dibaca panjang sekitar lima harakat." },
          { arab: "فِي أُمِّهَا", latin: "fii ummihaa", kaidah: "Mad jaiz", catatan: "Mad bertemu hamzah beda kata boleh dibaca dua sampai lima harakat." },
          { arab: "وَلَا الضَّالِّينَ", latin: "walaadh-dhaalliin", kaidah: "Mad lazim", catatan: "Mad bertemu tasydid dibaca panjang enam harakat." },
        ],
      },
    ],
  },
  {
    jilid: 6,
    judul: "Jilid 6: Iqlab, ikhfa, waqaf, fawatihus suwar",
    deskripsi: "Dengung samaran, tanda berhenti, dan pembuka surah.",
    cover: "#78350F",
    coverText: "#FFF7ED",
    pelajaran: [
      {
        id: "j6-p1",
        judul: "Pelajaran 1: Iqlab",
        tujuan: "Ubah nun menjadi mim dengan dengung.",
        items: [
          { arab: "مِنْ بَعْدِ", latin: "mim badi", kaidah: "Iqlab", catatan: "Nun sukun bertemu ba dibaca mim dengan dengung." },
        ],
      },
      {
        id: "j6-p2",
        judul: "Pelajaran 2: Ikhfa",
        tujuan: "Samarkan nun dengan dengung.",
        items: [
          { arab: "مِنْ شَرِّ", latin: "min syarri", kaidah: "Ikhfa", catatan: "Nun sukun bertemu syin dibaca samar dengan dengung." },
          { arab: "مِنْ سُوءِ", latin: "min suu-i", kaidah: "Ikhfa", catatan: "Nun sukun bertemu sin dibaca samar dengan dengung." },
        ],
      },
      {
        id: "j6-p3",
        judul: "Pelajaran 3: Tanda waqaf",
        tujuan: "Tahu kapan berhenti dan kapan lanjut.",
        items: [
          { arab: "مـ", latin: "waqaf mim", kaidah: "Waqaf lazim", catatan: "Tanda mim artinya berhenti di sini lebih utama." },
          { arab: "ج", latin: "waqaf jim", kaidah: "Waqaf jaiz", catatan: "Tanda jim artinya boleh berhenti atau lanjut." },
        ],
      },
      {
        id: "j6-p4",
        judul: "Pelajaran 4: Waqaf pasti",
        tujuan: "Lafalkan ujung kata dengan benar saat berhenti.",
        items: [
          { arab: "الصَّلَاة", latin: "ash-sholaah", kaidah: "Waqaf", catatan: "Saat berhenti, ta marbutah dibaca ha dan dipanjangkan." },
        ],
      },
      {
        id: "j6-p5",
        judul: "Pelajaran 5: Fawatihus suwar",
        tujuan: "Baca huruf pembuka surah dengan panjang tepat.",
        items: [
          { arab: "الم", latin: "alif laam miim", kaidah: "Fawatihus suwar", catatan: "Alif pendek, lam dan mim dibaca panjang enam harakat." },
          { arab: "يس", latin: "yaa siin", kaidah: "Fawatihus suwar", catatan: "Ya dibaca dua harakat, sin dibaca enam harakat." },
          { arab: "ق", latin: "qoof", kaidah: "Fawatihus suwar", catatan: "Qaf dibaca panjang enam harakat dengan jelas." },
        ],
      },
    ],
  },
];

export function getJilid(n: number): IqroJilid | null {
  return JILID_LIST.find((j) => j.jilid === n) ?? null;
}

export function allLessonIds(jilid: IqroJilid): string[] {
  return jilid.pelajaran.map((p) => p.id);
}

// Rekomendasi latihan dari Juz Amma. Teks diambil runtime dari API,
// di sini hanya nomor, nama latin, dan alasan latihan.
export type JuzLatihan = {
  nomor: number;
  namaLatin: string;
  arti: string;
  alasan: string;
};

export const JUZ_AMMA_LATIHAN: JuzLatihan[] = [
  { nomor: 112, namaLatin: "Al-Ikhlash", arti: "Memurnikan keesaan Allah", alasan: "Pendek, huruf jelas, cocok untuk lancar fathah." },
  { nomor: 113, namaLatin: "Al-Falaq", arti: "Waktu subuh", alasan: "Latih qalqalah dal dan huruf tebal." },
  { nomor: 114, namaLatin: "An-Nas", arti: "Manusia", alasan: "Latih nun bertasydid dan ghunnah." },
  { nomor: 108, namaLatin: "Al-Kautsar", arti: "Nikmat yang banyak", alasan: "Paling pendek, cocok untuk target hafal pertama." },
  { nomor: 105, namaLatin: "Al-Fil", arti: "Gajah", alasan: "Latih lam jalalah dan bacaan sambung." },
  { nomor: 106, namaLatin: "Quraisy", arti: "Suku Quraisy", alasan: "Latih bacaan layyin dan waqaf akhir ayat." },
  { nomor: 109, namaLatin: "Al-Kafirun", arti: "Orang-orang kafir", alasan: "Latih mad dan beda kaf dengan qaf." },
  { nomor: 110, namaLatin: "An-Nashr", arti: "Pertolongan", alasan: "Latih tasydid dan idgham sederhana." },
  { nomor: 111, namaLatin: "Al-Lahab", arti: "Sabut api", alasan: "Latih idzhar dan pantulan ba." },
  { nomor: 107, namaLatin: "Al-Maun", arti: "Barang berguna", alasan: "Latih panjang mad dan waqaf akhir ayat." },
];

// Makhraj ringkas 28 huruf. Utama memakai 5 kelompok besar.
// Khaisyum adalah dengung pada nun dan mim, ditandai flag ghunnah.
export type MakhrajUtama = "Halq" | "Lisan" | "Syafatain" | "Jauf" | "Khaisyum";

export type MakhrajItem = {
  huruf: string;
  nama: string;
  utama: Exclude<MakhrajUtama, "Khaisyum">;
  tempat: string;
  contoh: string;
  ghunnah?: boolean;
};

export const MAKHRAJ_UTAMA: { nama: MakhrajUtama; arti: string }[] = [
  { nama: "Halq", arti: "Tenggorokan" },
  { nama: "Lisan", arti: "Lidah" },
  { nama: "Syafatain", arti: "Dua bibir" },
  { nama: "Jauf", arti: "Rongga mulut" },
  { nama: "Khaisyum", arti: "Rongga hidung untuk dengung" },
];

export const MAKHRAJ_LIST: MakhrajItem[] = [
  { huruf: "ا", nama: "Alif", utama: "Jauf", tempat: "Rongga mulut", contoh: "قَالَ" },
  { huruf: "ب", nama: "Ba", utama: "Syafatain", tempat: "Dua bibir merapat", contoh: "بَيْتَ" },
  { huruf: "ت", nama: "Ta", utama: "Lisan", tempat: "Ujung lidah dan gusi atas", contoh: "كَتَبَ" },
  { huruf: "ث", nama: "Tsa", utama: "Lisan", tempat: "Ujung lidah keluar sedikit", contoh: "ثَوَابَ" },
  { huruf: "ج", nama: "Jim", utama: "Lisan", tempat: "Tengah lidah dan langit atas", contoh: "جَعَلَ" },
  { huruf: "ح", nama: "Ha kecil", utama: "Halq", tempat: "Tengah tenggorokan", contoh: "فَتَحَ" },
  { huruf: "خ", nama: "Kha", utama: "Halq", tempat: "Pangkal tenggorokan", contoh: "خَوْفَ" },
  { huruf: "د", nama: "Dal", utama: "Lisan", tempat: "Ujung lidah dan gusi atas", contoh: "أَحَدْ" },
  { huruf: "ذ", nama: "Dzal", utama: "Lisan", tempat: "Ujung lidah keluar sedikit", contoh: "ذِكْرَ" },
  { huruf: "ر", nama: "Ra", utama: "Lisan", tempat: "Ujung lidah bergetar ringan", contoh: "نَصَرَ" },
  { huruf: "ز", nama: "Za", utama: "Lisan", tempat: "Ujung lidah dan gigi bawah", contoh: "رُسُلُ" },
  { huruf: "س", nama: "Sin", utama: "Lisan", tempat: "Ujung lidah dan gigi bawah", contoh: "سُمِعَ" },
  { huruf: "ش", nama: "Syin", utama: "Lisan", tempat: "Tengah lidah dan langit atas", contoh: "الشَّمْسُ" },
  { huruf: "ص", nama: "Shad", utama: "Lisan", tempat: "Ujung lidah, tebal dan penuh", contoh: "الصَّلَاة" },
  { huruf: "ض", nama: "Dhad", utama: "Lisan", tempat: "Sisi lidah dan gigi geraham", contoh: "وَلَا الضَّالِّينَ" },
  { huruf: "ط", nama: "Tha", utama: "Lisan", tempat: "Ujung lidah, tebal dan mantap", contoh: "قُطْبُ" },
  { huruf: "ظ", nama: "Zha", utama: "Lisan", tempat: "Ujung lidah keluar, tebal", contoh: "ظَلَمَ" },
  { huruf: "ع", nama: "Ain", utama: "Halq", tempat: "Tengah tenggorokan", contoh: "سُمِعَ" },
  { huruf: "غ", nama: "Ghain", utama: "Halq", tempat: "Pangkal tenggorokan", contoh: "غَفَرَ" },
  { huruf: "ف", nama: "Fa", utama: "Syafatain", tempat: "Bibir bawah dan gigi seri atas", contoh: "الْفِيل" },
  { huruf: "ق", nama: "Qaf", utama: "Lisan", tempat: "Pangkal lidah, tebal", contoh: "الْقَمَرُ" },
  { huruf: "ك", nama: "Kaf", utama: "Lisan", tempat: "Pangkal lidah, tipis", contoh: "كَتَبَ" },
  { huruf: "ل", nama: "Lam", utama: "Lisan", tempat: "Ujung lidah dan gusi atas", contoh: "الْقَمَرُ" },
  { huruf: "م", nama: "Mim", utama: "Syafatain", tempat: "Dua bibir merapat", contoh: "مِنْ", ghunnah: true },
  { huruf: "ن", nama: "Nun", utama: "Lisan", tempat: "Ujung lidah dan gusi atas", contoh: "إِنَّ", ghunnah: true },
  { huruf: "و", nama: "Wawu", utama: "Jauf", tempat: "Rongga mulut saat mad", contoh: "رَسُولُ" },
  { huruf: "ه", nama: "Ha besar", utama: "Halq", tempat: "Pangkal tenggorokan bawah", contoh: "اللَّهِ" },
  { huruf: "ي", nama: "Ya", utama: "Jauf", tempat: "Rongga mulut saat mad", contoh: "فِي" },
];
