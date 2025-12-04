// prompts/storyPrompt.js

function getStoryPrompt(baseText, problemsText) {
  return `
Gabungkan kisah dasar berikut dengan kondisi siswa secara halus dan reflektif.

Cerita Dasar:
"""${baseText}"""

Hal-hal yang sedang dialami siswa:
${problemsText}

Instruksi penulisan:
- Gunakan bahasa Indonesia lembut, menenangkan, seperti teman yang bisa dipercaya.
- Hindari tone menggurui, formal, atau seperti ceramah agama. Cerita boleh mengandung makna spiritual, tapi tetap personal dan reflektif.
- Struktur narasi:
  1) Pembukaan relaksasi napas pelan dan ajakan untuk hadir di momen ini.
  2) Masuk ke cerita Kiai Dahlan secara natural.
  3) Hubungkan kisah tadi dengan keadaan siswa, tetapi dengan sangat hati-hati agar terasa relevan, bukan menghakimi.
  4) Tutup dengan afirmasi hangat dan sederhana: percaya diri, penerimaan diri, dan harapan.

- Dilarang memberi salam dalam bagian ini.
- Maksimal ±500 kata.
- Tidak boleh menyebut: "sebagai AI", "sebagai sistem", "kamu harus", atau nada moralistik.
- Tulis seperti seseorang yang ingin menemani, bukan memperbaiki.

Kembalikan hanya teks final yang siap dibacakan.
`.trim();
}

module.exports = { getStoryPrompt };
