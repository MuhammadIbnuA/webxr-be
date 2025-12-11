// tts.js
require("dotenv").config();

let fetchFn = globalThis.fetch;
if (!fetchFn) {
  // node <18 fallback
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID_MAIN;
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

const LMNT_API_KEY = process.env.LMNT_API_KEY;
const LMNT_TTS_URL = process.env.LMNT_TTS_URL; // e.g. https://api.lmnt.example/v1/tts or custom endpoint
const LMNT_VOICE_ID = process.env.LMNT_VOICE_ID || "";

const ENABLE_TTS_ENV = (process.env.ENABLE_TTS || "true").toLowerCase() === "true";

/**
 * Synthesize speech for given text using the chosen provider.
 * provider: 'elevenlabs' | 'lmnt' | 'off'
 * opts: provider-specific options (stability, similarity_boost, format, etc)
 * Returns: { mimeType, base64 } or null on failure / disabled
 */
async function synthesizeSpeech(text = "", provider = "elevenlabs", opts = {}) {
  if (!ENABLE_TTS_ENV) {
    console.log("[TTS] disabled by ENABLE_TTS env flag");
    return null;
  }

  if (!text || !text.trim()) return null;

  provider = (provider || "elevenlabs").toLowerCase();

  try {
    switch (provider) {
      case "elevenlabs":
        return await synthesizeElevenLabs(text, opts);
      case "lmnt":
      case "lmnt-tts":
        return await synthesizeLmnt(text, opts);
      case "off":
        return null;
      default:
        console.warn("[TTS] unknown provider:", provider);
        return null;
    }
  } catch (err) {
    console.error("[TTS] synthesizeSpeech error:", err);
    return null;
  }
}

/* -------------------------------
   ELEVENLABS Implementation
   ------------------------------- */
async function synthesizeElevenLabs(text, opts = {}) {
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    console.warn("[ElevenLabs] Missing API key or voice ID.");
    return null;
  }

  const stability = typeof opts.stability === "number" ? opts.stability : 0.7;
  const similarity_boost = typeof opts.similarity_boost === "number" ? opts.similarity_boost : 0.9;
  const model_id = opts.model_id || ELEVENLABS_MODEL_ID;
  // ElevenLabs endpoint (official) - using v1 voice synth route
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

  const body = {
    text,
    model_id,
    voice_settings: {
      stability,
      similarity_boost,
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
    const t = await res.text().catch(() => "");
    console.error("[ElevenLabs] TTS request failed:", res.status, t);
    return null;
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    mimeType: "audio/mpeg",
    base64: buffer.toString("base64"),
  };
}

/* -------------------------------
   LMNT Implementation (generic)
   - Uses LMNT_TTS_URL and LMNT_API_KEY from .env
   - LMNT endpoint formats vary; this sends a common JSON body:
     { text, voice, format }
   - If your LMNT provider requires a different shape adjust here.
   ------------------------------- */
async function synthesizeLmnt(text, opts = {}) {
  if (!LMNT_API_KEY || !LMNT_TTS_URL) {
    console.warn("[LMNT] LMNT_API_KEY or LMNT_TTS_URL not set in .env");
    return null;
  }

  // Default: ask for mp3; if LMNT expects wav/ogg, change via opts.format
  const format = opts.format || "mp3";
  const voice = "elowen"; // ✨ Set voice to "elowen"

  // Construct payload with text, voice, and language
  const body = {
    text,
    voice,
    format,
    language: "id", // ✨ Add language property
  };

  const res = await fetchFn(LMNT_TTS_URL, {
    method: "POST",
    headers: {
      "X-API-Key": LMNT_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[LMNT] TTS request failed:", res.status, t);
    return null;
  }

  // Assume LMNT returns binary audio (arraybuffer) or JSON with base64.
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (data?.audio && typeof data.audio === "string") {
      return {
        mimeType: data?.mime || "audio/mpeg",
        base64: data.audio,
      };
    }
    if (data?.base64 && typeof data.base64 === "string") {
      return {
        mimeType: data?.mime || "audio/mpeg",
        base64: data.base64,
      };
    }
    if (data?.result && typeof data.result === "string") {
      return {
        mimeType: data?.mime || "audio/mpeg",
        base64: data.result,
      };
    }
    console.error("[LMNT] Unexpected JSON response format from LMNT TTS.");
    return null;
  } else {
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = format === "wav" ? "audio/wav" : "audio/mpeg";
    return {
      mimeType: mime,
      base64: buffer.toString("base64"),
    };
  }
}

/* -------------------------------
   Exports
   ------------------------------- */
module.exports = {
  synthesizeSpeech,
  // also export provider helpers in case you want direct use
  synthesizeElevenLabs,
  synthesizeLmnt,
};
