// src/routes/session.routes.js
const express = require("express");
const router = express.Router();
const { deleteSession, clearAllSessions, hasSession } = require("../services/session.service");

router.delete("/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId required" });
    }
    if (!hasSession(sessionId)) {
      return res.status(404).json({ success: false, message: "session not found" });
    }
    deleteSession(sessionId);
    return res.json({ success: true, message: "session deleted", sessionId });
  } catch (err) {
    console.error("Error deleting session:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.delete("/", (req, res) => {
  try {
    const { all } = req.query;
    if (all !== "true") {
      return res.status(400).json({ success: false, message: 'use ?all=true to delete all sessions' });
    }
    const count = clearAllSessions();
    return res.json({ success: true, message: `deleted ${count} sessions` });
  } catch (err) {
    console.error("Error deleting all sessions:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
