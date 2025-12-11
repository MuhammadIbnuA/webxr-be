// src/utils/topic.utils.js
const { TOPICS } = require("../../data/topics");

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

module.exports = { topicToOptions, buildProblemOptions };
