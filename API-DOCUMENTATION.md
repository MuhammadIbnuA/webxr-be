# WebXR Konseling AI - API Documentation

## Base URL
```
https://webxr-be.vercel.app
```

## Overview

API untuk aplikasi konseling berbasis WebXR dengan cerita Kiai Ahmad Dahlan. Menggunakan Groq AI untuk generate cerita yang dipersonalisasi dan ElevenLabs untuk Text-to-Speech.

## Flow Aplikasi

```
┌─────────────┐     ┌─────────────────┐     ┌────────────────────┐     ┌─────────┐
│  Greeting   │ ──► │  Identify Topic │ ──► │ Collecting Problem │ ──► │  Story  │
│  (start)    │     │  (pilih topik)  │     │   (3x pilih)       │     │ (cerita)│
└─────────────┘     └─────────────────┘     └────────────────────┘     └─────────┘
```

---

## Endpoints

### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

### 2. Chat (Main Endpoint)

```http
POST /chat
Content-Type: application/json
```

Endpoint utama untuk semua interaksi. State machine yang mengelola flow konseling.

---

## State: Greeting

Memulai sesi konseling baru.

**Request:**
```json
{
  "sessionId": null,
  "state": "greeting",
  "payload": {}
}
```

**Response:**
```json
{
  "sessionId": "uuid-session-id",
  "currentState": "identify_topic",
  "type": "topic_selection",
  "message": "Halo, terima kasih sudah datang...",
  "speechText": "Halo, terima kasih sudah datang...",
  "options": [
    {
      "id": "diri",
      "label": "Damai dengan Diri",
      "description": "Ketenangan batin, penerimaan diri..."
    },
    {
      "id": "sosial",
      "label": "Damai dengan Sosial",
      "description": "Kemampuan hidup rukun..."
    },
    {
      "id": "alam",
      "label": "Damai dengan Alam",
      "description": "Hubungan harmonis dengan lingkungan..."
    }
  ],
  "audio": {
    "enabled": true,
    "mimeType": "audio/mpeg",
    "base64": "//uQxAAA..."
  }
}
```

---

## State: Identify Topic

Memilih topik/area kedamaian.

**Request:**
```json
{
  "sessionId": "uuid-session-id",
  "state": "identify_topic",
  "payload": {
    "topicId": "diri"
  }
}
```

**Topic IDs:**
| ID | Label |
|----|-------|
| `diri` | Damai dengan Diri |
| `sosial` | Damai dengan Sosial |
| `alam` | Damai dengan Alam |

**Response:**
```json
{
  "sessionId": "uuid-session-id",
  "currentState": "collecting_problem",
  "type": "problem_selection",
  "round": 1,
  "message": "Baik, kita akan fokus pada area \"Damai dengan Diri\"...",
  "options": [
    {
      "id": "tekanan_kecemasan_akademik",
      "label": "Tekanan dan kecemasan akademik",
      "description": "Merasa tertekan oleh tugas, nilai..."
    }
    // ... more problems
  ],
  "audio": { ... }
}
```

---

## State: Collecting Problem

Memilih masalah yang relevan (dipanggil 3 kali).

**Request:**
```json
{
  "sessionId": "uuid-session-id",
  "state": "collecting_problem",
  "payload": {
    "problemId": "tekanan_kecemasan_akademik"
  }
}
```

### Problem IDs per Topic

**Topic: Diri**
| ID | Label |
|----|-------|
| `tekanan_kecemasan_akademik` | Tekanan dan kecemasan akademik |
| `krisis_identitas_arah_hidup` | Krisis identitas dan arah hidup |
| `kesehatan_mental_belum_tertangani` | Kesehatan mental yang belum tertangani |
| `paparan_media_sosial` | Paparan media sosial |
| `kehilangan_spiritualitas` | Kehilangan spiritualitas |

**Topic: Sosial**
| ID | Label |
|----|-------|
| `intoleransi_stereotip` | Intoleransi dan stereotip |
| `bullying_perundungan_digital` | Bullying dan perundungan digital |
| `kurang_empati_komunikasi` | Kurangnya empati dan komunikasi sehat |
| `kesenjangan_sosial_ekonomi` | Kesenjangan sosial dan ekonomi |
| `budaya_kompetitif_ego` | Budaya kompetitif dan egosentris |

