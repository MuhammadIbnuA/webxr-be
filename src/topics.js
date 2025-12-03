// src/topics.js

// Tiga topik utama + subtopik masalah yang sudah terstruktur
// id: dipakai untuk payload.problemId
// title & detail: dipakai untuk prompt story dan untuk display di UI

const TOPICS = [
  {
    id: "diri",
    name: "Damai dengan Diri",
    description:
      "Ketenangan batin, penerimaan diri, keseimbangan emosi, dan kemampuan mengelola stres.",
    problems: [
      {
        id: "tekanan_kecemasan_akademik",
        title: "Tekanan dan kecemasan akademik",
        detail:
          "Tuntutan nilai yang tinggi dan persaingan membuat siswa merasa cemas, tidak percaya diri, dan mudah stres."
      },
      {
        id: "krisis_identitas_arah_hidup",
        title: "Krisis identitas dan arah hidup",
        detail:
          "Siswa kesulitan menemukan jati diri, minat, dan tujuan hidup sehingga merasa bingung harus melangkah ke mana."
      },
      {
        id: "kesehatan_mental_belum_tertangani",
        title: "Kesehatan mental yang belum tertangani",
        detail:
          "Kesadaran akan pentingnya kesehatan mental masih rendah, ditambah adanya stigma terhadap konseling atau psikolog."
      },
      {
        id: "paparan_media_sosial",
        title: "Paparan media sosial",
        detail:
          "Media sosial memicu rasa tidak cukup, rendah diri, atau pencarian validasi dari orang lain secara berlebihan."
      },
      {
        id: "kehilangan_spiritualitas",
        title: "Kehilangan spiritualitas",
        detail:
          "Siswa mengalami penurunan semangat spiritual dan mulai lalai dalam menjalankan ibadah."
      }
    ]
  },
  {
    id: "sosial",
    name: "Damai dengan Sosial",
    description:
      "Kemampuan hidup rukun, menghargai perbedaan, dan berempati dalam interaksi sosial.",
    problems: [
      {
        id: "intoleransi_stereotip",
        title: "Intoleransi dan stereotip antar kelompok",
        detail:
          "Terjadi gesekan antar etnis, agama, atau status sosial, termasuk munculnya geng yang memperkuat sikap intoleran."
      },
      {
        id: "bullying_perundungan_digital",
        title: "Bullying dan perundungan digital",
        detail:
          "Siswa melakukan atau mengalami perundungan secara fisik maupun daring, terutama di lingkungan sekolah dan media sosial."
      },
      {
        id: "kurang_empati_komunikasi_sehat",
        title: "Kurangnya empati dan komunikasi sehat",
        detail:
          "Siswa cenderung individualistis, kurang peka terhadap perasaan teman, dan mudah terlibat konflik kecil."
      },
      {
        id: "kesenjangan_sosial_ekonomi",
        title: "Kesenjangan sosial dan ekonomi",
        detail:
          "Perbedaan latar belakang keluarga memicu rasa minder atau justru sombong sehingga mengganggu keharmonisan pergaulan."
      },
      {
        id: "budaya_kompetitif_egosentris",
        title: "Budaya kompetitif dan egosentris",
        detail:
          "Nilai kolektivitas dan gotong royong terkikis oleh budaya persaingan dan sikap mementingkan diri sendiri."
      }
    ]
  },
  {
    id: "alam",
    name: "Damai dengan Alam",
    description:
      "Hubungan harmonis antara manusia dan lingkungan hidup, meliputi kepedulian, tanggung jawab, dan perilaku ramah lingkungan.",
    problems: [
      {
        id: "menurunnya_kesadaran_ekologis",
        title: "Menurunnya kesadaran ekologis",
        detail:
          "Siswa cenderung abai terhadap isu sampah, air, dan energi karena dianggap tidak relevan dengan kehidupan sehari-hari."
      },
      {
        id: "konsumtivisme_tidak_ramah_lingkungan",
        title: "Konsumtivisme dan perilaku tidak ramah lingkungan",
        detail:
          "Kebiasaan memakai produk sekali pakai, plastik, dan meningkatnya limbah makanan banyak ditemukan di kalangan pelajar."
      },
      {
        id: "minim_praktik_cinta_lingkungan",
        title: "Minimnya praktik cinta lingkungan di sekolah",
        detail:
          "Komitmen untuk penghijauan, daur ulang, atau konservasi cenderung rendah dan sering hanya bersifat seremonial."
      },
      {
        id: "urbanisasi_alienasi_dari_alam",
        title: "Urbanisasi dan alienasi dari alam",
        detail:
          "Kehidupan kota yang padat mengurangi interaksi dengan alam sehingga empati ekologis siswa berkurang."
      }
    ]
  }
];

module.exports = { TOPICS };
