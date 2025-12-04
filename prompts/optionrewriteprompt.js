// prompts/optionRewritePrompt.js

/**
 * simpleOptions: array of { id, label, description }
 * mode: "topic" | "problem"
 * topicLabel: string | null
 */
function getOptionRewritePrompt(simpleOptions, { mode, topicLabel }) {
  const readableOptions = simpleOptions
    .map(
      (o) =>
        `- id: ${o.id}\n  judul: ${o.label}\n  penjelasan: ${o.description}`
    )
    .join("\n\n");

  const context =
    mode === "topic"
      ? `Ini adalah daftar area kedamaian yang bisa dipilih sebagai fokus awal sesi.`
      : `Ini adalah daftar hal-hal yang mungkin sedang dialami siswa dalam topik "${topicLabel || ""}".`;

  return `
Kamu diminta membantu merapikan bahasa pilihan yang akan ditampilkan kepada siswa dalam sesi konseling.

Konteks:
${context}

Daftar pilihan mentah:
${readableOptions}

Tugas:
- Untuk setiap item, buat:
  - "label": kalimat singkat yang enak dibaca, hangat, seperti teman yang mengerti.
  - "description": penjelasan singkat yang membuat siswa merasa dipahami, tanpa menghakimi.
- Jangan mengubah makna dasar. Hanya boleh memperhalus bahasa.
- Jangan menambah atau mengurangi jumlah pilihan.
- "id" HARUS tetap sama persis seperti yang diberikan.
- Gaya bahasa:
  - Ramah, lembut, dan tidak terlalu formal.
  - Seperti teman yang peduli, bukan seperti robot atau aplikasi.
  - Jangan memakai kata "AI", "sistem", atau istilah teknis.
- Tulis hasil dalam format JSON murni dengan struktur:
  {
    "options": [
      { "id": "...", "label": "...", "description": "..." },
      ...
    ]
  }

Kembalikan HANYA JSON tersebut, tanpa komentar atau teks tambahan di luar JSON.
`.trim();
}

module.exports = { getOptionRewritePrompt };
