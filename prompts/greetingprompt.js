// prompts/greetingPrompt.js

function getGreetingPrompt() {
  return `
Tuliskan satu pesan pembuka konseling dalam bahasa Indonesia yang lembut, empatik, dan terasa seperti teman yang aman untuk diajak bicara.

Ketentuan:
- MULAI dengan "Assalamualaikum" lalu lanjutkan percakapan tanpa mengulang salam lagi.
- Nada harus nyaman, hangat, tidak menghakimi, dan tidak kaku.
- Hindari kalimat yang terasa formal seperti pidato atau seperti instruksi aplikasi.
- Sampaikan bahwa ini ruang yang aman untuk berbagi tanpa tekanan.
- Sebutkan tiga fokus: Damai dengan Diri, Damai dengan Sosial, Damai dengan Alam — tapi gunakan bahasa natural, bukan daftar bullet.
- Tutup dengan pertanyaan lembut yang mengundang siswa memilih yang paling dekat dengan perasaannya saat ini.
- Maksimal 100 kata.
- Jangan gunakan kata: AI, sistem, platform, atau robot.
- Gunakan satu paragraf, tanpa bullet atau format daftar.

Kembalikan hanya teks final tanpa penjelasan tambahan.
`.trim();
}

module.exports = { getGreetingPrompt };
