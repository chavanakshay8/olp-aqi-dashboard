const http = require('http');
const { URL } = require('url');

const PORT = 5501;
const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const RESOURCE_ID = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

const cache = new Map();
const FRESH_TTL_MS = 5 * 60 * 1000;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, payload) {
  setCors(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function fetchCpcb(city, limit) {
  const apiUrl = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
  apiUrl.searchParams.set('api-key', API_KEY);
  apiUrl.searchParams.set('format', 'json');
  apiUrl.searchParams.set('filters[city]', city);
  apiUrl.searchParams.set('limit', String(limit));

  const response = await fetch(apiUrl.toString(), { signal: AbortSignal.timeout(12000) });
  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { error: 'Invalid JSON from upstream', raw: text };
  }
  return { status: response.status, body: parsed };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.statusCode = 204;
    return res.end();
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (req.method !== 'GET' || requestUrl.pathname !== '/cpcb') {
    return sendJson(res, 404, { error: 'Not found. Use GET /cpcb?city=Mumbai&limit=200' });
  }

  const city = (requestUrl.searchParams.get('city') || 'Mumbai').trim();
  const limit = Math.min(Math.max(Number(requestUrl.searchParams.get('limit') || 200), 1), 500);
  const key = `${city.toLowerCase()}|${limit}`;

  const cached = cache.get(key);
  const now = Date.now();
  if (cached && now - cached.ts < FRESH_TTL_MS) {
    return sendJson(res, 200, cached.body);
  }

  try {
    const upstream = await fetchCpcb(city, limit);
    if (upstream.status >= 200 && upstream.status < 300 && !upstream.body.error) {
      cache.set(key, { ts: now, body: upstream.body });
      return sendJson(res, 200, upstream.body);
    }
    if (cached) {
      return sendJson(res, 200, {
        ...cached.body,
        _stale: true,
        _note: 'Serving cached CPCB response due to upstream error',
        _upstream_status: upstream.status
      });
    }
    return sendJson(res, 502, {
      error: 'Upstream CPCB API failed',
      upstream_status: upstream.status,
      upstream_body: upstream.body
    });
  } catch (err) {
    if (cached) {
      return sendJson(res, 200, {
        ...cached.body,
        _stale: true,
        _note: 'Serving cached CPCB response due to proxy fetch exception'
      });
    }
    return sendJson(res, 502, { error: 'Proxy fetch failed', detail: String(err && err.message || err) });
  }
});

server.listen(PORT, () => {
  console.log(`CPCB proxy listening on http://127.0.0.1:${PORT}/cpcb?city=Mumbai&limit=200`);
});
