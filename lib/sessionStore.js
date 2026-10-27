
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { resolveCharacter } = require('./charactersData');

// Determine cache directory: /tmp on Netlify/Lambda or local .sessions directory
const SESSIONS_DIR = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join('/tmp', 'ai_girl_sessions')
  : path.join(process.cwd(), '.sessions');

// Ensure directory exists
try {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create sessions directory:', e.message);
}

// In-memory cache for ultra-fast access
const memoryCache = new Map();

/**
 * Generate a new session ID
 */
function generateSessionId(characterName = 'Kohana') {
  const cleanChar = (characterName || 'Kohana').replace(/[^a-zA-Z0-9]/g, '');
  const rand = crypto.randomBytes(8).toString('hex');
  return `sess_${cleanChar}_${rand}`;
}

/**
 * Get file path for a session
 */
function getSessionFilePath(sessionId) {
  const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(SESSIONS_DIR, `${safeId}.json`);
}

/**
 * Load session from memory or disk
 */
function getSession(sessionId) {
  if (!sessionId) return null;

  // 1. Check in-memory cache
  if (memoryCache.has(sessionId)) {
    return memoryCache.get(sessionId);
  }

  // 2. Check disk cache
  const filePath = getSessionFilePath(sessionId);
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      memoryCache.set(sessionId, data);
      return data;
    }
  } catch (err) {
    console.warn(`Error reading session ${sessionId}:`, err.message);
  }

  return null;
}

/**
 * Create a new session with initial greeting context
 */
function createSession({ character = 'Kohana', username = 'Guest', customSessionId = null }) {
  const charInfo = resolveCharacter(character);
  const sessionId = customSessionId || generateSessionId(charInfo.name);
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const messages = [];

  if (charInfo.greeting) {
    const greetingText = charInfo.greeting
      .replace(/\{\{char\}\}/g, charInfo.name)
      .replace(/\{\{user\}\}/g, username || 'Guest');

    messages.push({
      id: 'msg_greet_' + Date.now(),
      type: 'text',
      date: nowStr,
      role: 'assistant',
      content: greetingText
    });
  }

  const session = {
    sessionId,
    character: charInfo.name,
    characterId: charInfo.id,
    username: username || 'Guest',
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  saveSession(session);
  return session;
}

/**
 * Save session to memory and disk
 */
function saveSession(session) {
  if (!session || !session.sessionId) return;

  session.updatedAt = Date.now();

  // Save to memory cache (limit memory size to 500 sessions)
  if (memoryCache.size > 500) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(session.sessionId, session);

  // Save to disk
  try {
    const filePath = getSessionFilePath(session.sessionId);
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
  } catch (err) {
    console.warn(`Error persisting session ${session.sessionId}:`, err.message);
  }
}

/**
 * Add a message to an existing session
 */
function appendMessage(sessionId, role, content) {
  const session = getSession(sessionId);
  if (!session) return null;

  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
  session.messages.push({
    id: `msg_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'text',
    date: nowStr,
    role,
    content: (content || '').trim()
  });

  // Keep last 40 messages to avoid token limit overflow while preserving deep memory
  if (session.messages.length > 40) {
    // Keep initial greeting if present, and the most recent 39 messages
    const firstMsg = session.messages[0];
    const recent = session.messages.slice(-39);
    session.messages = firstMsg.role === 'assistant' ? [firstMsg, ...recent] : recent;
  }

  saveSession(session);
  return session;
}

/**
 * Clear/delete a session
 */
function clearSession(sessionId) {
  if (!sessionId) return false;
  memoryCache.delete(sessionId);
  try {
    const filePath = getSessionFilePath(sessionId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) { }
  return true;
}

module.exports = {
  generateSessionId,
  getSession,
  createSession,
  saveSession,
  appendMessage,
  clearSession
};
