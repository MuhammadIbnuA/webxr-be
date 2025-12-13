# Chain of Thought (CoT) Implementation

## 📚 Overview

Chain of Thought (CoT) adalah teknik prompt engineering yang membuat AI berpikir secara bertahap sebelum memberikan respons akhir. Implementasi ini meningkatkan kualitas percakapan konseling dengan:

- **Empati yang lebih dalam**: AI menganalisis konteks emosional sebelum merespons
- **Respons yang lebih natural**: Proses berpikir bertahap menghasilkan bahasa yang lebih mengalir
- **Koneksi yang lebih relevan**: AI memahami hubungan antara cerita dan kondisi siswa
- **Konsistensi tone**: Setiap langkah memastikan tone tetap hangat dan supportif

---

## 🎯 Implementasi CoT pada 4 Fungsi Utama

### 1. **Greeting Generation** (5 Langkah)

**File**: `prompts/cot-greetingprompt.js`

**Proses Berpikir**:
```
LANGKAH 1: Analisis Konteks
- Siapa target audience?
- Apa yang mereka butuhkan?
- Bagaimana menciptakan rasa aman?

LANGKAH 2: Tentukan Elemen Kunci
- Salam pembuka
- Pernyataan ruang aman
- Penjelasan 3 fokus
- Pertanyaan lembut

LANGKAH 3: Pilih Tone & Gaya Bahasa
- Hindari: formal, kaku, seperti robot
- Gunakan: hangat, lembut, seperti teman

LANGKAH 4: Buat Draft Pesan
- Struktur: Salam → Sambutan → Fokus → Pertanyaan

LANGKAH 5: Evaluasi & Perbaiki
- Cek tone, panjang, kata-kata terlarang
```

**Manfaat**:
- Salam terasa lebih personal dan menenangkan
- Tone konsisten hangat dan tidak menghakimi
- Menghindari bahasa teknis/formal

---

### 2. **Options Rewriting** (6 Langkah)

**File**: `prompts/cot-optionrewriteprompt.js`

**Proses Berpikir**:
```
LANGKAH 1: Pahami Konteks Emosional
- Apa perasaan siswa yang mengalami ini?
- Bagaimana mereka menggambarkan kondisi ini?
- Apa yang membuat mereka merasa dipahami?

LANGKAH 2: Identifikasi Masalah Bahasa
- Apakah terlalu formal/kaku?
- Apakah terdengar seperti diagnosis klinis?
- Apakah ada kata yang menghakimi?

LANGKAH 3: Tentukan Gaya Bahasa Target
- Seperti teman yang mengerti
- Kata-kata sehari-hari siswa
- Empati tanpa menggurui

LANGKAH 4: Rewrite Setiap Pilihan
- Label: 5-8 kata, personal, tidak menghakimi
- Description: 1-2 kalimat, validasi perasaan

LANGKAH 5: Validasi
- ID tetap sama?
- Makna tidak berubah?
- Terasa lebih hangat?

LANGKAH 6: Format Output
- Susun dalam JSON
```

**Manfaat**:
- Pilihan terasa lebih relatable untuk siswa
- Bahasa lebih empatis dan tidak menghakimi
- Menghindari jargon psikologi/klinis

---

### 3. **Spoken Options** (5 Langkah)

**File**: `prompts/cot-optionsprompt.js`

**Proses Berpikir**:
```
LANGKAH 1: Analisis Konteks Percakapan
- Apa pilihan terakhir user?
- Apa perasaan yang mereka alami?
- Bagaimana menunjukkan empati SPESIFIK?
- Bagaimana transisi natural?

LANGKAH 2: Tentukan Struktur Pesan
a) Empati spesifik (2-3 kalimat)
   - Validasi perasaan terkait pilihan terakhir
   - Tunjukkan pemahaman mendalam
   
b) Transisi natural (1 kalimat)
   - "Selain itu...", "Dan kalau boleh aku tanya lagi..."
   
c) Penawaran pilihan (narasi)
   - Ubah menjadi kalimat mengalir
   - Tidak seperti menu/form
   
d) Pertanyaan reflektif (1 kalimat)

LANGKAH 3: Pilih Kata & Tone
- Hindari: salam, kata formal, istilah teknis
- Gunakan: bahasa percakapan, empati, transisi halus

LANGKAH 4: Buat Draft Pesan
- Mulai dengan empati spesifik untuk pilihan terakhir
- Transisi ke pilihan berikutnya

LANGKAH 5: Evaluasi & Perbaiki
- Terasa seperti teman, bukan chatbot?
- Empati spesifik dan genuine?
- Maksimal 120 kata?
```

