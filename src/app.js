// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Groq = require("groq-sdk");
const { synthesizeSpeech } = require("./tts");

// PROMPTS
const { getGreetingPrompt } = require("../prompts/greetingprompt");
const { getOptionsPrompt } = require("../prompts/optionsprompt");
const { getStoryPrompt } = require("../prompts/storyprompt");
const { getOptionRewritePrompt } = require("../prompts/optionrewriteprompt");

// DATA
const { TOPICS } = require("../data/topics");
const { pickBaseStoryForTopic } = require("../data/basestories");

// ====== INIT ======
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====== GROQ CLIENT ======
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

// ====== GLOBAL TTS CONFIG (ADMIN-LEVEL) ======
/**
 * mode:
 *  - "elevenlabs" → backend generate audio via ElevenLabs (tts.js)
 *  - "webspeech"  → backend hanya kirim text, frontend pakai Web Speech API
 *  - "off"        → tidak ada audio, hanya text
 */
let TTS_CONFIG = {
  mode: process.env.DEFAULT_TTS_MODE || "elevenlabs",
  webSpeechConfig: {
    lang: "id-ID",
    rate: 0.95,
    pitch: 1.0,
    volume: 1.0,
  },
};

// ====== SESSION STORE ======
/**
 * session: {
 *   id: string
 *   state: 'greeting' | 'identify_topic' | 'collecting_problem' | 'story'
 *   topicId: 'diri' | 'sosial' | 'alam' | null
 *   selectedProblems: string[]
 * }
 */
const sessions = new Map();

function createSessionId() {
  return crypto.randomUUID();
}

function getOrCreateSession(sessionIdFromClient) {
  if (sessionIdFromClient && sessions.has(sessionIdFromClient)) {
    return sessions.get(sessionIdFromClient);
  }
  const id = sessionIdFromClient || createSessionId();
  const session = {
    id,
    state: "greeting",
    topicId: null,
    selectedProblems: [],
  };
  sessions.set(id, session);
  return session;
}

// ====== HELPERS: TTS WRAPPER (PAKAI GLOBAL CONFIG) ======

async function withSpeech(session, messageObj) {
  const speechSource =
    messageObj.speechText || messageObj.message || messageObj.storyText;

  const mode = TTS_CONFIG.mode || "elevenlabs";

  // Mode ELEVENLABS → backend generate audio
  if (mode === "elevenlabs" && speechSource) {
    const audio = await synthesizeSpeech(speechSource || "");

    return {
      ...messageObj,
      sessionId: session.id,
      tts: TTS_CONFIG,
      audio: audio
        ? {
            enabled: true,
            mimeType: audio.mimeType,
            base64: audio.base64,
          }
        : {
            enabled: false,
            mimeType: null,
            base64: null,
          },
    };
  }

  // Mode WEBSPEECH atau OFF → backend tidak generate audio
  return {
    ...messageObj,
    sessionId: session.id,
    tts: TTS_CONFIG,
    audio: {
      enabled: false,
      mimeType: null,
      base64: null,
    },
  };
}

// ====== HELPERS: OPTIONS ======

function topicToOptions() {
  return Object.values(TOPICS).map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
  }));
}

function buildProblemOptions(topicId, alreadySelected) {
  const topic = TOPICS[topicId];
  if (!topic) return [];

  return topic.problems
    .filter((p) => !alreadySelected.includes(p.id))
    .map((p) => ({
      id: p.id,
      label: p.title,
      description: p.detail,
    }));
}

