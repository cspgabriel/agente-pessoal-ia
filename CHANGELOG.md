# Changelog — Agente Pessoal de IA

> Histórico de versões e ativações do projeto.

**Formato:** [Data] — Tipo: Descrição
**Convenção de versionamento:** SemVer (MAJOR.MINOR.PATCH)

---

## [Unreleased] — 2026-06-28

### ✨ Adicionado
- **Serverless endpoint `/api/subscribe`** — captura emails via Brevo API v3
- **Integração Brevo** — env var `BREVO_API_KEY` configurada em Vercel Production
- **Documentação completa** — `README.md`, `ESPECIFICACOES.md`, `DEPLOY.md`, `BREVO-NEWSLETTER.md`, `CHANGELOG.md`
- **Validações de segurança** — regex email, method restriction, validação de payload
- **CORS** configurado (permissivo, ajustável pra domínio em produção)
- **Tratamento de duplicatas** — idempotência via `updateEnabled: true` + check de `duplicate_parameter`
- **Source tracking** — atributo `SOURCE` armazenado em cada contato Brevo
- **Timestamp tracking** — atributo `SIGNUP_AT` em ISO 8601 UTC
- **Welcome email opcional** — env var `BREVO_WELCOME_TEMPLATE_ID` habilita SMTP transacional
- **Failure resilience** — falha no welcome não bloqueia signup
- **Skill Brevo atualizada** — nota sobre IP whitelist desabilitar pra serverless
- **Card na Vitrine** — adicionado em `cspgabriel/Vitrine-de-Agentes-IA` (commit `77112d9`)

### 🔄 Modificado
- **`index.html` handleLead()** — convertido de redirect-only para POST + redirect (async)
- **`portal.html`** — preservado estado original
- **`README.md`** — reescrito completamente, agora com índice de docs e status atual

### 🐛 Corrigido
- **Cache de env var no deploy** — necessário `vercel --prod --force` para Vercel pegar env vars novas

### 📝 Documentação
- README.md reescrito (113 → 230+ linhas)
- ESPECIFICACOES.md criado (arquitetura, endpoints, payloads, segurança)
- DEPLOY.md criado (setup, env vars, troubleshooting, manutenção)
- BREVO-NEWSLETTER.md criado (integração completa + estratégia)

---

## [1.0.0] — 2026-06-28 (initial release)

### ✨ Adicionado
- Landing page completa (index.html, 574 linhas, 39KB)
- Portal de download (portal.html, 5.6KB)
- Dashboard mock com stats fictícias (dashboard-data.json)
- Config Vercel (vercel.json com `cleanUrls: true`)
- Package.json com script `serve` local
- 5 arquivos de produto em `produto/`:
  - AGENTE-PESSOAL-IA.md (311 linhas, 12KB) — agente completo
  - PROMPT-MESTRE.md (5.7KB) — versão compacta
  - BONUS-01-CRIAR-AGENTES.md (11.5KB) — manual + 10 exemplos
  - BONUS-02-AGENDAR-TAREFAS.md (9.5KB) — 20 tarefas + agenda
  - BONUS-03-PROMPTS-PRONTOS.md (16KB) — 50 prompts prontos
- Tema dark/cyan premium com animações
- Responsivo (mobile-first)
- SEO meta tags (title, description)
- README.md inicial (113 linhas)

### 🚀 Deploy
- **URL:** https://agente-pessoal-ia.vercel.app
- **Domínio alias:** `agente-pessoal-<hash>-cspgabriels-projects.vercel.app`
- **Status:** 🟢 LIVE

### 📦 Repo
- **GitHub:** https://github.com/cspgabriel/agente-pessoal-ia
- **Branch:** `master`
- **Commits iniciais:** `c88a2de` (initial)

---

## 🗺️ Roadmap

### v1.1 — Curto prazo
- [ ] IP whitelist Brevo desabilitado (1 click Gabriel)
- [ ] Lista dedicada "Agente Pessoal — Leads" no Brevo
- [ ] Template de welcome com link de download
- [ ] Welcome automation "Nurture 14 dias"
- [ ] Pixel tracking no portal.html
- [ ] UTM source tracking em CTAs
- [ ] Email real testado end-to-end

### v1.2 — Médio prazo
- [ ] Rate limiting por IP
- [ ] reCAPTCHA v3 / hCaptcha
- [ ] Double opt-in Brevo
- [ ] Custom domain `agente.agenciarmktdigital.com.br`
- [ ] A/B testing de copy

### v2.0 — Longo prazo
- [ ] App mobile (React Native + Expo)
- [ ] Integração WhatsApp Business
- [ ] Dashboard real (Supabase + PostHog)
- [ ] Lead scoring automatizado
- [ ] Webhooks Brevo → storage externo

---

> Para detalhes técnicos, ver [ESPECIFICACOES.md](./ESPECIFICACOES.md).