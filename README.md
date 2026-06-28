# 🤖 Agente Pessoal de IA

> **Isca digital gratuita** da AgenciAR — célula de 3 mentores que ensina qualquer pessoa a criar seus próprios agentes de IA e automatizar tarefas.

**Status:** 🟢 LIVE em produção
**URL produção:** https://agente-pessoal-ia.vercel.app
**Repositório:** https://github.com/cspgabriel/agente-pessoal-ia
**Plataforma:** Vercel (static + 1 serverless function)
**Stack:** HTML/CSS/JS vanilla + Node.js serverless + Brevo API v3
**Última atualização:** 2026-06-28

---

## 📖 Documentação

Este README é a visão geral. Detalhes técnicos em arquivos separados:

| Doc | Conteúdo |
|---|---|
| [ESPECIFICACOES.md](./ESPECIFICACOES.md) | Arquitetura técnica, endpoints API, payloads, validações, segurança, fluxos |
| [DEPLOY.md](./DEPLOY.md) | Setup Vercel do zero, env vars, como fazer redeploy, troubleshooting |
| [BREVO-NEWSLETTER.md](./BREVO-NEWSLETTER.md) | Integração Brevo, listas, automações, estratégia de newsletter, webhooks |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de ativações e versões |
| [produto/](./produto/) | Os arquivos `.md` do produto que o usuário recebe por download |

---

## 🎯 O que é

Landing page com captura de email (Brevo) + portal de download de um **kit gratuito** de prompts + manuais. O conteúdo ensinia qualquer pessoa a:

- Criar agentes de IA personalizados para tarefas específicas
- Automatizar trabalho repetitivo (pesquisa, escrita, análise, organização)
- Orquestrar pipelines multi-agente
- Recuperar horas por semana delegando para IA

**Diferencial:** não é software — é **conhecimento ativável**. O usuário cola prompts prontos no ChatGPT (versão grátis funciona), Claude ou Gemini e sai com um agente personalizado.

---

## 🚦 Status atual (28/06/2026)

### ✅ Ativo e funcionando

| Componente | Status | Detalhes |
|---|---|---|
| Landing page (`/`) | 🟢 LIVE | 39KB, tema dark/cyan, animações, formulário captura |
| Portal de download (`/portal.html`) | 🟢 LIVE | Mostra email, links GitHub + diretos dos arquivos |
| Dashboard de runs (`/dashboard`) | 🟢 LIVE | Aba interna com stats fictícias de "agentes criados" (proof of value) |
| Serverless `/api/subscribe` | 🟢 Code OK | Endpoint POST que cria contato na Brevo |
| Brevo API key configurada | 🟢 OK | Env var `BREVO_API_KEY` em Vercel Production |
| Repositório público | 🟢 OK | GitHub, branch `master`, 2 commits |
| Deploy automático Vercel | 🟢 OK | Conectado ao GitHub, push em master = deploy |
| Domínio `agente-pessoal-ia.vercel.app` | 🟢 OK | Alias automático do Vercel |
| Card na Vitrine | 🟢 OK | Commit `77112d9` pushed em `cspgabriel/Vitrine-de-Agentes-IA` |

### ⏳ Pendente — 1 click do Gabriel

| Item | O que fazer | Onde |
|---|---|---|
| **IP whitelist Brevo** | Ativar toggle "Allow API calls without authorized IPs" | https://app.brevo.com/security/authorised_ips |

**Por quê:** Vercel serverless usa IPs dinâmicos (ex: `32.198.78.123`). Brevo rejeita por padrão. Ativando o toggle, qualquer IP dinâmico funciona. Mitigação de risco: API key NUNCA é exposta no client-side, sempre em server-side (env var).

### 🎁 Próximas ativações (opcional, baixo custo)

- [ ] Adicionar `BREVO_LIST_ID` no Vercel → cria lista dedicada "Agente Pessoal — Leads"
- [ ] Adicionar `BREVO_WELCOME_TEMPLATE_ID` → dispara welcome email com link do portal
- [ ] Criar automation visual "Welcome + Nurture 14 dias" no dashboard Brevo (drag-and-drop)
- [ ] Adicionar pixel de tracking no portal.html para contar downloads efetivos
- [ ] Adicionar UTM source tracking para medir canais de aquisição
- [ ] Webhook Brevo → Supabase/Sheets para salvar eventos (open, click, unsubscribe)
- [ ] Custom domain (ex: `agente.agenciarmktdigital.com.br`) com DNS

---

## 📦 Estrutura do Repositório

