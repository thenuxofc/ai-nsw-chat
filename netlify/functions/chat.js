const { chatWithCharacter } = require('../../lib/aiService');
const sessionStore = require('../../lib/sessionStore');
const { resolveCharacter } = require('../../lib/charactersData');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-local-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  try {
    let params = {};

    if (event.httpMethod === 'GET') {
      params = event.queryStringParameters || {};
    } else if (event.httpMethod === 'POST') {
      try {
        params = event.body ? JSON.parse(event.body) : {};
      } catch (err) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'error',
            message: 'Invalid JSON body provided.'
          })
        };
      }
    } else {
      return {
        statusCode: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'error',
          message: `Method ${event.httpMethod} not allowed. Use GET or POST.`
        })
      };
    }

    const action = (params.action || '').toLowerCase();
    const character = params.character || params.char || params.char_id || 'Kohana';
    const sessionId = params.session_id || params.sessionId || null;
    const username = params.username || params.user || 'Guest';

    // ACTION 1: Generate / initialize a new session with memory
    if (action === 'new_session' || action === 'new' || action === 'create_session' || params.new_session === 'true') {
      const session = sessionStore.createSession({ character, username });
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          status: 'success',
          action: 'new_session_created',
          session_id: session.sessionId,
          character: session.character,
          greeting: session.messages[0]?.content || null,
          message_count: session.messages.length,
          created_at: session.createdAt
        })
      };
    }

    // ACTION 2: Get chat history / memory for an existing session
    if (action === 'history' || action === 'get_memory') {
      if (!sessionId) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'error',
            message: 'Missing "session_id" parameter to retrieve history.'
          })
        };
      }
      const session = sessionStore.getSession(sessionId);
      if (!session) {
        return {
          statusCode: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'error',
            message: `Session "${sessionId}" not found or expired.`
          })
        };
      }
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          status: 'success',
          session_id: session.sessionId,
          character: session.character,
          total_messages: session.messages.length,
          messages: session.messages
        })
      };
    }

    // ACTION 3: Clear / reset session memory
    if (action === 'clear' || action === 'reset') {
      if (sessionId) {
        sessionStore.clearSession(sessionId);
      }
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          status: 'success',
          message: `Memory cleared for session ${sessionId || 'all'}.`
        })
      };
    }

    // NORMAL CHAT REQUEST
    const prompt = params.prompt || params.text || params.message || params.q || '';
    if (!prompt.trim()) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'error',
          message: 'Missing required query parameter "prompt". Example: /api/chat?prompt=hello&character=Kohana&session_id=optional'
        })
      };
    }

    const format = (params.format || '').toLowerCase();

    const result = await chatWithCharacter({
      character,
      prompt,
      sessionId,
      username
    });

    // If client requested plain text output
    if (format === 'text' || format === 'plain') {
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
        body: result.reply
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Internal server error processing chat request.'
      })
    };
  }
};
