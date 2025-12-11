// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Groq = require("groq-sdk");
const { synthesizeSpeech } = require("./tts");

// prompts (modular)
const { getGreetingPrompt } = require("../prompts/greetingprompt");
const { getOptionsPrompt } = require("../prompts/optionsprompt");
const { getStoryPrompt } = require("../prompts/storyprompt");
const { getOptionRewritePrompt } = require("../prompts/optionrewriteprompt");

// data (modular)
const { TOPICS } = require("../data/topics");
const { pickBaseStoryForTopic } = require("../data/basestories");

// ====== init ======
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ====== Groq client ======
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

// ====== GLOBAL TTS CONFIG (ADMIN) ======
let TTS_CONFIG = {
  mode: (process.env.DEFAULT_TTS_MODE || "elevenlabs").toLowerCase(), // elevenlabs | lmnt | webspeech | off
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

// ====== SESSION STORE (IN-MEMORY) ======
/**
 * session: {
 *   id: string,
 *   state: 'greeting' | 'identify_topic' | 'collecting_problem' | 'story',
 *   topicId: 'diri' | 'sosial' | 'alam' | null,
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

// ====== HELPERS: Utilities ======

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
    .map((p) => ({ id: p.id, label: p.title, description: p.detail }));
}

// AI rewrite untuk opsi — hasil JSON harus berisi array "options"
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
          content: "Gunakan bahasa Indonesia yang hangat, lembut, dan terasa seperti teman yang peduli.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) return simpleOptions;

    // strip fenced ```json blocks if present
    const fenced = raw.match(/```json([\s\S]*?)```/i);
    if (fenced) raw = fenced[1].trim();

    // parse JSON
    const parsed = JSON.parse(raw);
    const aiOptions = Array.isArray(parsed?.options) ? parsed.options : [];

    if (!aiOptions.length) return simpleOptions;

    const byId = Object.fromEntries(simpleOptions.map((o) => [o.id, o]));
    const merged = aiOptions
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

    return merged.length ? merged : simpleOptions;
  } catch (err) {
    console.error("[rewriteOptionsWithAI] error:", err);
    return simpleOptions;
  }
}

// Build spoken prompt (identify topic / collecting problem)
async function buildSpokenOptionsPrompt({ mode, topic, round, options, previousCount }) {
  const simpleOptions = options.map((o) => ({ id: o.id, label: o.label, description: o.description }));
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
        content: "Gunakan bahasa Indonesia yang hangat dan reflektif, seperti teman yang mendengarkan dengan tulus.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  let text = completion.choices?.[0]?.message?.content?.trim() ||
    "Silakan pilih mana yang paling terasa dekat dengan kondisimu sekarang.";

  // Safety: remove leading salutations that shouldn't appear outside greeting
  text = text.replace(
    /^(assalamualaikum[^\w]*|halo[^\w]*|hai[^\w]*|hello[^\w]*|selamat\s+(pagi|siang|sore|malam)[^\w]*)/i,
    ""
  ).trim();

  return text;
}

// Build personalized story
async function buildPersonalizedStory({ topicId, selectedProblems }) {
  const base = pickBaseStoryForTopic(topicId);

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

  const prompt = getStoryPrompt(base.text, problemsText);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content: "Gunakan bahasa Indonesia yang lembut dan empatik, seperti teman yang menemani proses refleksi.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const storyText = completion.choices?.[0]?.message?.content?.trim() || base.text || "Maaf, cerita belum tersedia saat ini.";

  return { baseStory: base, storyText };
}

// withSpeech: produce audio if global TTS_CONFIG.mode requires provider-side audio
async function withSpeech(session, messageObj) {
  const speechSource = messageObj.speechText || messageObj.message || messageObj.storyText;
  const provider = (TTS_CONFIG.mode || "elevenlabs").toLowerCase();

  // If provider is 'elevenlabs' or 'lmnt', request audio from backend via tts.js
  if ((provider === "elevenlabs" || provider === "lmnt" || provider === "lmnt-tts") && speechSource) {
    const opts = {};
    // pass provider-specific options
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

  // If webspeech or off → backend doesn't produce audio; front-end will use speechText or nothing
  return {
    ...messageObj,
    sessionId: session.id,
    tts: TTS_CONFIG,
    audio: { enabled: false, mimeType: null, base64: null },
  };
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
      { role: "system", content: "Kamu adalah konselor sekolah yang empatik, Islami, dan berbahasa Indonesia yang halus." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  const greetingMessage = completion.choices?.[0]?.message?.content?.trim() ||
    "Assalamualaikum, selamat datang. Di sini kamu aman untuk bercerita. Kita mulai dengan memilih area kedamaian yang ingin kamu fokuskan: Damai dengan Diri, Damai dengan Sosial, atau Damai dengan Alam. Mana yang paling dekat dengan perasaanmu saat ini?";

  // build options (rewrite via AI)
  const baseOptions = topicToOptions();
  const aiOptions = await rewriteOptionsWithAI(baseOptions, { mode: "topic", topic: null });

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

  // invalid or missing -> speak options again (no greeting)
  if (!topicId || !TOPICS[topicId]) {
    const baseOptions = topicToOptions();
    const aiOptions = await rewriteOptionsWithAI(baseOptions, { mode: "topic", topic: null });

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

  // valid topic -> move to collecting_problem round 1
  session.topicId = topicId;
  session.selectedProblems = [];
  session.state = "collecting_problem";

  const baseProblemOptions = buildProblemOptions(topicId, []);
  const topic = TOPICS[topicId];
  const aiProblemOptions = await rewriteOptionsWithAI(baseProblemOptions, { mode: "problem", topic });

  const round = 1;
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

  // invalid problem -> re-prompt same round
  if (!validProblem) {
    const baseOptions = buildProblemOptions(topicId, selectedProblems);
    const aiOptions = await rewriteOptionsWithAI(baseOptions, { mode: "problem", topic });
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

  // store selection (no duplicate)
  if (!selectedProblems.includes(problemId)) selectedProblems.push(problemId);

  // if less than 3 -> continue next round
  if (selectedProblems.length < 3) {
    const round = selectedProblems.length + 1;
    const baseOptions = buildProblemOptions(topicId, selectedProblems);
    const aiOptions = await rewriteOptionsWithAI(baseOptions, { mode: "problem", topic });

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

  // already 3 problems -> generate story
  session.state = "story";

  const { baseStory, storyText } = await buildPersonalizedStory({ topicId, selectedProblems });

  const selectedProblemsFull = selectedProblems
    .map((id) => topic.problems.find((p) => p.id === id))
    .filter(Boolean);

  const message = {
    currentState: "story",
    type: "story",
    storyText,
    speechText: storyText,
    baseStoryMeta: { id: baseStory.id, title: baseStory.title },
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
  const aiOptions = await rewriteOptionsWithAI(baseOptions, { mode: "problem", topic });

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
app.get("/tts/config", (req, res) => {
  res.json({ success: true, config: TTS_CONFIG });
});

app.post("/tts/config", (req, res) => {
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

// ====== SESSION ADMIN ROUTES ======
app.delete("/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ success: false, message: "sessionId required" });
    if (!sessions.has(sessionId)) return res.status(404).json({ success: false, message: "session not found" });
    sessions.delete(sessionId);
    return res.json({ success: true, message: "session deleted", sessionId });
  } catch (err) {
    console.error("Error deleting session:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.delete("/sessions", (req, res) => {
  try {
    const { all } = req.query;
    if (all !== "true") return res.status(400).json({ success: false, message: 'use ?all=true to delete all sessions' });
    const count = sessions.size;
    sessions.clear();
    return res.json({ success: true, message: `deleted ${count} sessions` });
  } catch (err) {
    console.error("Error deleting all sessions:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
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

// ====== start server ======
app.listen(PORT, () => {
  console.log(`Konseling AI backend listening on port ${PORT}`);
});