**Manfaat**:
- **Empati kontekstual**: Respons spesifik untuk setiap pilihan user
- Percakapan terasa lebih natural dan mengalir
- User merasa benar-benar didengarkan

**Contoh Output**:
```
Pilihan 1: "Tekanan akademik"
→ AI: "Aku bisa bayangin gimana rasanya... pasti nggak mudah ya 
      kalau setiap hari mikirin nilai dan tugas yang numpuk..."

Pilihan 2: "Krisis identitas"  
→ AI: "Aku ngerti kok... kadang emang berat ya kalau ngerasa 
      belum tahu mau jadi apa atau ke mana arahnya..."
```

---

### 4. **Story Personalization** (8 Langkah)

**File**: `prompts/cot-storyprompt.js`

**Proses Berpikir**:
```
LANGKAH 1: Analisis Cerita Dasar
- Apa nilai utama? (ikhlas, rendah hati, welas asih)
- Apa momen paling menyentuh?
- Bagaimana bisa jadi cermin refleksi?

LANGKAH 2: Analisis Kondisi Siswa
- Apa perasaan inti? (cemas, bingung, tertekan)
- Apa kebutuhan emosional? (validasi, harapan, ketenangan)
- Bagaimana hubungannya dengan nilai cerita?

LANGKAH 3: Temukan Jembatan Makna
- Bagaimana nilai cerita menjawab kebutuhan siswa?
- Apa paralel/kesamaan situasi?
- Bagaimana membuat koneksi terasa natural?

LANGKAH 4: Rancang Struktur Narasi
a) Pembukaan - Relaksasi & Grounding (50-80 kata)
b) Cerita Kiai Dahlan - Narasi Utama (150-200 kata)
c) Refleksi & Koneksi - Hubungkan dengan Siswa (120-150 kata)
d) Penutup - Afirmasi & Harapan (80-100 kata)

LANGKAH 5: Pilih Bahasa & Tone
- Bahasa: Indonesia lembut, puitis tapi tidak berlebihan
- Tone: teman yang bijak, bukan guru/dai
- Hindari: menggurui, ceramah agama

LANGKAH 6: Buat Draft Lengkap
- Tulis narasi lengkap dengan 4 bagian
- Transisi smooth antar bagian

LANGKAH 7: Evaluasi & Polish
- Terasa personal dan relevan?
- Koneksi natural?
- Bebas dari tone menggurui?

LANGKAH 8: Final Check - Empati & Resonansi
- Bayangkan sebagai siswa yang mengalami masalah
- Apakah terasa dipahami?
- Apakah ada momen yang menyentuh?
```

**Manfaat**:
- Cerita lebih relevan dengan kondisi spesifik siswa
- Koneksi antara cerita dan masalah terasa natural
- Narasi lebih menyentuh dan bermakna

---

## 🚀 Cara Menggunakan

### Endpoint Baru: `/chat/cot`

**Original Endpoint**: `/chat` (tanpa CoT)
**CoT Endpoint**: `/chat/cot` (dengan Chain of Thought)

### Request Format (Sama dengan endpoint original)

```json
POST /chat/cot
Content-Type: application/json

{
  "sessionId": "uuid-or-null",
  "state": "greeting",
  "payload": {}
}
```

### Response Format

Response sama dengan endpoint original, dengan tambahan flag `cotEnabled`:

```json
{
  "sessionId": "abc123",
  "currentState": "identify_topic",
  "type": "topic_selection",
  "message": "Assalamualaikum...",
  "options": [...],
  "audio": {...},
  "cotEnabled": true  // ← Flag baru
}
```

---

## 📊 Perbandingan: Original vs CoT