**Topic: Alam**
| ID | Label |
|----|-------|
| `rendah_kesadaran_ekologis` | Menurunnya kesadaran ekologis |
| `konsumtivisme_tidak_ramah_lingkungan` | Konsumtivisme dan perilaku tidak ramah lingkungan |
| `minim_praktik_cinta_lingkungan` | Minimnya praktik cinta lingkungan di sekolah |
| `urbanisasi_alienasi_alam` | Urbanisasi dan alienasi dari alam |

**Response (Round 1-2):**
```json
{
  "sessionId": "uuid-session-id",
  "currentState": "collecting_problem",
  "type": "problem_selection",
  "round": 2,
  "message": "Terima kasih, aku sudah mencatat...",
  "options": [ /* remaining problems */ ],
  "audio": { ... }
}
```

**Response (Round 3 - Final):**
```json
{
  "sessionId": "uuid-session-id",
  "currentState": "story",
  "type": "story",
  "storyText": "Baik, sekarang silakan Anda duduk dengan nyaman...",
  "speechText": "Baik, sekarang silakan Anda duduk dengan nyaman...",
  "baseStoryMeta": {
    "id": "biola_ikhlas",
    "title": "Biola Kiai Dahlan Memberi Jawaban (Ikhlas)"
  },
  "selectedProblems": [
    {
      "id": "tekanan_kecemasan_akademik",
      "title": "Tekanan dan kecemasan akademik",
      "detail": "Merasa tertekan oleh tugas..."
    }
    // ... 2 more problems
  ],
  "audio": {
    "enabled": true,
    "mimeType": "audio/mpeg",
    "base64": "//uQxAAA..."
  }
}
```

---

## Audio Response

Setiap response menyertakan audio TTS dari ElevenLabs:

```json
{
  "audio": {
    "enabled": true,
    "mimeType": "audio/mpeg",
    "base64": "//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVV..."
  }
}
```

**Cara menggunakan:**
```javascript
const audioSrc = `data:${audio.mimeType};base64,${audio.base64}`;
const audioElement = new Audio(audioSrc);
audioElement.play();
```

---

## Base Stories

Cerita dasar yang digunakan berdasarkan topik:

| Topic | Story ID | Title |
|-------|----------|-------|
| Diri | `biola_ikhlas` | Biola Kiai Dahlan Memberi Jawaban (Ikhlas) |
| Sosial | `budi_utomo` | Belajar dari Budi Utomo (Rendah Hati) |
| Alam | `madrasah_welas_asih` | Mendirikan Madrasah Ibtidaiyah Diniyah (Welas Asih) |

---

## Error Handling

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## State: Restart Session

Restart sesi dengan topik yang sama - kembali ke problem selection.

**Request:**
```json
{
  "sessionId": "uuid-session-id",
  "state": "restart_session",
  "payload": {
    "topicId": "diri"
  }
}
```

**Response:**
```json
{
  "sessionId": "uuid-session-id",
  "currentState": "collecting_problem",
  "type": "problem_selection",
  "round": 1,
  "message": "Baik, mari kita mulai sesi baru dengan topik \"Damai dengan Diri\"...",
  "options": [ /* all problems available again */ ],
  "topicId": "diri",
  "topicLabel": "Damai dengan Diri",
  "audio": { ... }
}
```

---

## Example: Complete Flow

```bash
# 1. Start session
curl -X POST https://webxr-be.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": null, "state": "greeting", "payload": {}}'

# 2. Select topic (use sessionId from response)
curl -X POST https://webxr-be.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123", "state": "identify_topic", "payload": {"topicId": "diri"}}'

# 3. Select problem 1
curl -X POST https://webxr-be.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123", "state": "collecting_problem", "payload": {"problemId": "tekanan_kecemasan_akademik"}}'

# 4. Select problem 2
curl -X POST https://webxr-be.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123", "state": "collecting_problem", "payload": {"problemId": "krisis_identitas_arah_hidup"}}'

# 5. Select problem 3 (will return story)
curl -X POST https://webxr-be.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123", "state": "collecting_problem", "payload": {"problemId": "paparan_media_sosial"}}'

# 6. Restart session (ulangi dengan topik yang sama)
curl -X POST https://webxr-be.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123", "state": "restart_session", "payload": {"topicId": "diri"}}'
```

---

## Environment Variables (Backend)

```env
PORT=3000
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```