// AI rewrite untuk teks opsi (label & description) tapi ID tetap sama
async function rewriteOptionsWithAI(simpleOptions, { mode, topic }) {
  try {
    const prompt = getOptionRewritePrompt(simpleOptions, {
      mode,
      topicLabel: topic?.label || null,
    });

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Gunakan bahasa Indonesia yang hangat, lembut, dan terasa seperti teman yang peduli.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) return simpleOptions;

    const fenced = raw.match(/```json([\s\S]*?)```/i);
    if (fenced) {
      raw = fenced[1].trim();
    }

    const parsed = JSON.parse(raw);
    const aiOptions = Array.isArray(parsed?.options)
      ? parsed.options
      : Array.isArray(parsed)
      ? parsed
      : [];

    if (!aiOptions.length) return simpleOptions;

    const byId = Object.fromEntries(simpleOptions.map((o) => [o.id, o]));

    return aiOptions
      .map((o) => {
        const base = byId[o.id];
        if (!base) return null;
        return {
          id: base.id,
          label: o.label || base.label,
          description: o.description || base.description,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("[rewriteOptionsWithAI] gagal parse:", err);
    return simpleOptions;
  }
}

// ====== HELPERS: STORY ======

async function buildPersonalizedStory({ topicId, selectedProblems }) {
  const baseStory = pickBaseStoryForTopic(topicId);

  const problemsText = selectedProblems
    .map((p) => {
      const topic = TOPICS[topicId];
      if (!topic) return null;
      const problem = topic.problems.find((pr) => pr.id === p);
      if (!problem) return null;
      return `- ${problem.title}: ${problem.detail}`;
    })
    .filter(Boolean)
    .join("\n");

  const prompt = getStoryPrompt(baseStory.text, problemsText);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Gunakan bahasa Indonesia yang lembut dan empatik, seperti teman yang menemani proses refleksi.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const storyText =
    completion.choices?.[0]?.message?.content?.trim() ||
    baseStory.text ||
    "Maaf, cerita belum bisa dibuat saat ini.";

  return {
    baseStory,
    storyText,
  };
}

// ====== HELPERS: SPOKEN OPTIONS TEXT ======

async function buildSpokenOptionsPrompt({
  mode,
  topic,
  round,
  options,
  previousCount,
}) {
  const simpleOptions = options.map((o) => ({
    id: o.id,
    label: o.label,
    description: o.description,
  }));

  const prompt = getOptionsPrompt({
    mode,
    topicLabel: topic?.label || null,
    round,
    previousCount: previousCount || 0,
    simpleOptions,
  });

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Gunakan bahasa Indonesia yang hangat dan reflektif, seperti teman yang mendengarkan dengan tulus.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  let text =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Coba perhatikan lagi beberapa hal yang tadi muncul, lalu pilih mana yang paling terasa dekat dengan keadaanmu sekarang.";

  // Safety: hilangkan salam kalau ada
  text = text
    .replace(
      /^(assalamualaikum[^\w]*|halo[^\w]*|hai[^\w]*|hello[^\w]*|selamat\s+(pagi|siang|sore|malam)[^\w]*)/i,
      ""
    )
    .trim();

  return text;
}

// ====== STATE HANDLERS ======

async function handleGreeting(session) {
  session.state = "identify_topic";
  session.topicId = null;
  session.selectedProblems = [];

  const prompt = getGreetingPrompt();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Gunakan bahasa Indonesia yang lembut, Islami, dan empatik, seperti konselor yang membuat siswa merasa aman.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const greetingMessage =
    completion.choices?.[0]?.message?.content?.trim() ||
    "Assalamualaikum, terima kasih sudah datang. Di sini kamu bisa berbagi cerita dengan tenang. Ada tiga hal yang bisa jadi fokus: damai dengan diri, damai dengan sosial, dan damai dengan alam. Kalau kamu perhatikan perasaanmu akhir-akhir ini, kira-kira yang mana yang paling dekat denganmu?";

  const baseOptions = topicToOptions();
  const aiOptions = await rewriteOptionsWithAI(baseOptions, {
    mode: "topic",
    topic: null,
  });

  const message = {
    currentState: "identify_topic",
    type: "topic_selection",
    message: greetingMessage,
    speechText: greetingMessage,
    options: aiOptions,
  };

  return withSpeech(session, message);
}

async function handleIdentifyTopic(session, payload) {
  const { topicId } = payload || {};

  // Kalau belum ada / salah → ulangi ajakan pilih topik
  if (!topicId || !TOPICS[topicId]) {
    const baseOptions = topicToOptions();
    const aiOptions = await rewriteOptionsWithAI(baseOptions, {
      mode: "topic",
      topic: null,
    });

    const spoken = await buildSpokenOptionsPrompt({
      mode: "topic",
      options: aiOptions,
      round: null,
      topic: null,
      previousCount: 0,
    });

    const msg = {
      currentState: "identify_topic",
      type: "topic_selection",
      message: spoken,
      speechText: spoken,
      options: aiOptions,
    };
    return withSpeech(session, msg);
  }

  // Kalau valid → set topic dan lanjut collecting_problem
  session.topicId = topicId;
  session.selectedProblems = [];
  session.state = "collecting_problem";

  const baseProblemOptions = buildProblemOptions(topicId, []);
  const topic = TOPICS[topicId];
  const round = 1;

  const aiProblemOptions = await rewriteOptionsWithAI(baseProblemOptions, {
    mode: "problem",
    topic,
  });

  const spoken = await buildSpokenOptionsPrompt({
    mode: "problem",
    topic,
    round,
    options: aiProblemOptions,
    previousCount: 0,
  });

  const message = {
    currentState: "collecting_problem",
    type: "problem_selection",
    round,
    message: spoken,
    speechText: spoken,
    options: aiProblemOptions,
  };

  return withSpeech(session, message);
}

async function handleCollectingProblem(session, payload) {
  const { problemId } = payload || {};
  const { topicId, selectedProblems } = session;

  if (!topicId || !TOPICS[topicId]) {
    session.state = "identify_topic";
    return handleIdentifyTopic(session, {});
  }

  const topic = TOPICS[topicId];
  const validProblem = topic.problems.find((p) => p.id === problemId);

  // Kalau problemId tidak valid → ulangi round dengan opsi yang sama
  if (!validProblem) {
    const baseOptions = buildProblemOptions(topicId, selectedProblems);
    const aiOptions = await rewriteOptionsWithAI(baseOptions, {
      mode: "problem",
      topic,
    });

    const round = (selectedProblems.length || 0) + 1;

    const spoken = await buildSpokenOptionsPrompt({
      mode: "problem",
      topic,
      round,
      options: aiOptions,
      previousCount: selectedProblems.length || 0,
    });

    const message = {
      currentState: "collecting_problem",
      type: "problem_selection",
      round,
      message: spoken,
      speechText: spoken,
      options: aiOptions,
    };
    return withSpeech(session, message);
  }

  // Simpan problem yang baru dipilih (tanpa duplikasi)
  if (!selectedProblems.includes(problemId)) {
    selectedProblems.push(problemId);
  }

  // Kalau belum 3 problem → lanjut round berikutnya
  if (selectedProblems.length < 3) {
    const round = selectedProblems.length + 1;
    const baseOptions = buildProblemOptions(topicId, selectedProblems);

    const aiOptions = await rewriteOptionsWithAI(baseOptions, {
      mode: "problem",
      topic,
    });

    const spoken = await buildSpokenOptionsPrompt({
      mode: "problem",
      topic,
      round,
      options: aiOptions,
      previousCount: selectedProblems.length,
    });

    const message = {
      currentState: "collecting_problem",
      type: "problem_selection",
      round,
      message: spoken,
      speechText: spoken,
      options: aiOptions,
    };

    return withSpeech(session, message);
  }

  // Sudah 3 problem → generate story
  session.state = "story";

  const { baseStory, storyText } = await buildPersonalizedStory({
    topicId,
    selectedProblems,
  });

  const selectedProblemsFull = selectedProblems
    .map((id) => topic.problems.find((p) => p.id === id))
    .filter(Boolean);

  const message = {
    currentState: "story",
    type: "story",
    storyText,
    speechText: storyText,
    baseStoryMeta: {
      id: baseStory.id,
      title: baseStory.title,
    },
    selectedProblems: selectedProblemsFull,
  };

  return withSpeech(session, message);
}

async function handleRestartSession(session, payload) {
  const keepTopic = payload?.keepTopic ?? true;

  if (!keepTopic) {
    session.state = "greeting";
    session.topicId = null;
    session.selectedProblems = [];
    return handleGreeting(session);
  }

  if (!session.topicId || !TOPICS[session.topicId]) {
    session.state = "identify_topic";
    return handleIdentifyTopic(session, {});
  }

  session.selectedProblems = [];
  session.state = "collecting_problem";

  const baseOptions = buildProblemOptions(session.topicId, []);
  const topic = TOPICS[session.topicId];

  const aiOptions = await rewriteOptionsWithAI(baseOptions, {
    mode: "problem",
    topic,
  });

  const spoken = await buildSpokenOptionsPrompt({
    mode: "problem",
    topic,
    round: 1,
    options: aiOptions,
    previousCount: 0,
  });

  const message = {
    currentState: "collecting_problem",
    type: "problem_selection",
    round: 1,
    message: spoken,
    speechText: spoken,
    options: aiOptions,
  };

  return withSpeech(session, message);
}

// ====== ROUTES ======

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// ====== GLOBAL TTS CONFIG ROUTES (ADMIN) ======

// Lihat config TTS aktif
app.get("/tts/config", (req, res) => {
  res.json({
    success: true,
    config: TTS_CONFIG,
  });
});

// Ubah config TTS (mode & optional webSpeechConfig)
app.post("/tts/config", (req, res) => {
  try {
    const { mode, webSpeechConfig } = req.body || {};

    const allowedModes = ["elevenlabs", "webspeech", "off"];

    if (!mode || !allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message:
          'Field "mode" wajib diisi dengan salah satu dari: "elevenlabs", "webspeech", atau "off".',
      });
    }

    TTS_CONFIG.mode = mode;

    if (mode === "webspeech" && webSpeechConfig && typeof webSpeechConfig === "object") {
      const { lang, rate, pitch, volume } = webSpeechConfig;
      TTS_CONFIG.webSpeechConfig = {
        lang: lang || "id-ID",
        rate: typeof rate === "number" ? rate : 0.95,
        pitch: typeof pitch === "number" ? pitch : 1.0,
        volume: typeof volume === "number" ? volume : 1.0,
      };
    }

    return res.json({
      success: true,
      message: "Konfigurasi TTS global berhasil diperbarui.",
      config: TTS_CONFIG,
    });
  } catch (err) {
    console.error("Error updating global TTS config:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate konfigurasi TTS.",
    });
  }
});

