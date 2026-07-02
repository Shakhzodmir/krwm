/**
 * Korean with Madie 🌸 — нативный TTS-прокси (Cloudflare Worker → Google Cloud TTS).
 *
 * Эндпоинт:  GET /tts?text=안녕하세요&rate=1.0&voice=ko-KR-Neural2-A
 * Ответ:     audio/mpeg (MP3)
 *
 * Секрет (НИКОГДА не в коде клиента):
 *   GOOGLE_TTS_KEY  — ключ Google Cloud Text-to-Speech API.
 *   Задать командой:  wrangler secret put GOOGLE_TTS_KEY
 *
 * Переменная окружения:
 *   ALLOWED_ORIGIN  — источник сайта для CORS (по умолчанию '*'; лучше указать домен).
 *
 * Инструкция по деплою — в README.md рядом.
 */

const MAX_TEXT = 300;                       // ограничение длины строки — защита от злоупотреблений
const DEFAULT_VOICE = 'ko-KR-Neural2-A';    // женский Neural2 (голос Мади по умолчанию)
const ALLOWED_VOICES = new Set([
  'ko-KR-Neural2-A', 'ko-KR-Neural2-B', 'ko-KR-Neural2-C',
  'ko-KR-Wavenet-A', 'ko-KR-Wavenet-B', 'ko-KR-Wavenet-C', 'ko-KR-Wavenet-D',
  'ko-KR-Standard-A', 'ko-KR-Standard-B', 'ko-KR-Standard-C', 'ko-KR-Standard-D'
]);

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

// ALLOWED_ORIGIN: '*' либо список доменов через запятую
// (например "https://koreanmadie.study, https://koreanmadie.web.app").
// Возвращаем origin запроса, если он в списке — так один воркер обслуживает
// и новый домен, и старые адреса Firebase Hosting.
function pickOrigin(request, allowed) {
  const conf = (allowed || '*').trim();
  if (conf === '*' || !conf) return '*';
  const list = conf.split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
  const origin = (request.headers.get('Origin') || '').replace(/\/+$/, '');
  return list.includes(origin) ? origin : list[0];
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, cors(origin))
  });
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const allowOrigin = pickOrigin(request, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(allowOrigin) });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/tts') {
      return new Response('Not found', { status: 404, headers: cors(allowOrigin) });
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: cors(allowOrigin) });
    }

    const text = (url.searchParams.get('text') || '').trim();
    if (!text) return json({ error: 'missing text' }, 400, allowOrigin);
    if (text.length > MAX_TEXT) return json({ error: 'text too long' }, 413, allowOrigin);

    let rate = parseFloat(url.searchParams.get('rate') || '1.0');
    if (!isFinite(rate) || rate < 0.25 || rate > 4.0) rate = 1.0;

    let voice = url.searchParams.get('voice') || DEFAULT_VOICE;
    if (!ALLOWED_VOICES.has(voice)) voice = DEFAULT_VOICE;

    if (!env.GOOGLE_TTS_KEY) return json({ error: 'server not configured (no GOOGLE_TTS_KEY)' }, 500, allowOrigin);

    // Кэш на краю Cloudflare: одинаковые запросы не дёргают Google повторно (экономит квоту и время).
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) {
      cached = new Response(cached.body, cached);
      const c = cors(allowOrigin);
      for (const k in c) cached.headers.set(k, c[k]);
      return cached;
    }

    const gReq = {
      input: { text: text },
      voice: { languageCode: 'ko-KR', name: voice },
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate, pitch: 0 }
    };
    const gResp = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(env.GOOGLE_TTS_KEY),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gReq) }
    );
    if (!gResp.ok) {
      const detail = await gResp.text();
      return json({ error: 'tts upstream failed', status: gResp.status, detail: detail.slice(0, 300) }, 502, allowOrigin);
    }
    const data = await gResp.json();
    if (!data.audioContent) return json({ error: 'no audio returned' }, 502, allowOrigin);

    const bytes = base64ToBytes(data.audioContent);
    const headers = Object.assign({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=2592000'   // 30 дней
    }, cors(allowOrigin));
    const resp = new Response(bytes, { headers: headers });
    ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return resp;
  }
};
