// src/groqClient.js

require("dotenv").config();
const fetch = require("node-fetch"); // pastikan sudah ter-install

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.1-70b-versatile"; // sesuaikan dengan model yang kamu pakai

if (!GROQ_API_KEY) {
  console.warn(
    "[WARN] GROQ_API_KEY belum di-set. Pastikan sudah diisi di file .env"
  );
}

/**
 * Memanggil Groq Chat Completion dan mengembalikan hasil dalam bentuk JSON.
 * Ekspektasi: model mengembalikan teks JSON di message.content.
 */
async function generateJsonCompletion(messages) {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const body = {
    model: GROQ_MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1024
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Groq API error:", resp.status, errText);
    throw new Error(`Groq API error: ${resp.status}`);
  }

  const data = await resp.json();
  const choice = data.choices && data.choices[0];
  if (!choice || !choice.message || !choice.message.content) {
    throw new Error("Groq response tidak memiliki content");
  }

  const content = choice.message.content.trim();

  // Coba parsing JSON dari konten (kadang ada text di luar kurung kurawal, jadi kita ambil substring { ... } )
  let parsed;
  try {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonString =
      start !== -1 && end !== -1 ? content.slice(start, end + 1) : content;
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("Gagal parse JSON dari Groq:", content);
    throw err;
  }

  return parsed;
}

module.exports = { generateJsonCompletion };
