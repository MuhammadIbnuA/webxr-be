// tts.js
require("dotenv").config();

// Ambil config dari .env
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Boleh pakai salah satu:
// ELEVENLABS_VOICE_ID_MAIN atau ELEVENLABS_VOICE_ID
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID_MAIN || process.env.ELEVENLABS_VOICE_ID;

const ELEVENLABS_MODEL_ID =
  process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

// Pakai global fetch (Node 18+), kalau nggak ada fallback ke node-fetch
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

/**
 * Generate speech dengan ElevenLabs dan kembalikan base64 MP3
 * @param {string} text
 * @returns {Promise<null | { mimeType: string, base64: string }>}
 */
async function synthesizeSpeech(text) {
  try {
    if (!text || !text.trim()) {
      return null;
    }

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
      console.warn(
        "[TTS] ELEVENLABS_API_KEY atau ELEVENLABS_VOICE_ID(_MAIN) belum di-set. Audio akan disabled."
      );
      return null;
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`;

    const body = {
      text,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: {
        stability: 0.7,        // ✨ nada stabil, cocok buat konseling
        similarity_boost: 0.9, // ✨ jaga karakter voice tetap konsisten
      },
    };

    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const textErr = await res.text().catch(() => "");
      console.error(
        "[TTS] ElevenLabs error:",
        res.status,
        textErr || res.statusText
      );
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return {
      mimeType: "audio/mpeg",
      base64,
    };
  } catch (err) {
    console.error("[TTS] Failed to synthesize speech:", err);
    return null;
  }
}

module.exports = {
  synthesizeSpeech,
};
