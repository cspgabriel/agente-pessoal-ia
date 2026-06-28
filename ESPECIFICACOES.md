# Especificações Técnicas — Agente Pessoal de IA

> Documentação técnica detalhada: arquitetura, endpoints, payloads, validações, segurança, fluxos.

**Versão:** 1.0
**Data:** 2026-06-28
**Stack:** HTML/CSS/JS vanilla + Node.js serverless + Brevo API v3
**Hospedagem:** Vercel (static + 1 function)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO (Browser)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1. GET /
                             ▼
                  ┌──────────────────────┐
                  │   Vercel Edge CDN    │
                  │   (static assets)    │
                  └──────────┬───────────┘
                             │
                             │ 2. Serve index.html (39KB)
                             ▼
                  ┌──────────────────────┐
                  │   index.html         │
                  │   (landing page)     │
                  └──────────┬───────────┘
                             │
                             │ 3. User submits email form
                             │    POST /api/subscribe
                             ▼
                  ┌──────────────────────┐
                  │   Vercel Serverless  │
                  │   /api/subscribe.js  │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────────┐
        │  Brevo API   │         │  Brevo SMTP      │
        │  /v3/contacts│         │  /v3/smtp/email  │
        │  (cria       │         │  (welcome        │
        │  contato)    │         │  template)       │
        └──────┬───────┘         └────────┬─────────┘
               │                          │
               └──────────┬───────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  Response JSON       │
                │  { ok, redirect }    │
                └──────────┬───────────┘
                           │
                           │ 4. Client redirects
                           ▼
                ┌──────────────────────┐
                │   portal.html        │
                │   (download page)    │
                └──────────────────────┘
```

---

## 🌐 URLs & Rotas

| Rota | Método | Tipo | Auth | Descrição |
|---|---|---|---|---|
| `/` | GET | Static | — | Landing page |
| `/portal.html` | GET | Static | — | Portal de download (param: `?email=`) |
| `/dashboard-data.json` | GET | Static | — | Dados mock do dashboard de runs |
| `/api/subscribe` | POST | Serverless | API Key env | Cria contato na Brevo + welcome |
| `/api/subscribe` | GET/OUTROS | Serverless | — | Retorna 405 |

**Domínio produção:** `https://agente-pessoal-ia.vercel.app`
**Aliases Vercel:**
- `agente-pessoal-b27htwqzq-cspgabriels-projects.vercel.app` (original deploy)
- `agente-pessoal-pdzw23jxi-cspgabriels-projects.vercel.app` (após force redeploy)

---

