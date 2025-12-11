// prompts/optionsPrompt.js

function getOptionsPrompt({ mode, topicLabel, round, previousCount, simpleOptions, selectedProblemsContext }) {

  const readableOptions = simpleOptions.map(o =>
    `• ${o.label}: ${o.description}`
  ).join("\n");

  // Build context from previously selected problems
  let selectedContext = "";
  if (selectedProblemsContext && selectedProblemsContext.length > 0) {
    const lastSelected = selectedProblemsContext[selectedProblemsContext.length - 1];
    const allSelectedLabels = selectedProblemsContext.map(p => p.title).join(", ");
    
    selectedContext = `
Konteks penting - User baru saja memilih: "${lastSelected.title}" (${lastSelected.detail})
${selectedProblemsContext.length > 1 ? `Sebelumnya user juga sudah memilih: ${selectedProblemsContext.slice(0, -1).map(p => p.title).join(", ")}` : ""}

Tugas tambahan:
- Berikan respons empati singkat yang SPESIFIK terhadap pilihan terakhir user ("${lastSelected.title}")
- Tunjukkan bahwa kamu memahami perasaan/kondisi yang mereka alami terkait pilihan tersebut
- Lalu transisi secara natural ke pilihan berikutnya
`;
  }

  return `
Buat satu pesan lanjutan konseling yang terasa natural seperti teman dekat yang mendengarkan dengan tulus.

Aturan penting:
- Ini bukan awal percakapan, jadi jangan memberi salam atau sapaan (contoh: assalamualaikum, hai, halo, hello, selamat pagi/siang/malam).
- Jangan memulai dengan kata: baik, oke, yah, terima kasih, jadi begini, atau kalimat formal lainnya.
- Nada harus seperti teman yang sabar, lembut, dan ingin memahami tanpa menghakimi.
- Maksimal 120 kata.
- Hindari nada formal, daftar kaku, atau kalimat seperti chatbot atau instruksi.
- Jangan gunakan istilah teknis seperti tombol, opsi, atau klik.
${selectedContext}
Konteks pilihan yang tersedia untuk ditawarkan selanjutnya (ubah menjadi narasi, bukan daftar):
${readableOptions}

Tugas:
${selectedProblemsContext && selectedProblemsContext.length > 0 
  ? `- Mulai dengan respons empati singkat yang relevan dengan pilihan terakhir user
- Lalu transisi natural: "Selain itu..." atau "Dan kalau boleh aku tanya lagi..." atau sejenisnya
- Tawarkan pilihan berikutnya dalam alur percakapan alami`
  : `- Ucapkan pilihan-pilihan ini dalam alur percakapan alami, seperti sedang membantu seseorang mengevaluasi perasaannya.`}
- Di akhir, ajukan pertanyaan reflektif lembut seperti:
  "Dari yang aku sebutkan tadi… mana yang juga terasa dekat dengan kondisimu?"

Kembalikan hanya hasil akhirnya, tanpa kata pengantar atau penutup meta.
`.trim();
}

module.exports = { getOptionsPrompt };
