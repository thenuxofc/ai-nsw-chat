const { chatWithCharacter } = require('../../lib/aiService');

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

    // Extract prompt from multiple possible aliases
    const prompt = params.prompt || params.text || params.message || params.q || '';
    if (!prompt.trim()) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'error',
          message: 'Missing required query parameter "prompt" (or "text" / "message"). Example: /api/chat?prompt=hello&character=Kohana'
        })
      };
    }

    const character = params.character || params.char || params.char_id || 'Kohana';
    const sessionId = params.session_id || params.sessionId || null;
    const username = params.username || params.user || 'Guest';
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