// ====== SESSION ADMIN ROUTES ======

// Hapus satu session
app.delete("/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId wajib diisi pada path parameter.",
      });
    }

    if (!sessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        message: "Session tidak ditemukan atau sudah dihapus.",
      });
    }

    sessions.delete(sessionId);

    return res.json({
      success: true,
      message: "Session berhasil dihapus.",
      sessionId,
    });
  } catch (err) {
    console.error("Error deleting session:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus session.",
    });
  }
});

// Hapus semua session: DELETE /sessions?all=true
app.delete("/sessions", (req, res) => {
  try {
    const { all } = req.query;

    if (all !== "true") {
      return res.status(400).json({
        success: false,
        message:
          'Jika ingin menghapus semua session, kirim query ?all=true pada endpoint ini.',
      });
    }

    const count = sessions.size;
    sessions.clear();

    return res.json({
      success: true,
      message: `Semua session dihapus. Total sebelumnya: ${count}.`,
    });
  } catch (err) {
    console.error("Error deleting all sessions:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus semua session.",
    });
  }
});

// ====== MAIN CHAT ROUTE ======
app.post("/chat", async (req, res) => {
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
          message:
            "Sesi cerita sudah selesai. Kalau suatu saat kamu ingin mulai lagi, kamu bisa memulainya dari awal kapan pun kamu siap.",
          speechText:
            "Sesi cerita kita sudah selesai. Kalau suatu saat kamu ingin mulai lagi, kamu bisa memulainya dari awal kapan pun kamu siap.",
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
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`Konseling AI backend listening on port ${PORT}`);
});
