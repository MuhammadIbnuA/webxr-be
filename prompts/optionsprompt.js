// prompts/optionsPrompt.js

function getOptionsPrompt({ mode, topicLabel, round, previousCount, simpleOptions }) {

  const readableOptions = simpleOptions.map(o =>
    `• ${o.label}: ${o.description}`
  ).join("\n");

  return `
Buat satu pesan lanjutan konseling yang terasa natural seperti teman dekat yang mendengarkan dengan tulus.

Aturan penting:
- Ini bukan awal percakapan, jadi jangan memberi salam atau sapaan (contoh: assalamualaikum, hai, halo, hello, selamat pagi/siang/malam).
- Jangan memulai dengan kata: baik, oke, yah, terima kasih, jadi begini, atau kalimat formal lainnya.
- Nada harus seperti teman yang sabar, lembut, dan ingin memahami tanpa menghakimi.
- Maksimal 100 kata.
- Hindari nada formal, daftar kaku, atau kalimat seperti chatbot atau instruksi.
- Jangan gunakan istilah teknis seperti tombol, opsi, atau klik.

Konteks pilihan yang tersedia (ubah menjadi narasi, bukan daftar):
${readableOptions}

Tugas:
- Ucapkan pilihan-pilihan ini dalam alur percakapan alami, seperti sedang membantu seseorang mengevaluasi perasaannya.
- Di akhir, ajukan pertanyaan reflektif lembut seperti:
  "Kalau kamu perhatikan keadaanmu akhir-akhir ini… yang mana yang terasa paling dekat?"

Kembalikan hanya hasil akhirnya, tanpa kata pengantar atau penutup meta.
`.trim();
}

module.exports = { getOptionsPrompt };
