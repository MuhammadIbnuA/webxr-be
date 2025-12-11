// src/services/tts.service.js
const { synthesizeSpeech } = require("../tts");
const { TTS_CONFIG } = require("../config/tts.config");

async function withSpeech(session, messageObj) {
  const speechSource = messageObj.speechText || messageObj.message || messageObj.storyText;
  const provider = (TTS_CONFIG.mode || "elevenlabs").toLowerCase();

  if ((provider === "elevenlabs" || provider === "lmnt" || provider === "lmnt-tts") && speechSource) {
    const opts = {};
    if (provider === "elevenlabs") {
      opts.stability = TTS_CONFIG.elevenlabs?.stability;
      opts.similarity_boost = TTS_CONFIG.elevenlabs?.similarity_boost;
    } else if (provider.startsWith("lmnt")) {
      opts.voice = TTS_CONFIG.lmnt?.voice;
      opts.format = TTS_CONFIG.lmnt?.format || "mp3";
    }

    const audio = await synthesizeSpeech(speechSource || "", provider, opts);

    return {
      ...messageObj,
      sessionId: session.id,
      tts: TTS_CONFIG,
      audio: audio
        ? { enabled: true, mimeType: audio.mimeType, base64: audio.base64 }
        : { enabled: false, mimeType: null, base64: null },
    };
  }

  return {
    ...messageObj,
    sessionId: session.id,
    tts: TTS_CONFIG,
    audio: { enabled: false, mimeType: null, base64: null },
  };
}

module.exports = { withSpeech };
