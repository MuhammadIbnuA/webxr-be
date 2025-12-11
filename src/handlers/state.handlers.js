// src/handlers/state.handlers.js
const { TOPICS } = require("../../data/topics");
const { topicToOptions, buildProblemOptions } = require("../utils/topic.utils");
const { withSpeech } = require("../services/tts.service");
const {
  generateGreeting,
  rewriteOptionsWithAI,
  buildSpokenOptionsPrompt,
  buildPersonalizedStory,
} = require("../services/ai.service");

async function handleGreeting(session) {
  session.state = "identify_topic";
  session.topicId = null;
  session.selectedProblems = [];

  const greetingMessage = await generateGreeting();
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

  if (!selectedProblems.includes(problemId)) selectedProblems.push(problemId);

  if (selectedProblems.length < 3) {
    const round = selectedProblems.length + 1;
    const baseOptions = buildProblemOptions(topicId, selectedProblems);
    const aiOptions = await rewriteOptionsWithAI(baseOptions, { mode: "problem", topic });

    // Build context from selected problems for natural conversation flow
    const selectedProblemsContext = selectedProblems
      .map((id) => topic.problems.find((p) => p.id === id))
      .filter(Boolean);

    const spoken = await buildSpokenOptionsPrompt({
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
    };
    return withSpeech(session, message);
  }

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

module.exports = {
  handleGreeting,
  handleIdentifyTopic,
  handleCollectingProblem,
  handleRestartSession,
};
