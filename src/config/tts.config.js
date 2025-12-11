// src/config/tts.config.js
require("dotenv").config();

const TTS_CONFIG = {
  mode: (process.env.DEFAULT_TTS_MODE || "elevenlabs").toLowerCase(),
  elevenlabs: {
    stability: parseFloat(process.env.ELEVENLABS_STABILITY || "0.7"),
    similarity_boost: parseFloat(process.env.ELEVENLABS_SIMILARITY_BOOST || "0.9"),
  },
  lmnt: {
    voice: process.env.LMNT_VOICE_ID || "",
    format: process.env.LMNT_FORMAT || "mp3",
  },
  webSpeechConfig: {
    lang: "id-ID",
    rate: 0.95,
    pitch: 1.0,
    volume: 1.0,
  },
};

module.exports = { TTS_CONFIG };
