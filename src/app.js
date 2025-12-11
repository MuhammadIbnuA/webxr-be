// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Routes
const healthRoutes = require("./routes/health.routes");
const ttsRoutes = require("./routes/tts.routes");
const sessionRoutes = require("./routes/session.routes");
const chatRoutes = require("./routes/chat.routes");

// Init
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/tts", ttsRoutes);
app.use("/sessions", sessionRoutes);
app.use("/chat", chatRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Konseling AI backend listening on port ${PORT}`);
});
