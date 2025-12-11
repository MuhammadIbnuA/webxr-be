// src/routes/health.routes.js
const express = require("express");
const router = express.Router();

router.get("/", (_, res) => {
  res.json({ status: "ok" });
});

module.exports = router;
