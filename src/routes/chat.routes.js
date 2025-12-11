// src/routes/chat.routes.js
const express = require("express");
const router = express.Router();
const { getOrCreateSession } = require("../services/session.service");
const { withSpeech } = require("../services/tts.service");
const {
  handleGreeting,
  handleIdentifyTopic,
  handleCollectingProblem,
  handleRestartSession,
} = require("../handlers/state.handlers");

router.post("/", async (req, res) => {
  try {
    const { sessionId, state, payload } = req.body || {};
    const session = getOrCreateSession(sessionId);
    const effectiveState = state || session.state || "greeting";

    let response;
    switch (effectiveState) {
      case "greeting":
        response = await handleGreeting(session);
        break;
      case "identify_topic":
        response = await handleIdentifyTopic(session, payload);
        break;
      case "collecting_problem":
        response = await handleCollectingProblem(session, payload);
        break;
      case "story":
        response = {
          sessionId: session.id,
          currentState: "story",
          message: "Sesi cerita sudah selesai. Jika ingin mulai baru, kirim state 'greeting'.",
          speechText: "Sesi cerita telah selesai. Jika ingin mulai ulang, beri tahu saya.",
        };
        response = await withSpeech(session, response);
        break;
      case "restart_session":
        response = await handleRestartSession(session, payload);
        break;
      default:
        session.state = "greeting";
        response = await handleGreeting(session);
    }

    res.json(response);
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
