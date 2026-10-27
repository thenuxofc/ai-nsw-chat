const crypto = require('crypto');
const { resolveCharacter } = require('./charactersData');

/**
 * Generate a random 64-character base64url local ID like the browser client uses
 */
function generateLocalId() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return 'sess_' + crypto.randomBytes(10).toString('hex');
}

/**
 * Send a chat message to the AI character
 * @param {Object} options
 * @param {string} options.character - Character name or ID (e.g., 'Kohana', 'Linda', 'Sarah Wood')
 * @param {string} options.prompt - The user's input message
 * @param {string} [options.sessionId] - Session ID to keep context
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
  const finalSessionId = sessionId || generateSessionId();
  const localId = generateLocalId();
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const inputMessages = [];

  // Add the greeting as the initial context if available
  if (charInfo.greeting) {
    const greetingText = charInfo.greeting
      .replace(/\{\{char\}\}/g, charInfo.name)
      .replace(/\{\{user\}\}/g, username || 'Guest');

    inputMessages.push({
      id: 'greet_' + Date.now(),
      type: 'text',
      date: nowStr,
      role: 'assistant',
      content: greetingText
    });
  }

  // Add user prompt
  inputMessages.push({
    id: 'user_' + Date.now(),
    type: 'text',
    date: nowStr,
    role: 'user',
    content: prompt.trim()
  });

  const payload = {
    builtin: true,
    char: null,
    char_id: charInfo.id,
    session_id: finalSessionId,
    lang: 'en',
    sysprompt: systemPrompt || '',
    description: description || charInfo.description || '',
    input_messages: inputMessages,
    stream: false,
    model_type: modelType || 'lfm-7b',
    isSummary: false,
    charname: charInfo.name,
    shortname: '',
    username: username || 'Guest',
    session_date: nowStr,
    gender: 'Female',
    userGender: 'Unknown'
  };

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

  return {
    status: 'success',
    character: charInfo.name,
    character_id: charInfo.id,
    prompt: prompt.trim(),
    reply: reply.trim(),
    session_id: finalSessionId,
    avatar: charInfo.avatar,
    model: data.model || modelType || 'lfm-7b',
    created: data.created || Math.floor(Date.now() / 1000)
  };
}

module.exports = {
  chatWithCharacter,
  generateLocalId,
  generateSessionId
};
