// prompts/cot-optionsprompt.js
// Chain of Thought version for spoken options prompt

function getCoTOptionsPrompt({ mode, topicLabel, round, previousCount, simpleOptions, selectedProblemsContext }) {

    const readableOptions = simpleOptions.map(o =>
        `• ${o.label}: ${o.description}`
    ).join("\n");

    // Build context from previously selected problems
    let selectedContext = "";
    let lastSelectedTitle = "";
    let lastSelectedDetail = "";

    if (selectedProblemsContext && selectedProblemsContext.length > 0) {
        const lastSelected = selectedProblemsContext[selectedProblemsContext.length - 1];
        lastSelectedTitle = lastSelected.title;
        lastSelectedDetail = lastSelected.detail;
        const allSelectedLabels = selectedProblemsContext.map(p => p.title).join(", ");

        selectedContext = `
KONTEKS PENTING - Pilihan sebelumnya:
User baru saja memilih: "${lastSelected.title}"
Detail kondisi: ${lastSelected.detail}
${selectedProblemsContext.length > 1 ? `Sebelumnya juga memilih: ${selectedProblemsContext.slice(0, -1).map(p => p.title).join(", ")}` : ""}
`;
    }

    return `
Buat pesan lanjutan konseling yang terasa natural seperti teman dekat yang mendengarkan dengan tulus.

${selectedContext}

Pilihan yang tersedia untuk ditawarkan selanjutnya:
${readableOptions}

CHAIN OF THOUGHT - Ikuti proses berpikir ini:

LANGKAH 1 - ANALISIS KONTEKS PERCAKAPAN:
${selectedProblemsContext && selectedProblemsContext.length > 0 ? `
Pikirkan tentang pilihan terakhir user: "${lastSelectedTitle}"
- Apa perasaan yang mungkin mereka alami terkait ini?
- Bagaimana cara menunjukkan empati yang SPESIFIK (bukan generik)?
- Kata-kata apa yang akan membuat mereka merasa "iya, dia ngerti aku"?
- Bagaimana transisi natural ke pilihan berikutnya?
` : `
Ini adalah awal pemilihan:
- Bagaimana membuat user merasa nyaman untuk berbagi?
- Bagaimana menyampaikan pilihan tanpa terasa seperti kuesioner?
- Bagaimana membuat percakapan terasa mengalir?
`}

LANGKAH 2 - TENTUKAN STRUKTUR PESAN:
${selectedProblemsContext && selectedProblemsContext.length > 0 ? `
Struktur yang dibutuhkan:
a) Empati spesifik (2-3 kalimat):
   - Validasi perasaan mereka terkait "${lastSelectedTitle}"
   - Tunjukkan pemahaman mendalam tentang kondisi tersebut
   - Gunakan kata-kata yang resonan dengan pengalaman mereka

b) Transisi natural (1 kalimat):
   - Gunakan: "Selain itu...", "Dan kalau boleh aku tanya lagi...", "Aku juga penasaran..."
   - Jangan gunakan: "Baik", "Oke", "Terima kasih", "Jadi"

c) Penawaran pilihan (narasi, bukan daftar):
   - Ubah pilihan menjadi kalimat mengalir
   - Seperti sedang menceritakan kemungkinan-kemungkinan
   - Tidak terasa seperti menu atau form
` : `
Struktur yang dibutuhkan:
a) Pembukaan lembut (1-2 kalimat):
   - Tidak pakai salam atau sapaan
   - Langsung masuk ke konteks
   
b) Penawaran pilihan (narasi):
   - Sampaikan pilihan dalam alur cerita
   - Seperti sedang membantu evaluasi perasaan
`}

d) Pertanyaan reflektif (1 kalimat):
   - Ajukan dengan lembut
   - Contoh: "Dari yang aku sebutkan tadi… mana yang juga terasa dekat dengan kondisimu?"

LANGKAH 3 - PILIH KATA & TONE:
Karakteristik bahasa:
- HINDARI: salam (hai, halo, assalamualaikum), kata formal (baik, oke, terima kasih), istilah teknis (tombol, opsi, klik)
- GUNAKAN: bahasa percakapan natural, kata-kata empati, transisi halus
- TONE: seperti teman yang sabar, bukan chatbot atau konselor formal
- PANJANG: maksimal 120 kata

LANGKAH 4 - BUAT DRAFT PESAN:
${selectedProblemsContext && selectedProblemsContext.length > 0 ? `
Mulai dengan empati spesifik untuk "${lastSelectedTitle}":
- Pikirkan: Jika teman kamu bilang mengalami ini, apa respons natural kamu?
- Contoh tone: "Aku bisa bayangin gimana rasanya...", "Pasti nggak mudah ya...", "Itu berat banget..."

Lalu transisi ke pilihan berikutnya dengan natural.
` : `
Mulai langsung dengan konteks, lalu sampaikan pilihan dalam narasi yang mengalir.
`}

LANGKAH 5 - EVALUASI & PERBAIKI:
Cek draft:
- Apakah terasa seperti percakapan teman, bukan chatbot?
- Apakah empati terasa spesifik dan genuine (jika ada pilihan sebelumnya)?
- Apakah bebas dari kata-kata yang dilarang?
- Apakah maksimal 120 kata?
- Apakah mengalir natural tanpa terasa kaku?

OUTPUT AKHIR:
Setelah melalui 5 langkah di atas, tuliskan HANYA pesan final yang siap digunakan. Jangan sertakan penjelasan proses berpikir.
`.trim();
}

module.exports = { getCoTOptionsPrompt };
