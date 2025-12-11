// src/services/ai.service.js
const { groq, GROQ_MODEL } = require("../groqClient");
const { getOptionRewritePrompt } = require("../../prompts/optionrewriteprompt");
const { getOptionsPrompt } = require("../../prompts/optionsprompt");
const { getStoryPrompt } = require("../../prompts/storyprompt");
const { getGreetingPrompt } = require("../../prompts/greetingprompt");
const { TOPICS } = require("../../data/topics");
const { pickBaseStoryForTopic } = require("../../data/basestories");

async function generateGreeting() {
  const prompt = getGreetingPrompt();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "Kamu adalah konselor sekolah yang empatik, Islami, dan berbahasa Indonesia yang halus." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content?.trim() ||
    "Assalamualaikum, selamat datang. Di sini kamu aman untuk bercerita.";
}

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

    const fenced = raw.match(/```json([\s\S]*?)```/i);
    if (fenced) raw = fenced[1].trim();

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


async function buildSpokenOptionsPrompt({ mode, topic, round, options, previousCount, selectedProblemsContext }) {
  const simpleOptions = options.map((o) => ({ id: o.id, label: o.label, description: o.description }));
  const prompt = getOptionsPrompt({
    mode,
    topicLabel: topic?.label || null,
    round,
    previousCount: previousCount || 0,
    simpleOptions,
    selectedProblemsContext: selectedProblemsContext || [],
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

  text = text.replace(
    /^(assalamualaikum[^\w]*|halo[^\w]*|hai[^\w]*|hello[^\w]*|selamat\s+(pagi|siang|sore|malam)[^\w]*)/i,
    ""
  ).trim();

  return text;
}

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

module.exports = {
  generateGreeting,
  rewriteOptionsWithAI,
  buildSpokenOptionsPrompt,
  buildPersonalizedStory,
};
