// src/services/ai-cot.service.js
// AI Service with Chain of Thought implementation

const { groq, GROQ_MODEL } = require("../groqClient");
const { getCoTGreetingPrompt } = require("../../prompts/cot-greetingprompt");
const { getCoTOptionRewritePrompt } = require("../../prompts/cot-optionrewriteprompt");
const { getCoTOptionsPrompt } = require("../../prompts/cot-optionsprompt");
const { getCoTStoryPrompt } = require("../../prompts/cot-storyprompt");
const { TOPICS } = require("../../data/topics");
const { pickBaseStoryForTopic } = require("../../data/basestories");

/**
 * Generate greeting using Chain of Thought approach
 * CoT helps AI think through the emotional context and tone before generating
 */
async function generateGreetingCoT() {
    const prompt = getCoTGreetingPrompt();

    const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
            {
                role: "system",
                content: "Kamu adalah konselor sekolah yang empatik, Islami, dan berbahasa Indonesia yang halus. Gunakan Chain of Thought untuk berpikir mendalam sebelum merespons."
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    });

    return completion.choices?.[0]?.message?.content?.trim() ||
        "Assalamualaikum, selamat datang. Di sini kamu aman untuk bercerita.";
}

/**
 * Rewrite options using Chain of Thought
 * CoT helps analyze emotional context and choose appropriate language
 */
async function rewriteOptionsWithCoT(simpleOptions, { mode, topic }) {
    try {
        const prompt = getCoTOptionRewritePrompt(simpleOptions, {
            mode,
            topicLabel: topic?.label || null,
        });

        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content: "Gunakan bahasa Indonesia yang hangat, lembut, dan terasa seperti teman yang peduli. Gunakan Chain of Thought untuk memahami konteks emosional sebelum menulis ulang.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
        });

        let raw = completion.choices?.[0]?.message?.content?.trim();
        if (!raw) return simpleOptions;

        // Extract JSON from response (might be wrapped in code blocks)
        const fenced = raw.match(/```json([\s\S]*?)```/i);
        if (fenced) raw = fenced[1].trim();

        const parsed = JSON.parse(raw);
        const aiOptions = Array.isArray(parsed?.options) ? parsed.options : [];

        if (!aiOptions.length) return simpleOptions;

        // Merge AI-generated labels/descriptions with original IDs
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
        console.error("[rewriteOptionsWithCoT] error:", err);
        return simpleOptions;
    }
}

/**
 * Build spoken options prompt using Chain of Thought
 * CoT helps create natural conversation flow with context-aware empathy
 */
async function buildSpokenOptionsPromptCoT({
    mode,
    topic,
    round,
    options,
    previousCount,
    selectedProblemsContext
}) {
    const simpleOptions = options.map((o) => ({
        id: o.id,
        label: o.label,
        description: o.description
    }));

    const prompt = getCoTOptionsPrompt({
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
                content: "Gunakan bahasa Indonesia yang hangat dan reflektif, seperti teman yang mendengarkan dengan tulus. Gunakan Chain of Thought untuk memahami konteks emosional dan menciptakan empati yang spesifik.",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    });

    let text = completion.choices?.[0]?.message?.content?.trim() ||
        "Silakan pilih mana yang paling terasa dekat dengan kondisimu sekarang.";

    // Remove any greeting words that might slip through
    text = text.replace(
        /^(assalamualaikum[^\w]*|halo[^\w]*|hai[^\w]*|hello[^\w]*|selamat\s+(pagi|siang|sore|malam)[^\w]*)/i,
        ""
    ).trim();

    return text;
}

/**
 * Build personalized story using Chain of Thought
 * CoT helps deeply analyze the connection between base story and student's problems
 */
async function buildPersonalizedStoryCoT({ topicId, selectedProblems }) {
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

    const prompt = getCoTStoryPrompt(base.text, problemsText);

    const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
            {
                role: "system",
                content: "Gunakan bahasa Indonesia yang lembut dan empatik, seperti teman yang menemani proses refleksi. Gunakan Chain of Thought untuk menganalisis koneksi mendalam antara cerita dan kondisi siswa.",
            },
            { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
    });

    const storyText = completion.choices?.[0]?.message?.content?.trim() ||
        base.text ||
        "Maaf, cerita belum tersedia saat ini.";

    return { baseStory: base, storyText };
}

module.exports = {
    generateGreetingCoT,
    rewriteOptionsWithCoT,
    buildSpokenOptionsPromptCoT,
    buildPersonalizedStoryCoT,
};