## 🔌 API Endpoint: `POST /api/subscribe`

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "source": "agente-pessoal-ia-landing"
}
```

| Campo | Tipo | Obrigatório | Validação | Notas |
|---|---|---|---|---|
| `email` | string | ✅ sim | RFC 5322 simplificado, max 254 chars | Lowercase aplicado |
| `source` | string | ❌ não | Max 64 chars | Default: `'agente-pessoal-ia'` |

**Regex de validação de email:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Response — Sucesso (200)

```json
{
  "ok": true,
  "email": "user@example.com",
  "redirect": "/portal.html"
}
```

### Response — Erros

| Status | Body | Causa |
|---|---|---|
| 400 | `{"ok":false,"error":"Email inválido"}` | Email vazio ou formato inválido |
| 400 | `{"ok":false,"error":"Body inválido"}` | JSON malformado |
| 405 | `{"error":"Method not allowed"}` | Método ≠ POST |
| 500 | `{"ok":false,"error":"Configuração ausente no servidor"}` | `BREVO_API_KEY` não configurada |
| 502 | `{"ok":false,"error":"Falha ao registrar email","detail":"..."}` | Brevo API rejeitou (ex: IP whitelist) |
| 502 | `{"ok":false,"error":"Falha de rede com Brevo"}` | Network/timeout na chamada Brevo |

### Comportamentos especiais

- **CORS:** Aceita `*` (qualquer origem). Em produção real, restringir ao domínio.
- **Duplicatas:** Brevo retorna `code: 'duplicate_parameter'` se o email já existe. A função trata como sucesso (200 OK) — comportamento idempotente.
- **Welcome email:** Se `BREVO_WELCOME_TEMPLATE_ID` configurado, dispara via SMTP. Falha aqui NÃO bloqueia o signup (loga e segue).

---

## 🛡️ Segurança

### Validações implementadas
- ✅ Email regex (RFC 5322 simplificado)
- ✅ Tamanho máximo do email (254 chars)
- ✅ Tamanho máximo do source (64 chars)
- ✅ Método HTTP restrito a POST
- ✅ CORS permissivo (ajustar pra domínio em produção)

### Não implementado (TODO)
- ⏳ Rate limiting por IP (Brevo free tier permite 300 emails/dia total)
- ⏳ reCAPTCHA / hCaptcha no form (proteção contra bots)
- ⏳ Honeypot field (campo invisível que bots preenchem)
- ⏳ Confirmação de opt-in (double opt-in via Brevo)
- ⏳ Assinatura de webhook Brevo (HMAC-SHA256)

### Variáveis sensíveis
| Env var | Onde fica | Quem acessa |
|---|---|---|
| `BREVO_API_KEY` | Vercel Dashboard → Settings → Environment Variables | Apenas serverless function |

**Nunca** comitar API key. Nunca expor no client-side. Nunca logar em responses.

---

## 📊 Brevo API — Endpoints usados

| Endpoint Brevo | Método | Quando | Payload |
|---|---|---|---|
| `/v3/contacts` | POST | Em todo signup | `{ email, attributes, listIds, updateEnabled }` |
| `/v3/smtp/email` | POST | Quando `BREVO_WELCOME_TEMPLATE_ID` configurado | `{ to, templateId, params }` |

### Atributos custom armazenados no contato
```javascript
attributes: {
  SOURCE: source,                    // ex: "agente-pessoal-ia-landing"
  SIGNUP_AT: new Date().toISOString() // ISO 8601 UTC
}
```

### Listas
- Se `BREVO_LIST_ID` configurado: contato é adicionado à lista específica
- Se não: contato fica "sem lista" (aparece no dashboard Brevo → Contacts → All contacts)

---

## 🎨 Frontend

### Stack
- **HTML5** puro (sem framework)
- **CSS3** com variáveis (`--cyan`, `--bg`, etc), animações (`@keyframes shimmer`, `floatGlow`, `ctaPulse`)
- **JS vanilla** (sem build step)
- **Fontes:** Plus Jakarta Sans (corpo) + JetBrains Mono (código)
- **Sem dependências externas em runtime** (fonts vêm do Google Fonts CDN)

### Estrutura da landing (`index.html`)

```
<header>          → Nav fixa com toggle de tabs (Landing | Dashboard)
<section.hero>    → Headline + sub + 2 CTAs
<section.dor>     → 3 pain cards (problema)
<section.solucao> → 3 step cards (como funciona)
<section.prova>   → 4 stats + 3 testemunhos
<section.bonus>   → 3 bonus cards
<section.metodo>  → Stack de 5 frameworks
<section.faq>     → 6 perguntas/respostas accordion
<section#cta-form> → Form de captura de email
<footer>          → Copyright
```

### Tabs (`.tab-pane`)
1. **`tab-landing`** (default) — toda a copy de venda
2. **`tab-dashboard`** — dashboard mock com stats + runs (proof of value)

### JS functions
| Função | Onde | O que faz |
|---|---|---|
| `handleLead()` | `index.html` (linha 523) | Valida email, POST em `/api/subscribe`, redireciona |
| Dashboard data fetcher | `index.html` (linha 537) | Fetch `dashboard-data.json`, renderiza stats e runs |
| Tab system | `index.html` (linha 474) | Toggle entre Landing e Dashboard |
| Terminal typewriter | `index.html` (linha 484) | Animação de digitação em terminais `.term-line` |
| Intersection Observer | `index.html` (linha 500) | Reveal on scroll + stack box animation |

---

## 🧪 Testes

### Smoke test manual (após deploy)
```powershell
$body = '{"email":"teste@gabriel-test.com","source":"smoke-test"}'
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$req = [System.Net.HttpWebRequest]::Create("https://agente-pessoal-ia.vercel.app/api/subscribe")
$req.Method = "POST"; $req.ContentType = "application/json"
$req.GetRequestStream().Write($bytes, 0, $bytes.Length); $req.GetRequestStream().Close()
$resp = $req.GetResponse()
$reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
Write-Host "STATUS: $([int]$resp.StatusCode)"
Write-Host "BODY: $($reader.ReadToEnd())"
```

**Esperado:** `STATUS: 200` + `BODY: {"ok":true,...}`

### Casos de teste
| Cenário | Input | Status esperado |
|---|---|---|
| Email válido, novo | `teste1@exemplo.com` | 200 |
| Email válido, duplicado | (mesmo email acima) | 200 (idempotente) |
| Email sem @ | `testeexemplo.com` | 400 |
| Email vazio | `""` | 400 |
| Body vazio | `{}` | 400 |
| Body malformado | `{email:` | 400 |
| Método GET | — | 405 |
| Email com 255 chars | `a@b.c` + 246 chars | 400 (max 254) |

---

## 📐 Limites & Quotas

### Vercel Free Tier
- **Bandwidth:** 100GB/mês
- **Serverless executions:** 100GB-Hrs/mês
- **Function duration:** 10s max
- **Cold start:** ~500ms-2s
- **Domínios:** ilimitados em `.vercel.app`

### Brevo Free Tier
- **Emails transacionais:** 300/dia (degrada silenciosamente acima)
- **Contatos armazenados:** ilimitado
- **Listas:** ilimitado
- **Automações visuais:** até 2 workflows ativos

### Limites práticos do projeto
- **Form submits/dia:** até ~10.000 antes de qualquer rate limiting
- **Cold start:** 1ª chamada após deploy é mais lenta (~2s)
- **Concurrent requests:** ~50 simultâneas (limite Vercel)

---

## 🐛 Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| API retorna 500 "Configuração ausente" | `BREVO_API_KEY` não configurada ou deploy cacheado | `vercel --prod --force` |
| API retorna 502 "unrecognised IP address" | Brevo IP whitelist ativo | Ativar toggle no dashboard Brevo |
| Landing carrega mas form não envia | CORS bloqueando ou função offline | Verificar Vercel Dashboard → Functions |
| Portal mostra email mas botões não baixam | CORS bloqueando GitHub raw | GitHub raw serve com CORS aberto por padrão |
| Dashboard tab vazia | `dashboard-data.json` com erro de sintaxe | Validar JSON em jsonlint.com |

Ver mais em [DEPLOY.md](./DEPLOY.md).

---

## 🔮 Roadmap técnico

**Curto prazo (1-2 sprints):**
- [ ] Rate limiting por IP no `/api/subscribe`
- [ ] Honeypot field + hCaptcha
- [ ] Double opt-in via Brevo (config de lista)
- [ ] Pixel tracking no portal.html

**Médio prazo (1-2 meses):**
- [ ] Custom domain `agente.agenciarmktdigital.com.br`
- [ ] A/B test de copy da landing (2 versões, split 50/50)
- [ ] Pixel de Facebook / Google Ads para retargeting
- [ ] PWA (instalável no celular)

**Longo prazo:**
- [ ] App mobile nativo (React Native + Expo)
- [ ] Integração com WhatsApp Business API (Brevo Conversations)
- [ ] Dashboard real (Subabase + PostHog para eventos)

---

> Mantido por Agente Hermes — atualizações em [CHANGELOG.md](./CHANGELOG.md)