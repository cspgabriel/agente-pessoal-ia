// /api/track — Tracking serverless de eventos (downloads, pageviews)
// Salva no log do Vercel (visível em `vercel logs`).
// Variáveis de ambiente opcionais:
//   TRACKING_WEBHOOK_URL — POST adicional pra endpoint externo (Supabase, Sheets, etc)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let event;
  try {
    event = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ ok: false, error: 'Body inválido' });
  }

  // Sanitizar event
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
    ip: (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '').toString().split(',')[0].trim(),
    ua: (req.headers['user-agent'] || '').slice(0, 256),
  };

  // Log estruturado (visível em `vercel logs`)
  console.log('[track]', JSON.stringify(safeEvent));

  // Webhook externo opcional (Supabase, Sheets, etc)
  const webhookUrl = process.env.TRACKING_WEBHOOK_URL;
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

  return res.status(200).json({ ok: true });
}