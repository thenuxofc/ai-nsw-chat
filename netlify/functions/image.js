/**
 * Netlify Function: Image Proxy
 * Bypasses CDN hotlink protection by providing the required referer header
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: 'Method Not Allowed'
    };
  }

  const imageUrl = event.queryStringParameters?.url;
  if (!imageUrl) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
      body: 'Missing "url" query parameter'
    };
  }

  try {
    const res = await fetch(imageUrl, {
      headers: {
        'referer': 'https://www.nsfwlover.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: CORS_HEADERS,
        body: `Failed to fetch image from CDN: ${res.statusText}`
      };
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: 'Image proxy error: ' + err.message
    };
  }
};
