// data/topics.js

const TOPICS = {
  diri: {
    id: "diri",
    label: "Damai dengan Diri",
    description:
      "Ketenangan batin, penerimaan diri, keseimbangan emosi, dan kemampuan mengelola stres.",
    problems: [
      {
        id: "tekanan_kecemasan_akademik",
        title: "Tekanan dan kecemasan akademik",
        detail:
          "Merasa tertekan oleh tugas, nilai, dan persaingan sehingga muncul cemas, tidak percaya diri, dan stres.",
      },
      {
        id: "krisis_identitas_arah_hidup",
        title: "Krisis identitas dan arah hidup",
        detail:
          "Bingung menemukan jati diri, minat, dan tujuan hidup sehingga merasa kosong atau tersesat.",
      },
      {
        id: "kesehatan_mental_belum_tertangani",
        title: "Kesehatan mental yang belum tertangani",
        detail:
          "Belum terlalu peduli kesehatan mental dan masih ada rasa malu atau stigma untuk mencari bantuan.",
      },
      {
        id: "paparan_media_sosial",
        title: "Paparan media sosial",
        detail:
          "Sering membandingkan diri dengan orang lain di media sosial dan merasa tidak cukup atau kurang berharga.",
      },
      {
        id: "kehilangan_spiritualitas",
        title: "Kehilangan spiritualitas",
        detail:
          "Merasa ibadah menurun, jauh dari nilai-nilai spiritual, atau sulit merasakan kedekatan dengan Tuhan.",
      },
    ],
  },
  sosial: {
    id: "sosial",
    label: "Damai dengan Sosial",
    description:
      "Kemampuan hidup rukun, menghargai perbedaan, dan berempati dalam interaksi sosial.",
    problems: [
      {
        id: "intoleransi_stereotip",
        title: "Intoleransi dan stereotip",
        detail:
          "Ada gesekan atau jarak dengan teman yang berbeda suku, agama, atau latar belakang.",
      },
      {
        id: "bullying_perundungan_digital",
        title: "Bullying dan perundungan digital",
        detail:
          "Pernah mengalami atau menyaksikan perundungan, baik secara langsung maupun di media sosial.",
      },
      {
        id: "kurang_empati_komunikasi",
        title: "Kurangnya empati dan komunikasi sehat",
        detail:
          "Sering terjadi konflik kecil, salah paham, atau sulit menyampaikan perasaan dengan cara yang baik.",
      },
      {
        id: "kesenjangan_sosial_ekonomi",
        title: "Kesenjangan sosial dan ekonomi",
        detail:
          "Merasa minder atau justru superior karena perbedaan kondisi ekonomi dengan teman sebaya.",
      },
      {
        id: "budaya_kompetitif_ego",
        title: "Budaya kompetitif dan egosentris",
        detail:
          "Merasa lingkungan terlalu kompetitif sehingga nilai kebersamaan dan gotong royong berkurang.",
      },
    ],
  },
  alam: {
    id: "alam",
    label: "Damai dengan Alam",
    description:
      "Hubungan harmonis dengan lingkungan hidup, kepedulian, dan perilaku ramah lingkungan.",
    problems: [
      {
        id: "rendah_kesadaran_ekologis",
        title: "Menurunnya kesadaran ekologis",
        detail:
          "Kurang peduli isu lingkungan seperti sampah, air, dan energi karena terasa jauh dari kehidupan sehari-hari.",
      },
      {
        id: "konsumtivisme_tidak_ramah_lingkungan",
        title: "Konsumtivisme dan perilaku tidak ramah lingkungan",
        detail:
          "Sering memakai barang sekali pakai, plastik, atau membuang makanan tanpa banyak dipikir.",
      },
      {
        id: "minim_praktik_cinta_lingkungan",
        title: "Minimnya praktik cinta lingkungan di sekolah",
        detail:
          "Program penghijauan, daur ulang, atau konservasi berjalan sesaat saja, belum jadi kebiasaan.",
      },
      {
        id: "urbanisasi_alienasi_alam",
        title: "Urbanisasi dan alienasi dari alam",
        detail:
          "Jarang berinteraksi dengan alam sehingga merasa jauh dan kurang empati pada kerusakan lingkungan.",
      },
    ],
  },
};

module.exports = { TOPICS };
