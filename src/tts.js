// tts.js
require("dotenv").config();

const ENABLE_TTS = process.env.ENABLE_TTS === "false"; // 🔥 switch ON/OFF
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID_MAIN || process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_MODEL_ID =
  process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

let fetchFn = globalThis.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

async function synthesizeSpeech(text) {
  try {
    if (!ENABLE_TTS) {
      console.log("[TTS] Disabled via ENV flag");
      return null;
    }

    if (!text?.trim()) return null;

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
      console.warn("[TTS] Missing key or voice ID. Audio disabled.");
      return null;
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`;

    const body = {
      text,
      model_id: ELEVENLABS_MODEL_ID,
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.9,
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
      console.error("[TTS] ElevenLabs error:", res.status);
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      mimeType: "audio/mpeg",
      base64: buffer.toString("base64"),
    };
  } catch (err) {
    console.error("[TTS] Failed:", err);
    return null;
  }
}

module.exports = { synthesizeSpeech };
