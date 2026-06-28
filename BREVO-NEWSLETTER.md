# Integração Brevo + Estratégia de Newsletter — Agente Pessoal de IA

> Documentação completa da integração com Brevo (ex-Sendinblue): endpoints, contatos, listas, templates, automações, webhooks, estratégia de email marketing.

**Última atualização:** 2026-06-28
**Conta Brevo:** agenciarmktdigital.com.br (cspgabriel)
**API:** v3 (https://api.brevo.com/v3)
**Remetente padrão:** `contato@agenciarmktdigital.com.br` · `AgenciAR Digital`

---

## 📋 Índice

1. [Setup da conta Brevo](#setup-da-conta-brevo)
2. [Endpoint de signup](#endpoint-de-signup)
3. [Listas](#listas)
4. [Templates transacionais](#templates-transacionais)
5. [Campanhas de newsletter](#campanhas-de-newsletter)
6. [Automações visuais](#automacoes-visuais)
7. [Webhooks](#webhooks)
8. [Estratégia de email marketing](#estrategia-de-email-marketing)
9. [Compliance LGPD](#compliance-lgpd)
10. [Limites do plano free](#limites-do-plano-free)

---

## 🔧 Setup da conta Brevo

### Credenciais (NUNCA imprimir em logs/commits)
- **API Key:** armazenada em `hermes-agente-gabriel/hermes/credenciais/brevo_api_key.txt`
- **IP whitelist:** desabilitar em https://app.brevo.com/security/authorised_ips (toggle "Allow API calls without authorized IPs")

### Remetentes verificados
| Email | Nome | Status |
|---|---|---|
| `contato@agenciarmktdigital.com.br` | AgenciAR Digital | ✅ Verificado (default) |
| `gabriel@criacaodesitesbr.com` | AgenciAR | ✅ Verificado (skill antiga) |

**Como adicionar novo remetente:**
1. https://app.brevo.com/settings/senders
2. Add sender → colocar email → confirmar via link do email recebido
3. Aguardar verificação (~5 min)

---

## 🔌 Endpoint de signup

### `POST /api/subscribe` (Vercel Serverless)

Ver detalhes completos em [ESPECIFICACOES.md](./ESPECIFICACOES.md#-api-endpoint-post-apisubscribe).

**Resumo:** recebe `{email, source}` no body, cria contato na Brevo, opcionalmente dispara welcome email, retorna `{ok, redirect}`.

### Atributos custom armazenados em cada contato
```javascript
{
  SOURCE: "agente-pessoal-ia-landing",  // origem do signup
  SIGNUP_AT: "2026-06-28T20:30:00.000Z" // ISO 8601 UTC
}
```

Esses atributos permitem:
- Segmentar campanhas por SOURCE (utm_source)
- Calcular LTV por canal de aquisição
- Identificar leads "quentes" vs "frios"

---

## 📋 Listas

### O que são
Listas são agrupamentos de contatos para envio segmentado. Cada contato pode estar em N listas.

### Lista padrão deste projeto
- **Nome:** `Agente Pessoal — Leads`
- **Folder:** `AgenciAR > Iscas Digitais`
- **ID:** configurado em `BREVO_LIST_ID` env var

### Como criar (via API)
```bash
curl -X POST "https://api.brevo.com/v3/lists" \
  -H "api-key: $BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente Pessoal — Leads",
    "folderId": 1
  }'
```

**Response:**
```json
{
  "id": 42,
  "name": "Agente Pessoal — Leads"
}
```

### Como criar (via dashboard)
1. https://app.brevo.com/contact/list → "Create a list"
2. Nome: `Agente Pessoal — Leads`
3. Folder: criar `Iscas Digitais` se não existir
4. Salvar → copiar ID

### Listar todas as listas
```bash
curl "https://api.brevo.com/v3/lists?limit=50" \
  -H "api-key: $BREVO_API_KEY"
```

---

## 📧 Templates transacionais

### O que são
Templates de email transacional (welcome, confirmação, magic link) enviados via SMTP API. Diferente de campanhas, são disparados evento-a-evento.

### Template de Welcome (recomendado criar)

**Via dashboard:**
1. https://app.brevo.com/camp/lists/template → "Email templates" → "Create a new template"
2. Tipo: **Classic** (não AMP — pra compat)
3. Assunto: `🤖 Seu Agente Pessoal de IA está pronto — baixe aqui`
4. HTML body (sugestão):

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">🤖 Seu Agente Está Pronto</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
    <p>Oi!</p>
    <p>Boa notícia: sua célula de 3 mentores de IA tá te esperando pra começar.</p>
    <p><strong>Como usar:</strong></p>
    <ol>
      <li>Acesse o portal: <a href="{{params.DOWNLOAD_URL}}">{{params.DOWNLOAD_URL}}</a></li>
      <li>Baixe os 5 arquivos (1 agente principal + 3 bônus + 1 prompt mestre)</li>
      <li>Cole no ChatGPT, Claude ou Gemini</li>
      <li>Responda 6 perguntas</li>
      <li>Receba seu agente personalizado em 15 minutos</li>
    </ol>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{params.DOWNLOAD_URL}}" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        🚀 ACESSAR MEU KIT
      </a>
    </p>
    <p>Qualquer dúvida, responde esse email.</p>
    <p>— Gabriel · AgenciAR</p>
  </div>
</body>
</html>
```

5. Salvar → copiar ID
6. Configurar `BREVO_WELCOME_TEMPLATE_ID` no Vercel

### Como disparar (via API)
```bash
curl -X POST "https://api.brevo.com/v3/smtp/email" \
  -H "api-key: $BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "user@example.com"}],
    "templateId": 7,
    "params": {
      "EMAIL": "user@example.com",
      "DOWNLOAD_URL": "https://agente-pessoal-ia.vercel.app/portal.html"
    }
  }'
```

**No nosso fluxo:** o `/api/subscribe` já faz isso automaticamente se a env var estiver configurada.

---

## 📰 Campanhas de newsletter

### O que são
Campanhas são emails marketing agendados, enviados em massa pra uma lista. Diferente de transacional, são agendados e podem ter A/B test.

### Tipos suportados pela API Brevo
- **Standard campaign** — email único, agendado
- **A/B test campaign** — testa 2-4 versões, escolhe vencedora
- **Trigger campaign** — disparada por evento (signup, abandono de carrinho)

### Criar campanha via API
```bash
curl -X POST "https://api.brevo.com/v3/emailCampaigns" \
  -H "api-key: $BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Newsletter #1 — Agentes de IA na prática",
    "subject": "Como criar seu primeiro agente em 15min",
    "sender": {"name": "Gabriel · AgenciAR", "email": "gabriel@agenciarmktdigital.com.br"},
    "type": "classic",
    "status": "draft",
    "htmlContent": "<h1>...</h1>",
    "recipients": {"listIds": [42]}
  }'
```

### Agendar envio
```bash
curl -X POST "https://api.brevo.com/v3/emailCampaigns/{campaignId}/sendNow" \
  -H "api-key: $BREVO_API_KEY"
```

### Via dashboard (mais fácil pra começar)
1. https://app.brevo.com/camp/list → "Create an email campaign"
2. Tipo: **Standard**
3. Escolher lista: `Agente Pessoal — Leads`
4. Escolher template ou criar do zero
5. Preview → Test → Schedule

---

## 🤖 Automações visuais

### O que são
Workflows drag-and-drop que disparam emails baseado em eventos (signup, open, click, tempo). Mais poderosos que campanhas pontuais.

### Recomendação: "Welcome + Nurture 14 dias"

**Documentação oficial Brevo:** https://help.brevo.com/hc/en-us/articles/360000418170-Creating-an-automation-workflow

![Brevo automation docs](https://help.brevo.com/hc/en-us/articles/360000418170-Creating-an-automation-workflow)

**Como criar (drag-and-drop no dashboard):**

1. https://app.brevo.com/automation/list → "Create a workflow"
2. Tipo: **"Welcome new contacts"** (template pré-pronto)
3. Customizar etapas:

```
[Trigger: Contact added to list "Agente Pessoal — Leads"]
        ↓
[Wait: 0 minutes]
        ↓
[Send Email: "Boas-vindas + link de download"] (template de welcome)
        ↓
[Wait: 2 days]
        ↓
[Condition: Contact opened welcome email?]
   ├─ YES → [Send: "5 ideias de agentes pra criar hoje"]
   └─ NO  → [Send: "Esqueceu de baixar? Aqui tá o link"]
        ↓
[Wait: 5 days]
        ↓
[Send: "Caso real: como X economizou 8h/semana"]
        ↓
[Wait: 7 days]
        ↓
[Send: "Quer ajuda profissional? Conheça a AgenciAR"]
        ↓
[END — adicionar tag "nurture-completed"]
```

4. Ativar workflow
5. Cada signup dispara automaticamente

**Tags de saída úteis:**
- `nurture-active`
- `nurture-completed`
- `engaged` (abriu 3+ emails)
- `cold` (não abriu nenhum)
- `clicked-cta` (clicou no link da AgenciAR)

**Passo-a-passo detalhado (com prints):**

| # | Onde | O que fazer | Screenshot |
|---|---|---|---|
| 1 | https://app.brevo.com/automation/list | Clicar em "Create a workflow" | — |
| 2 | Tela de templates | Escolher **"Welcome new contacts"** | — |
| 3 | Editor visual | Adicionar steps arrastando blocos da sidebar esquerda | — |
| 4 | Step "Send email" | Selecionar template "Welcome" (criado anteriormente) | — |
| 5 | Step "Wait" | Definir delay (ex: 2 days) | — |
| 6 | Step "Condition" | "If contact opened previous email" → Yes/No branch | — |
| 7 | Step "Add tag" | Adicionar `nurture-active` no fim | — |
| 8 | Top-right | Clicar "Activate" | — |

**Dica:** após ativar, teste com seu próprio email (adicione na lista manualmente) pra ver o flow completo antes de ir pro ar.

---

## 🔗 Webhooks

### O que são
Notificações que a Brevo envia pra uma URL quando eventos acontecem (open, click, bounce, unsubscribe).

### Eventos suportados
- `delivered` — email entregue
- `open` — email aberto
- `click` — link clicado
- `bounce` — bounce (hard/soft)
- `spam` — marcado como spam
- `unsubscribe` — descadastro
- `list_add` — adicionado a uma lista

### Como configurar
1. https://app.brevo.com/webhooks → "Create webhook"
2. URL: `https://hooks.agenciarmktdigital.com.br/brevo` (ou ngrok pra dev)
3. Eventos: marcar todos que interessam
4. Secret: gerar HMAC key (pra verificar assinatura)
5. Salvar

### Exemplo de handler (futuro)
```javascript
// /api/brevo-webhook.js
export default async function handler(req, res) {
  const signature = req.headers['x-brevo-signature'];
  const body = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET)
                         .update(body).digest('hex');
  if (signature !== expected) return res.status(401).end();

  const { event, email } = req.body;
  // Salvar no Supabase/Sheets pra analytics
  await saveEvent({ event, email, timestamp: new Date() });
  res.status(200).end();
}
```

**Por que implementar:** permite nurturing comportamental (só mandar oferta pra quem abriu 3+ emails).

---

## 📈 Estratégia de email marketing

### Curto prazo (MVP — 0 a 30 dias)

**Objetivo:** validar interesse + construir lista

**Ações:**
1. ✅ Welcome email imediato (template de boas-vindas com link)
2. ⏳ Nurture 14 dias (automation visual com 5 emails)
3. ⏳ Newsletter quinzenal (cases, dicas, novidades)

**Métricas alvo:**
- Open rate: > 25%
- Click rate: > 3%
- Unsubscribe: < 0.5%

### Médio prazo (30-90 dias)

**Objetivo:** converter leads frios em clientes

**Ações:**
4. Segmentar lista por engajamento (engaged / cold / dormant)
5. Re-engagement campaign pra cold leads (3 emails em 30 dias)
6. Apresentar serviços AgenciAR nos emails 4-5 do nurture
7. Integração com WhatsApp (Brevo Conversations)
8. A/B test de assunto (testar 2 versões, mandar vencedora pro resto)

### Longo prazo (90+ dias)

**Objetivo:** escalar e automatizar

**Ações:**
9. Lead scoring (pontuação baseada em comportamento)
10. SMS via Brevo (pra hot leads)
11. Integração com CRM (Hubspot, Pipedrive, etc)
12. Personalização dinâmica baseada em atributos

---

## ⚖️ Compliance LGPD

### Requisitos legais
- ✅ Consentimento explícito (form opt-in)
- ⏳ Double opt-in (configurar na lista Brevo — Settings → Confirmation email)
- ✅ Link de unsubscribe em todo email (Brevo inclui automaticamente)
- ⏳ Política de privacidade publicada (link no footer dos emails)
- ⏳ Registro de tratamento de dados (empresa)
- ⏳ DPO (Data Protection Officer) designado

### Como configurar double opt-in
1. https://app.brevo.com/list → escolher lista → Settings
2. "Double opt-in" → **ON**
3. Customize o email de confirmação

**Efeito:** novo contato recebe email "Confirme sua inscrição" antes de entrar na lista. Reduz bounces e melhora deliverability.

---

## 💰 Limites do plano Free

| Recurso | Limite Free |
|---|---|
| **Emails transacionais** | 300/dia (depois disso, falha silenciosa) |
| **Contatos armazenados** | Ilimitado |
| **Listas** | Ilimitado |
| **Templates** | Ilimitado |
| **Automações** | Até 2 ativas simultaneamente |
| **Campanhas/mês** | Ilimitado (mas limitado pelo quota diário) |
| **Webhooks** | Ilimitado |
| **Suporte** | Email (resposta em 24-48h) |

### Quando fazer upgrade?
- **Mais de 300 emails/dia** (campanha grande ou alto tráfego)
- **Mais de 2 automações ativas** (workflows complexos)
- **Remover marca Brevo** dos emails (plano Starter remove)

**Custo Starter:** ~$25/mês (cobrado em EUR). Vale a pena a partir de 1000 leads/mês.

---

## 🔌 API Brevo — Referência rápida

### Headers padrão
```bash
-H "api-key: $BREVO_API_KEY"
-H "Content-Type: application/json"
-H "Accept: application/json"
```

### Endpoints usados neste projeto
| Método | Endpoint | Uso |
|---|---|---|
| POST | `/v3/contacts` | Criar/atualizar contato |
| POST | `/v3/smtp/email` | Disparar welcome transacional |
| GET | `/v3/lists` | Listar listas |
| POST | `/v3/lists` | Criar lista |
| POST | `/v3/emailCampaigns` | Criar campanha |
| POST | `/v3/smtp/templates` | Criar template |

### Endpoints úteis pra futuro
| Método | Endpoint | Uso |
|---|---|---|
| GET | `/v3/contacts/{email}` | Buscar contato por email |
| PUT | `/v3/contacts/{email}` | Atualizar atributos |
| POST | `/v3/contacts/lists` | Adicionar contato a lista |
| GET | `/v3/smtp/statistics` | Stats de envio |
| POST | `/v3/automation` | Criar automation |
| GET | `/v3/webhooks` | Listar webhooks |

**Documentação oficial:** https://developers.brevo.com/reference

---

> Para detalhes técnicos do endpoint serverless, ver [ESPECIFICACOES.md](./ESPECIFICACOES.md).
> Para deploy e env vars, ver [DEPLOY.md](./DEPLOY.md).