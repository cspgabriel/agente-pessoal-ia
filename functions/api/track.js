// /api/track — Tracking de eventos (downloads, pageviews) no Cloudflare Pages
//
// Bindings opcionais:
//   TRACKING_WEBHOOK_URL — POST adicional pra endpoint externo

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestPost(context) {
  const { request, env } = context;

  let event;
  try {
    event = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Body inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }

  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim();
  const safeEvent = {
    event: String(event.event || 'unknown').slice(0, 64),
    email: event.email ? String(event.email).slice(0, 254) : null,
    file: event.file ? String(event.file).slice(0, 256) : null,
    source: event.source ? String(event.source).slice(0, 64) : null,
    utm_source: event.utm_source ? String(event.utm_source).slice(0, 64) : null,
    utm_medium: event.utm_medium ? String(event.utm_medium).slice(0, 64) : null,
    utm_campaign: event.utm_campaign ? String(event.utm_campaign).slice(0, 128) : null,
    referrer: event.referrer ? String(event.referrer).slice(0, 512) : null,
    ts: new Date().toISOString(),
    ip,
    ua: (request.headers.get('user-agent') || '').slice(0, 256),
  };

  console.log('[track]', JSON.stringify(safeEvent));

  const webhookUrl = env.TRACKING_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeEvent),
      });
    } catch (e) {
      console.error('[track webhook fail]', e.message);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: CORS });
}

export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}