// src/handlers/state-cot.handlers.js
// State handlers using Chain of Thought AI service

const { TOPICS } = require("../../data/topics");
const { topicToOptions, buildProblemOptions } = require("../utils/topic.utils");
const { withSpeech } = require("../services/tts.service");
const {
    generateGreetingCoT,
    rewriteOptionsWithCoT,
    buildSpokenOptionsPromptCoT,
    buildPersonalizedStoryCoT,
} = require("../services/ai-cot.service");

/**
 * Handle greeting state with Chain of Thought
 * CoT improves empathy and tone in initial greeting
 */
async function handleGreetingCoT(session) {
    session.state = "identify_topic";
    session.topicId = null;
    session.selectedProblems = [];

    const greetingMessage = await generateGreetingCoT();
    const baseOptions = topicToOptions();
    const aiOptions = await rewriteOptionsWithCoT(baseOptions, { mode: "topic", topic: null });

    const message = {
        currentState: "identify_topic",
        type: "topic_selection",
        message: greetingMessage,
        speechText: greetingMessage,
        options: aiOptions,
        cotEnabled: true, // Flag to indicate CoT was used
    };

    return withSpeech(session, message);
}

/**
 * Handle identify topic state with Chain of Thought
 * CoT improves option presentation and empathy
 */
async function handleIdentifyTopicCoT(session, payload) {
    const { topicId } = payload || {};

    if (!topicId || !TOPICS[topicId]) {
        const baseOptions = topicToOptions();
        const aiOptions = await rewriteOptionsWithCoT(baseOptions, { mode: "topic", topic: null });

        const spoken = await buildSpokenOptionsPromptCoT({
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
            cotEnabled: true,
        };
        return withSpeech(session, msg);
    }

    session.topicId = topicId;
    session.selectedProblems = [];
    session.state = "collecting_problem";

    const baseProblemOptions = buildProblemOptions(topicId, []);
    const topic = TOPICS[topicId];
    const aiProblemOptions = await rewriteOptionsWithCoT(baseProblemOptions, { mode: "problem", topic });

    const round = 1;
    const spoken = await buildSpokenOptionsPromptCoT({
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
        cotEnabled: true,
    };

    return withSpeech(session, message);
}

/**
 * Handle collecting problem state with Chain of Thought
 * CoT improves context-aware empathy for each selection
 */
async function handleCollectingProblemCoT(session, payload) {
    const { problemId } = payload || {};
    const { topicId, selectedProblems } = session;

    if (!topicId || !TOPICS[topicId]) {
        session.state = "identify_topic";
        return handleIdentifyTopicCoT(session, {});
    }

    const topic = TOPICS[topicId];
    const validProblem = topic.problems.find((p) => p.id === problemId);

    if (!validProblem) {
        const baseOptions = buildProblemOptions(topicId, selectedProblems);
        const aiOptions = await rewriteOptionsWithCoT(baseOptions, { mode: "problem", topic });
        const round = (selectedProblems.length || 0) + 1;

        const spoken = await buildSpokenOptionsPromptCoT({
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
            cotEnabled: true,
        };
        return withSpeech(session, message);
    }

    if (!selectedProblems.includes(problemId)) selectedProblems.push(problemId);

    if (selectedProblems.length < 3) {
        const round = selectedProblems.length + 1;
        const baseOptions = buildProblemOptions(topicId, selectedProblems);
        const aiOptions = await rewriteOptionsWithCoT(baseOptions, { mode: "problem", topic });

        // Build context from selected problems for natural conversation flow
        // This is where CoT shines - providing specific empathy based on previous choices
        const selectedProblemsContext = selectedProblems
            .map((id) => topic.problems.find((p) => p.id === id))
            .filter(Boolean);

        const spoken = await buildSpokenOptionsPromptCoT({
            mode: "problem",
            topic,
            round,
            options: aiOptions,
            previousCount: selectedProblems.length,
            selectedProblemsContext,
        });

        const message = {
            currentState: "collecting_problem",
            type: "problem_selection",
            round,
            message: spoken,
            speechText: spoken,
            options: aiOptions,
            cotEnabled: true,
        };
        return withSpeech(session, message);
    }

    // All 3 problems selected - generate personalized story with CoT
    session.state = "story";

    const { baseStory, storyText } = await buildPersonalizedStoryCoT({ topicId, selectedProblems });

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
        cotEnabled: true,
    };

    return withSpeech(session, message);
}

/**
 * Handle restart session with Chain of Thought
 * CoT improves transition messaging
 */
async function handleRestartSessionCoT(session, payload) {
    const keepTopic = payload?.keepTopic ?? true;

    if (!keepTopic) {
        session.state = "greeting";
        session.topicId = null;
        session.selectedProblems = [];
        return handleGreetingCoT(session);
    }

    if (!session.topicId || !TOPICS[session.topicId]) {
        session.state = "identify_topic";
        return handleIdentifyTopicCoT(session, {});
    }

    session.selectedProblems = [];
    session.state = "collecting_problem";

    const baseOptions = buildProblemOptions(session.topicId, []);
    const topic = TOPICS[session.topicId];
    const aiOptions = await rewriteOptionsWithCoT(baseOptions, { mode: "problem", topic });

    const spoken = await buildSpokenOptionsPromptCoT({
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
        cotEnabled: true,
    };

    return withSpeech(session, message);
}

module.exports = {
    handleGreetingCoT,
    handleIdentifyTopicCoT,
    handleCollectingProblemCoT,
    handleRestartSessionCoT,
};
