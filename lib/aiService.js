const crypto = require('crypto');
const { resolveCharacter } = require('./charactersData');
const sessionStore = require('./sessionStore');

/**
 * Generate a random 64-character base64url local ID like the browser client uses
 */
function generateLocalId() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Send a chat message to the AI character with full memory / session preservation
 * @param {Object} options
 * @param {string} options.character - Character name or ID (e.g., 'Kohana', 'Linda')
 * @param {string} options.prompt - The user's input message
 * @param {string} [options.sessionId] - Session ID to keep memory context
 * @param {string} [options.username] - User's name (default: 'Guest')
 * @param {string} [options.systemPrompt] - Optional system prompt
 * @param {string} [options.description] - Optional persona description override
 * @param {string} [options.modelType] - Model type (default: 'lfm-7b')
 */
async function chatWithCharacter({
  character = 'Kohana',
  prompt = '',
  sessionId = null,
  username = 'Guest',
  systemPrompt = '',
  description = '',
  modelType = 'lfm-7b'
}) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('Missing or empty "prompt" parameter. Please provide a message.');
  }

  const charInfo = resolveCharacter(character);
  const localId = generateLocalId();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // 1. Retrieve or initialize session with memory
  let session = sessionId ? sessionStore.getSession(sessionId) : null;
  if (!session) {
    session = sessionStore.createSession({
      character: charInfo.name,
      username: username || 'Guest',
      customSessionId: sessionId
    });
  }

  // 2. Add user message to session memory
  session = sessionStore.appendMessage(session.sessionId, 'user', prompt.trim());

  // 3. Prepare payload with full conversation history
  const payload = {
    builtin: true,
    char: null,
    char_id: charInfo.id,
    session_id: session.sessionId,
    lang: 'en',
    sysprompt: systemPrompt || '',
    description: description || charInfo.description || '',
    input_messages: session.messages,
    stream: false,
    model_type: modelType || 'lfm-7b',
    isSummary: false,
    charname: charInfo.name,
    shortname: '',
    username: session.username || username || 'Guest',
    session_date: nowStr,
    gender: 'Female',
    userGender: 'Unknown'
  };

  // 4. Call upstream API
  const response = await fetch('https://www.nsfwlover.com/api/openai/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-local-id': localId,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept': '*/*'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Upstream AI service error (${response.status}): ${errorBody || response.statusText}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || '';

  // 5. Save assistant reply into session memory
  session = sessionStore.appendMessage(session.sessionId, 'assistant', reply.trim());

  return {
    status: 'success',
    session_id: session.sessionId,
    character: charInfo.name,
    character_id: charInfo.id,
    prompt: prompt.trim(),
    reply: reply.trim(),
    message_count: session.messages.length,
    avatar: charInfo.avatar,
    model: data.model || modelType || 'lfm-7b',
    created: data.created || Math.floor(Date.now() / 1000)
  };
}

module.exports = {
  chatWithCharacter,
  generateLocalId
};
