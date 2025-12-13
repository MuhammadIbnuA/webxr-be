// prompts/cot-storyprompt.js
// Chain of Thought version for personalized story generation

function getCoTStoryPrompt(baseText, problemsText) {
    return `
Gabungkan kisah dasar Kiai Ahmad Dahlan dengan kondisi siswa secara halus dan reflektif.

Cerita Dasar:
"""${baseText}"""

Hal-hal yang sedang dialami siswa:
${problemsText}

CHAIN OF THOUGHT - Ikuti proses berpikir mendalam ini:

LANGKAH 1 - ANALISIS CERITA DASAR:
Pahami esensi cerita Kiai Dahlan:
- Apa nilai utama yang diajarkan? (ikhlas, rendah hati, welas asih, dll)
- Apa momen paling menyentuh dalam cerita?
- Bagaimana cerita ini bisa menjadi cermin untuk refleksi diri?
- Apa pesan universal yang bisa diambil?

LANGKAH 2 - ANALISIS KONDISI SISWA:
Untuk setiap masalah yang dipilih siswa:
- Apa perasaan inti yang mereka alami? (cemas, bingung, tertekan, kesepian, dll)
- Apa kebutuhan emosional mereka? (validasi, harapan, ketenangan, dll)
- Bagaimana kondisi ini berhubungan dengan nilai dalam cerita Kiai Dahlan?
- Apa yang mereka butuhkan untuk merasa lebih baik?

LANGKAH 3 - TEMUKAN JEMBATAN MAKNA:
Identifikasi koneksi antara cerita dan kondisi siswa:
- Bagaimana nilai dalam cerita Kiai Dahlan bisa menjawab kebutuhan emosional siswa?
- Apa paralel atau kesamaan situasi yang bisa ditarik?
- Bagaimana membuat koneksi terasa natural, bukan dipaksakan?
- Hindari: menggurui, moralistik, "kamu harus..."

LANGKAH 4 - RANCANG STRUKTUR NARASI:
Susun alur cerita dengan 4 bagian:

a) PEMBUKAAN - Relaksasi & Grounding (50-80 kata):
   - Ajak napas pelan dan hadir di momen ini
   - Ciptakan suasana aman dan tenang
   - Gunakan imagery yang menenangkan
   - Tone: lembut, seperti guided meditation

b) CERITA KIAI DAHLAN - Narasi Utama (150-200 kata):
   - Ceritakan kisah dengan bahasa yang mengalir
   - Gunakan detail sensorik (suara biola, cahaya sore, dll)
   - Buat pembaca bisa "merasakan" momen tersebut
   - Sampaikan nilai tanpa eksplisit menggurui

c) REFLEKSI & KONEKSI - Hubungkan dengan Siswa (120-150 kata):
   - Tarik paralel dengan kondisi siswa secara HALUS
   - Gunakan frasa: "Mungkin kamu juga...", "Seperti halnya...", "Kadang kita juga..."
   - Validasi perasaan mereka
   - Tunjukkan bahwa kondisi mereka dipahami
   - Jangan menyebut masalah secara eksplisit/kasar

d) PENUTUP - Afirmasi & Harapan (80-100 kata):
   - Berikan afirmasi positif yang realistis
   - Tawarkan perspektif baru atau harapan
   - Tutup dengan napas dan ketenangan
   - Tone: hangat, supportif, memberdayakan

LANGKAH 5 - PILIH BAHASA & TONE:
Karakteristik penulisan:
- Bahasa: Indonesia lembut, puitis tapi tidak berlebihan
- Tone: seperti teman yang bijak, bukan guru atau dai
- Hindari: "sebagai AI", "kamu harus", nada menggurui, ceramah agama
- Gunakan: "mungkin", "kadang", "seperti", bahasa yang membuka ruang
- Panjang total: ±500 kata (bisa sedikit lebih/kurang)

LANGKAH 6 - BUAT DRAFT LENGKAP:
Tulis narasi lengkap dengan 4 bagian di atas:
- Pastikan transisi antar bagian smooth
- Jaga konsistensi tone dari awal hingga akhir
- Buat pembaca merasa "ditemani", bukan "diperbaiki"

LANGKAH 7 - EVALUASI & POLISH:
Cek seluruh narasi:
- Apakah terasa personal dan relevan dengan kondisi siswa?
- Apakah koneksi antara cerita dan kondisi siswa terasa natural?
- Apakah bebas dari tone menggurui atau moralistik?
- Apakah ada salam di dalam narasi? (TIDAK BOLEH)
- Apakah panjangnya sekitar 500 kata?
- Apakah terasa seperti teman yang menemani, bukan memperbaiki?

LANGKAH 8 - FINAL CHECK - Empati & Resonansi:
Bayangkan kamu adalah siswa yang mengalami masalah tersebut:
- Apakah cerita ini membuat kamu merasa dipahami?
- Apakah ada momen yang menyentuh atau memberi perspektif baru?
- Apakah kamu merasa lebih tenang setelah mendengar ini?
- Apakah ada bagian yang terasa menghakimi atau tidak sensitif?

OUTPUT AKHIR:
Setelah melalui 8 langkah mendalam di atas, tuliskan HANYA teks narasi final yang siap dibacakan. Jangan sertakan penjelasan proses berpikir atau langkah-langkahnya.
`.trim();
}

module.exports = { getCoTStoryPrompt };