| Aspek | Original | Chain of Thought |
|-------|----------|------------------|
| **Empati** | Generik | Spesifik & kontekstual |
| **Bahasa** | Baik | Lebih natural & mengalir |
| **Koneksi Cerita** | Relevan | Sangat relevan & mendalam |
| **Konsistensi Tone** | Baik | Sangat konsisten |
| **Response Time** | Cepat | Sedikit lebih lambat* |
| **Token Usage** | Standar | Lebih tinggi* |

*Trade-off: CoT menggunakan lebih banyak token dan waktu, tapi menghasilkan kualitas yang lebih baik

---

## 🔧 Konfigurasi

### Groq Model Settings

```javascript
// src/services/ai-cot.service.js
const completion = await groq.chat.completions.create({
  model: GROQ_MODEL, // llama-3.1-70b-versatile
  temperature: 0.7,   // Balance antara creativity & consistency
  max_tokens: 2048,   // Lebih tinggi untuk CoT reasoning
});
```

### System Prompts

Setiap fungsi CoT memiliki system prompt yang menekankan penggunaan Chain of Thought:

```javascript
{
  role: "system",
  content: "Gunakan Chain of Thought untuk berpikir mendalam sebelum merespons."
}
```

---

## 📁 File Structure

```
webxr-be/
├── prompts/
│   ├── cot-greetingprompt.js      # CoT untuk greeting
│   ├── cot-optionrewriteprompt.js # CoT untuk rewrite options
│   ├── cot-optionsprompt.js       # CoT untuk spoken options
│   └── cot-storyprompt.js         # CoT untuk story personalization
├── src/
│   ├── services/
│   │   └── ai-cot.service.js      # AI service dengan CoT
│   ├── handlers/
│   │   └── state-cot.handlers.js  # State handlers dengan CoT
│   └── routes/
│       └── chat-cot.routes.js     # Route untuk CoT endpoint
└── COT-IMPLEMENTATION.md          # Dokumentasi ini
```

---

## 🎓 Best Practices

### 1. **Gunakan CoT untuk Kasus Kompleks**
- Situasi yang membutuhkan empati mendalam
- Personalisasi berdasarkan konteks user
- Koneksi makna yang tidak obvious

### 2. **Monitor Token Usage**
- CoT menggunakan lebih banyak token
- Set `max_tokens` yang cukup (1024-2048)
- Monitor biaya API

### 3. **Temperature Setting**
- 0.7 untuk balance creativity & consistency
- Terlalu rendah (0.3): terlalu kaku
- Terlalu tinggi (0.9): terlalu random

### 4. **Validasi Output**
- Selalu ada fallback ke data original
- Handle JSON parsing errors
- Log errors untuk debugging

---

## 🧪 Testing

### Test Greeting CoT
```bash
curl -X POST http://localhost:3000/chat/cot \
  -H "Content-Type: application/json" \
  -d '{"sessionId": null, "state": "greeting", "payload": {}}'
```

### Test Problem Selection dengan Empati Kontekstual
```bash
# Pilih problem pertama
curl -X POST http://localhost:3000/chat/cot \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "state": "collecting_problem",
    "payload": {"problemId": "tekanan_kecemasan_akademik"}
  }'

# Pilih problem kedua - perhatikan empati spesifik untuk pilihan pertama
curl -X POST http://localhost:3000/chat/cot \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "state": "collecting_problem",
    "payload": {"problemId": "krisis_identitas_arah_hidup"}
  }'
```

---

## 🔮 Future Improvements

1. **Self-Consistency CoT**: Generate multiple reasoning paths dan pilih yang paling konsisten
2. **Few-Shot CoT**: Tambahkan contoh reasoning yang baik di prompt
3. **Adaptive CoT**: Gunakan CoT hanya untuk kasus yang membutuhkan
4. **CoT Caching**: Cache hasil reasoning untuk pattern yang sama
5. **Metrics & Analytics**: Track kualitas respons CoT vs non-CoT

---

## 📖 References

- [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)
- [Large Language Models are Zero-Shot Reasoners](https://arxiv.org/abs/2205.11916)
- [Self-Consistency Improves Chain of Thought Reasoning](https://arxiv.org/abs/2203.11171)

---

**Created**: 2025-12-14  
**Version**: 1.0.0  
**Author**: WebXR Konseling AI Team
