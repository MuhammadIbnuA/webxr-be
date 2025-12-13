// src/routes/chat-cot.routes.js
// Chat routes using Chain of Thought handlers

const express = require("express");
const router = express.Router();
const { getOrCreateSession } = require("../services/session.service");
const { withSpeech } = require("../services/tts.service");
const {
    handleGreetingCoT,
    handleIdentifyTopicCoT,
    handleCollectingProblemCoT,
    handleRestartSessionCoT,
} = require("../handlers/state-cot.handlers");

/**
 * POST /chat/cot
 * Main chat endpoint with Chain of Thought reasoning
 * 
 * Benefits of CoT:
 * - More empathetic and context-aware responses
 * - Better understanding of emotional nuances
 * - More natural conversation flow
 * - Specific empathy based on user's previous choices
 */
router.post("/", async (req, res) => {
    try {
        const { sessionId, state, payload } = req.body || {};
        const session = getOrCreateSession(sessionId);
        const effectiveState = state || session.state || "greeting";

        let response;
        switch (effectiveState) {
            case "greeting":
                response = await handleGreetingCoT(session);
                break;
            case "identify_topic":
                response = await handleIdentifyTopicCoT(session, payload);
                break;
            case "collecting_problem":
                response = await handleCollectingProblemCoT(session, payload);
                break;
            case "story":
                response = {
                    sessionId: session.id,
                    currentState: "story",
                    message: "Sesi cerita sudah selesai. Jika ingin mulai baru, kirim state 'greeting'.",
                    speechText: "Sesi cerita telah selesai. Jika ingin mulai ulang, beri tahu saya.",
                    cotEnabled: true,
                };
                response = await withSpeech(session, response);
                break;
            case "restart_session":
                response = await handleRestartSessionCoT(session, payload);
                break;
            default:
                session.state = "greeting";
                response = await handleGreetingCoT(session);
        }

        res.json(response);
    } catch (err) {
        console.error("Error in /chat/cot:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
