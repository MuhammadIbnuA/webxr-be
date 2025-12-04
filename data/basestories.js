// data/baseStories.js

const BASE_STORIES = {
  biola_ikhlas: {
    id: "biola_ikhlas",
    title: "Biola Kiai Dahlan Memberi Jawaban (Ikhlas)",
    text: `
Biola Kiai Dahlan digunakan untuk menjawab pertanyaan muridnya tentang hakikat beragama. Dengan menggesek biola dan memainkan tembang Asmaradhana yang lembut, para santri merasakan keindahan, ketenangan, dan seolah beban mereka menghilang. Dari situ, Kiai Dahlan menjelaskan bahwa orang yang beragama dengan benar adalah orang yang merasakan kedamaian, mengayomi, dan menyelimuti sekitarnya.

Ketika para santri mencoba menggesek biola sendiri, suara yang keluar menjadi menderit dan tidak nyaman didengar. Kiai Dahlan menganalogikan orang yang beragama tanpa ilmu dan keikhlasan sebagai orang yang memainkan biola tanpa belajar: alih-alih membawa ketenangan, justru menimbulkan ketidaknyamanan bagi diri dan lingkungan. Kisah ini menekankan pentingnya keikhlasan dan kesungguhan dalam belajar agama dan merawat kedamaian batin.
    `.trim(),
  },
  budi_utomo: {
    id: "budi_utomo",
    title: "Belajar dari Budi Utomo (Rendah Hati)",
    text: `
Matahari sore di Kauman menjadi latar ketika Kiai Dahlan mendatangi langgar kidul. Di sana, Sudja bercerita bahwa beberapa santri dilarang keluarganya mengaji karena tidak setuju Kiai Dahlan bergabung dengan Budi Utomo dan memakai jas serta sepatu seperti orang Belanda. Mereka menilai organisasi itu terlalu dekat dengan budaya menari, bernyanyi, dan minum alkohol.

Kiai Dahlan menjelaskan bahwa ia bergabung untuk belajar cara membangun organisasi yang bisa bermanfaat bagi umat. Ia menegaskan pentingnya hati yang terbuka, sesuai makna wahyu pertama “Iqra” – bacalah, telitilah, pelajarilah. Kerendahan hati untuk belajar dari berbagai sumber menjadi kunci untuk memperbaiki kehidupan umat, tanpa kehilangan prinsip dan nilai Islam.
    `.trim(),
  },
  madrasah_welas_asih: {
    id: "madrasah_welas_asih",
    title: "Mendirikan Madrasah Ibtidaiyah Diniyah (Welas Asih)",
    text: `
Di rumahnya, Kiai Dahlan menata tiga pasang meja dan kursi serta memasang papan tulis dari kayu suren. Ia berniat mendirikan Madrasah Ibtidaiyah Diniyah. Murid-murid mempertanyakan langkah ini karena madrasah dianggap seharusnya seperti pesantren tradisional tanpa meja kursi, dan penggunaan meja kursi dikaitkan dengan sekolah Belanda.

Alih-alih berdebat panjang, Kiai Dahlan mengajak murid-murid mencari anak-anak yang belum bersekolah untuk diajak belajar. Tindakan ini menunjukkan welas asih dan keberanian berinovasi demi mencerdaskan mereka yang tertinggal. Madrasah dengan meja dan kursi bukan sekadar meniru, melainkan sarana baru untuk menebar kasih sayang dan ilmu.
    `.trim(),
  },
};

function pickBaseStoryForTopic(topicId) {
  switch (topicId) {
    case "diri":
      return BASE_STORIES.biola_ikhlas;
    case "sosial":
      return BASE_STORIES.budi_utomo;
    case "alam":
      return BASE_STORIES.madrasah_welas_asih;
    default:
      return BASE_STORIES.biola_ikhlas;
  }
}

module.exports = { BASE_STORIES, pickBaseStoryForTopic };
