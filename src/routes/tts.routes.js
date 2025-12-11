// src/routes/tts.routes.js
const express = require("express");
const router = express.Router();
const { TTS_CONFIG } = require("../config/tts.config");

router.get("/config", (_, res) => {
  res.json({ success: true, config: TTS_CONFIG });
});

router.post("/config", (req, res) => {
  try {
    const { mode, elevenlabs, lmnt, webSpeechConfig } = req.body || {};
    const allowed = ["elevenlabs", "lmnt", "webspeech", "off"];

    if (!mode || !allowed.includes(mode)) {
      return res.status(400).json({ success: false, message: `mode must be one of ${allowed.join(", ")}` });
    }

    TTS_CONFIG.mode = mode;

    if (elevenlabs && typeof elevenlabs === "object") {
      TTS_CONFIG.elevenlabs = { ...TTS_CONFIG.elevenlabs, ...elevenlabs };
    }
    if (lmnt && typeof lmnt === "object") {
      TTS_CONFIG.lmnt = { ...TTS_CONFIG.lmnt, ...lmnt };
    }
    if (webSpeechConfig && typeof webSpeechConfig === "object") {
      TTS_CONFIG.webSpeechConfig = { ...TTS_CONFIG.webSpeechConfig, ...webSpeechConfig };
    }

    return res.json({ success: true, message: "TTS config updated", config: TTS_CONFIG });
  } catch (err) {
    console.error("Error updating tts config:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