```
agente-pessoal-ia/                      ← Raiz do projeto
│
├── README.md                            ← Este arquivo (visão geral)
├── ESPECIFICACOES.md                    ← Docs técnica: arquitetura, endpoints, fluxos
├── DEPLOY.md                            ← Setup Vercel, env vars, troubleshooting
├── BREVO-NEWSLETTER.md                  ← Integração Brevo + estratégia newsletter
├── CHANGELOG.md                         ← Histórico de versões e ativações
│
├── index.html                           ← Landing page (39KB, 574 linhas)
├── portal.html                          ← Portal de download pós-email
├── dashboard-data.json                  ← Dados mock do dashboard de runs
├── vercel.json                          ← Config Vercel (rotas, headers)
├── package.json                         ← Metadata + script `serve` local
├── .gitignore                           ← Exclui node_modules, .vercel, etc
│
├── api/                                 ← Serverless functions
│   └── subscribe.js                     ← POST /api/subscribe → cria contato Brevo
│
└── produto/                             ← ARQUIVOS DO PRODUTO (o que o usuário baixa)
    ├── README.md                        ← Versão/índice do produto
    ├── AGENTE-PESSOAL-IA.md             ← Agente completo: 3 mentores (311 linhas)
    ├── PROMPT-MESTRE.md                 ← Versão compacta pra colar em 30s
    ├── BONUS-01-CRIAR-AGENTES.md        ← Manual: template universal + 10 exemplos + pipeline
    ├── BONUS-02-AGENDAR-TAREFAS.md      ← 20 tarefas pra automatizar + agenda semanal
    └── BONUS-03-PROMPTS-PRONTOS.md      ← 50 prompts copiar/colar
```

**Tamanho total do projeto:** ~95KB de código, ~50KB de produto (5 arquivos `.md`)

---

## 🚀 Quick start (rodar local)

```bash
# 1. Clone
git clone https://github.com/cspgabriel/agente-pessoal-ia.git
cd agente-pessoal-ia

# 2. Servir localmente (porta 4173)
npm run serve
# → http://localhost:4173/

# 3. (Opcional) Rodar com Vercel CLI pra testar serverless function local
npm i -g vercel
vercel dev
# → http://localhost:3000/
```

**Sem build step.** É HTML/CSS/JS puro + 1 serverless function. Não precisa de bundler.

---

## 🔄 Fluxo do usuário (alto nível)

```
1. Usuário chega na landing (https://agente-pessoal-ia.vercel.app)
   ↓
2. Vê copy de venda (hero, dor, mecanismo, prova, FAQ)
   ↓
3. Coloca email no form #cta-form
   ↓
4. JS chama POST /api/subscribe { email, source }
   ↓
5. Serverless cria contato na Brevo (lista padrão ou BREVO_LIST_ID)
   ↓
6. (Se BREVO_WELCOME_TEMPLATE_ID configurado) dispara welcome email
   ↓
7. Redirect para /portal.html?email=...
   ↓
8. Portal mostra email + 5 botões de download dos arquivos .md
   ↓
9. Usuário baixa, cola no ChatGPT/Claude/Gemini, cria seu agente
```

Ver detalhes técnicos em [ESPECIFICACOES.md](./ESPECIFICACOES.md).

---

## 👥 Squad (3 mentores de IA)

A célula que o usuário ativa colando o prompt mestre:

| Agente | Ícone | Função |
|---|---|---|
| **Mestre Mentor** | 🎯 | Faz 6 perguntas de mapeamento → diagnostica o que automatizar → desenha o blueprint do agente |
| **Arquiteto de Agentes** | 🔧 | Constrói o prompt pronto (persona + missão + contexto + ferramentas + output) |
| **Validador de Agentes** | 🛡️ | Testa com 4 critérios (Prontidão, Especificidade, Autonomia, Robustez) — só libera agente aprovado |

---

## 📊 Métricas & Tracking

**Implementado:**
- ✅ Source tracking no subscribe (`source: 'agente-pessoal-ia-landing'`)
- ✅ Brevo armazena SIGNUP_AT e SOURCE como atributos do contato
- ✅ Vercel Analytics nativo habilitado (pageviews, performance)

**A implementar:**
- ⏳ Pixel de download no portal.html (conta quantos baixaram de verdade)
- ⏳ Webhook Brevo → storage externo (eventos open/click/bounce)
- ⏳ UTM source tracking em campanhas de divulgação

---

## 🤝 Contribuindo

Pra mudanças no produto (`produto/*.md`):
1. Edite o arquivo
2. Faça commit descritivo
3. Push em `master` → Vercel deploya automaticamente

Pra mudanças no código (`index.html`, `portal.html`, `api/*.js`):
1. Edite
2. Commit + push
3. Verifique o deploy em https://vercel.com/cspgabriels-projects/agente-pessoal-ia

---

## 📜 Licença

Conteúdo do produto: **Gratuito para uso pessoal** (lead magnet AgenciAR).
Código deste repositório: **UNLICENSED** (proprietário Gabriel Coutinho / AgenciAR).

---

**Contato:** contato@agenciarmktdigital.com.br
**Operado por:** AgenciAR MKT Digital — https://github.com/cspgabriel

---

> Última atualização: 2026-06-28 20:27 BRT (UTC-3)
> Mantido por: Agente Hermes (Mavis) — contexto em `~/.mavis/agents/mavis/memory/`