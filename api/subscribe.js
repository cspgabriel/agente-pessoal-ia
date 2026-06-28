// /api/subscribe — Adiciona email na lista do Brevo + dispara welcome
// Variáveis de ambiente necessárias:
//   BREVO_API_KEY        — API key Brevo (obrigatório)
//   BREVO_LIST_ID        — ID da lista de contatos (opcional; padrão = null)
//   BREVO_WELCOME_TEMPLATE_ID — Template do email de boas-vindas (opcional)
//   BREVO_FROM_EMAIL     — Email remetente (padrão: contato@agenciarmktdigital.com.br)
//   BREVO_FROM_NAME      — Nome do remetente (padrão: AgenciAR Digital)
//   REDIRECT_URL         — URL para redirecionar após sucesso (padrão: /portal.html)

export default async function handler(req, res) {
  // CORS — aceita chamadas do próprio domínio e localhost em dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse body (Vercel já parseia JSON automaticamente quando Content-Type é application/json)
  let email, source = 'agente-pessoal-ia';
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    email = (body.email || '').trim().toLowerCase();
    if (body.source) source = String(body.source).slice(0, 64);
  } catch (e) {
    return res.status(400).json({ error: 'Body inválido' });
  }

  // Validação de email (RFC 5322 simplificada)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email) || email.length > 254) {
    return res.status(400).json({ ok: false, error: 'Email inválido' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY não configurada');
    return res.status(500).json({ ok: false, error: 'Configuração ausente no servidor' });
  }

  // ─── 1. Cria/atualiza contato na Brevo ───
  const listIds = process.env.BREVO_LIST_ID ? [parseInt(process.env.BREVO_LIST_ID, 10)] : [];
  const contactPayload = {
    email,
    attributes: {
      SOURCE: source,
      SIGNUP_AT: new Date().toISOString(),
    },
    listIds,
    updateEnabled: true, // atualiza se já existe
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
      // 204 = criado, 200 = já existia e foi atualizado — qualquer outro = erro
      // 400 com "duplicate_parameter" não é erro fatal (significa que já existe)
      let parsed;
      try { parsed = JSON.parse(errText); } catch { parsed = { message: errText }; }
      if (parsed.code !== 'duplicate_parameter') {
        console.error('Brevo contacts error:', contactRes.status, errText);
        return res.status(502).json({
          ok: false,
          error: 'Falha ao registrar email',
          detail: parsed.message || errText,
        });
      }
    }
  } catch (e) {
    console.error('Brevo contacts fetch falhou:', e.message);
    return res.status(502).json({ ok: false, error: 'Falha de rede com Brevo' });
  }

  // ─── 2. Dispara email de boas-vindas (se template configurado) ───
  const welcomeTemplateId = process.env.BREVO_WELCOME_TEMPLATE_ID;
  if (welcomeTemplateId) {
    try {
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
            DOWNLOAD_URL: (req.headers.origin || 'https://agente-pessoal-ia.vercel.app') + '/portal.html',
          },
        }),
      });
    } catch (e) {
      // Falha no email não bloqueia o signup — loga e segue
      console.error('Welcome email falhou (não bloqueante):', e.message);
    }
  }

  return res.status(200).json({
    ok: true,
    email,
    redirect: process.env.REDIRECT_URL || '/portal.html',
  });
}