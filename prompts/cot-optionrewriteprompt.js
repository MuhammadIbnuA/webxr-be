// prompts/cot-optionrewriteprompt.js
// Chain of Thought version for option rewriting

/**
 * simpleOptions: array of { id, label, description }
 * mode: "topic" | "problem"
 * topicLabel: string | null
 */
function getCoTOptionRewritePrompt(simpleOptions, { mode, topicLabel }) {
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

CHAIN OF THOUGHT - Ikuti proses berpikir ini:

LANGKAH 1 - PAHAMI KONTEKS EMOSIONAL:
Untuk setiap pilihan, pikirkan:
- Apa perasaan siswa yang mengalami ini? (cemas, bingung, tertekan, malu, dll)
- Bagaimana mereka mungkin menggambarkan kondisi ini dengan kata-kata mereka sendiri?
- Apa yang membuat mereka merasa "dipahami" saat membaca pilihan ini?

LANGKAH 2 - IDENTIFIKASI MASALAH BAHASA:
Cek setiap label dan description:
- Apakah terlalu formal atau kaku?
- Apakah terdengar seperti diagnosis klinis atau istilah teknis?
- Apakah ada kata yang terasa menghakimi atau menyalahkan?
- Apakah terlalu panjang atau bertele-tele?

LANGKAH 3 - TENTUKAN GAYA BAHASA TARGET:
Karakteristik yang diinginkan:
- Seperti teman yang mengerti, bukan konselor formal
- Menggunakan kata-kata sehari-hari siswa
- Empati tanpa menggurui
- Singkat tapi tetap jelas
- Membuat siswa merasa "iya, ini yang aku rasakan"

LANGKAH 4 - REWRITE SETIAP PILIHAN:
Untuk setiap item:
a) Label: Buat kalimat singkat (5-8 kata) yang:
   - Mudah dipahami
   - Terasa personal
   - Tidak menghakimi
   
b) Description: Buat penjelasan (1-2 kalimat) yang:
   - Menggambarkan perasaan/kondisi
   - Membuat siswa merasa dipahami
   - Tidak terlalu teknis

LANGKAH 5 - VALIDASI:
Cek setiap hasil rewrite:
- Apakah ID tetap sama persis?
- Apakah makna dasar tidak berubah?
- Apakah terasa lebih hangat dan natural?
- Apakah bebas dari kata: AI, sistem, robot, aplikasi, platform?
- Apakah jumlah pilihan sama dengan input?

LANGKAH 6 - FORMAT OUTPUT:
Susun dalam JSON dengan struktur:
{
  "options": [
    { "id": "...", "label": "...", "description": "..." },
    ...
  ]
}

OUTPUT AKHIR:
Setelah melalui 6 langkah di atas, kembalikan HANYA JSON hasil rewrite. Jangan sertakan penjelasan proses berpikir.
`.trim();
}

module.exports = { getCoTOptionRewritePrompt };
