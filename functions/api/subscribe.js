// /api/subscribe — Adiciona email na lista do Brevo + dispara welcome
// Cloudflare Pages Function (V8 isolate, Edge runtime)
//
// Bindings (configure no wrangler.toml ou dashboard):
//   BREVO_API_KEY        — API key Brevo (secret, obrigatório)
//   BREVO_LIST_ID        — ID da lista de contatos (var)
//   BREVO_WELCOME_TEMPLATE_ID — Template do email de boas-vindas (var)
//   BREVO_FROM_EMAIL     — Email remetente (var, default: gabriel@agenciarmktdigital.com.br)
//   BREVO_FROM_NAME      — Nome do remetente (var, default: AgenciAR Digital)
//   REDIRECT_URL         — URL para redirecionar após sucesso (var, default: /portal.html)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // ─── Parse + valida body ───
  let email, source = 'agente-pessoal-ia', body = {};
  try {
    body = await request.json();
    email = String(body.email || '').trim().toLowerCase();
    if (body.source) source = String(body.source).slice(0, 64);
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email) || email.length > 254) {
    return json({ ok: false, error: 'Email inválido' }, 400);
  }

  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY não configurada');
    return json({ ok: false, error: 'Configuração ausente no servidor' }, 500);
  }

  // ─── 1. Cria/atualiza contato na Brevo ───
  const listIds = env.BREVO_LIST_ID ? [parseInt(env.BREVO_LIST_ID, 10)] : [];
  const contactPayload = {
    email,
    attributes: {
      SOURCE: source,
      SIGNUP_AT: new Date().toISOString(),
      UTM_SOURCE:   body.utm_source   || '',
      UTM_MEDIUM:   body.utm_medium   || '',
      UTM_CAMPAIGN: body.utm_campaign || '',
      UTM_CONTENT:  body.utm_content  || '',
      UTM_TERM:     body.utm_term     || '',
      REFERRER:     body.referrer     || '',
    },
    listIds,
    updateEnabled: true,
  };

  try {
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });

    if (!contactRes.ok && contactRes.status !== 204) {
      const errText = await contactRes.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch { parsed = { message: errText }; }
      if (parsed.code !== 'duplicate_parameter') {
        console.error('Brevo contacts error:', contactRes.status, errText);
        return json({ ok: false, error: 'Falha ao registrar email', detail: parsed.message || errText }, 502);
      }
    }
  } catch (e) {
    console.error('Brevo contacts fetch falhou:', e.message);
    return json({ ok: false, error: 'Falha de rede com Brevo' }, 502);
  }

  // ─── 2. Welcome email (opcional) ───
  const welcomeTemplateId = env.BREVO_WELCOME_TEMPLATE_ID;
  if (welcomeTemplateId) {
    try {
      const origin = request.headers.get('origin') || 'https://agente-pessoal-ia.pages.dev';
      const downloadUrl = env.REDIRECT_URL
        ? env.REDIRECT_URL
        : (origin.replace(/\/$/, '') + '/portal.html');

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [{ email }],
          templateId: parseInt(welcomeTemplateId, 10),
          params: {
            EMAIL: email,
            SOURCE: source,
            DOWNLOAD_URL: downloadUrl,
          },
        }),
      });
    } catch (e) {
      console.error('Welcome email falhou (não bloqueante):', e.message);
    }
  }

  return json({
    ok: true,
    email,
    redirect: env.REDIRECT_URL || '/portal.html',
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: CORS });
}

export async function onRequest() {
  return json({ error: 'Method not allowed' }, 405);
}