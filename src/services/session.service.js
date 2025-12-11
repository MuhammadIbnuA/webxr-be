// src/services/session.service.js
const crypto = require("crypto");

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

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

function clearAllSessions() {
  const count = sessions.size;
  sessions.clear();
  return count;
}

function hasSession(sessionId) {
  return sessions.has(sessionId);
}

module.exports = {
  sessions,
  createSessionId,
  getOrCreateSession,
  getSession,
  deleteSession,
  clearAllSessions,
  hasSession,
};
