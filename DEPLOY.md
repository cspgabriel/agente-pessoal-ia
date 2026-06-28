# Deploy & Manutenção — Agente Pessoal de IA

> Guia completo: setup inicial, env vars, redeploy, troubleshooting, observabilidade.

**Última atualização:** 2026-06-28
**Plataforma:** Vercel
**Domínio produção:** https://agente-pessoal-ia.vercel.app

---

## 🆕 Setup inicial (do zero)

### 1. Pré-requisitos
- [x] Conta Vercel (Gabriel: `cspgabriel`)
- [x] Conta GitHub (Gabriel: `cspgabriel`)
- [x] Vercel CLI instalado: `npm i -g vercel`
- [x] Git CLI
- [x] gh CLI autenticado: `gh auth status`

### 2. Clone do repositório
```bash
git clone https://github.com/cspgabriel/agente-pessoal-ia.git
cd agente-pessoal-ia
```

### 3. Login Vercel
```bash
vercel login
# ou, se já logado:
vercel whoami
# → cspgabriel
```

### 4. Link do projeto (só na primeira vez)
```bash
vercel link
# Selecionar: cspgabriels-projects/agente-pessoal-ia
```

### 5. Configurar env vars (CRÍTICO)
```bash
# Obrigatório
vercel env add BREVO_API_KEY production
# Cola a API key (chave em hermes/credenciais/brevo_api_key.txt)

# Opcionais (configurar depois)
vercel env add BREVO_LIST_ID production
# Cole o ID da lista Brevo (criada via API ou dashboard)

vercel env add BREVO_WELCOME_TEMPLATE_ID production
# Cole o ID do template de welcome

vercel env add BREVO_FROM_EMAIL production
# Default: contato@agenciarmktdigital.com.br

vercel env add BREVO_FROM_NAME production
# Default: AgenciAR Digital

vercel env add REDIRECT_URL production
# Default: /portal.html (pode ser URL absoluta)
```

### 6. Primeiro deploy
```bash
vercel --prod
# Aguardar ~30s
# → URL: https://agente-pessoal-<hash>-cspgabriels-projects.vercel.app
# → Alias: https://agente-pessoal-ia.vercel.app (criado automaticamente)
```

### 7. Resolver IP Whitelist Brevo (OBRIGATÓRIO)

Vercel serverless usa IPs **dinâmicos** (ex: `32.198.78.123`). A Brevo rejeita por padrão. Solução:

1. Acessar: https://app.brevo.com/security/authorised_ips
2. Ativar o toggle **"Allow API calls without authorized IPs"**
3. Aguardar ~2 minutos para propagar
4. Testar com curl/PowerShell (ver seção "Smoke test" abaixo)

**Risco mitigado:** API key nunca é exposta no client-side, sempre em server-side (env var do Vercel).

### 8. Smoke test
```powershell
$body = '{"email":"teste-inicial@gabriel-test.com","source":"setup"}'
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

---

## 🔁 Workflow de deploy (dia-a-dia)

### Mudou código? Deploy automático via Git push
```bash
git add .
git commit -m "feat: mensagem descritiva"
git push origin master
# → Vercel detecta push, deploy em ~30s
# → Preview URL criada pra cada commit em branches
# → master = produção
```

### Mudou env var? Precisa redeploy
```bash
vercel env add NOVA_VAR production --value "valor"
vercel --prod --force  # força redeploy pra pegar a env var
```

### Quer ver logs em tempo real?
```bash
vercel logs https://agente-pessoal-ia.vercel.app/api/subscribe --follow
```

---

## 🌐 Variáveis de ambiente

### Referência completa

| Nome | Obrigatório | Default | Exemplo | Descrição |
|---|---|---|---|---|
| `BREVO_API_KEY` | ✅ | — | `xkeysib-...` | API key Brevo (obter em https://app.brevo.com/settings/keys/api) |
| `BREVO_LIST_ID` | ❌ | null | `42` | ID da lista onde o contato é adicionado |
| `BREVO_WELCOME_TEMPLATE_ID` | ❌ | null | `7` | ID do template do email de boas-vindas |
| `BREVO_FROM_EMAIL` | ❌ | `contato@agenciarmktdigital.com.br` | `gabriel@agenciarmktdigital.com.br` | Email remetente (precisa estar verificado no Brevo) |
| `BREVO_FROM_NAME` | ❌ | `AgenciAR Digital` | `Gabriel · AgenciAR` | Nome do remetente |
| `REDIRECT_URL` | ❌ | `/portal.html` | `https://agente.agenciarmktdigital.com.br/portal.html` | URL pós-signup |

### Boas práticas
- **Nunca** commitar API keys
- Usar valores diferentes por environment (`production`, `preview`, `development`)
- Pra preview deploys, usar API key separada de "testes"
- Rotação de key a cada 90 dias (recomendação Brevo)

---

## 📊 Observabilidade

### Vercel Dashboard
- URL: https://vercel.com/cspgabriels-projects/agente-pessoal-ia
- Métricas: pageviews, function invocations, errors, bandwidth
- Logs: realtime + 7 dias de retenção (free tier)

### Brevo Dashboard
- URL: https://app.brevo.com
- Contatos: https://app.brevo.com/contact/list
- Campanhas: https://app.brevo.com/camp/list
- Automações: https://app.brevo.com/automation/list
- Logs API: https://app.brevo.com/log

### Métricas-chave pra monitorar
- **Form conversion rate:** submits / pageviews (meta: >5%)
- **Email delivery rate:** delivered / sent (meta: >95%)
- **Open rate:** opened / delivered (meta: >25%)
- **Click rate:** clicked / delivered (meta: >3%)
- **Bounce rate:** bounced / sent (meta: <2%)
- **Unsubscribe rate:** unsubscribed / delivered (meta: <0.5%)

---

## 🐛 Troubleshooting

### API retorna 500 "Configuração ausente no servidor"
**Causa:** `BREVO_API_KEY` não chegou na função.
**Solução:**
1. `vercel env ls` — confirmar que a var existe
2. `vercel --prod --force` — forçar redeploy
3. Aguardar ~30s e testar de novo

### API retorna 502 "unrecognised IP address"
**Causa:** Brevo IP whitelist ativo.
**Solução:**
1. Ativar toggle no dashboard Brevo (ver seção setup)
2. Aguardar 2 min
3. Testar de novo

### Landing carrega mas form não faz nada
**Causa:** JS error ou CORS.
**Solução:**
1. Abrir DevTools → Console
2. Verificar erro
3. Se for CORS: ver `Access-Control-Allow-Origin` no response
4. Se for 404 em `/api/subscribe`: function não deployed

### Portal mostra email mas botões de download não funcionam
**Causa:** Links errados no `portal.html`.
**Solução:**
1. Inspecionar botões
2. Confirmar que apontam pra `https://github.com/cspgabriel/agente-pessoal-ia/blob/master/produto/...`
3. Se necessário, mudar pra `raw.githubusercontent.com/cspgabriel/agente-pessoal-ia/master/produto/...`

### Deploy falha com erro de build
**Causa:** Erro de sintaxe em `api/*.js` ou algum asset inválido.
**Solução:**
1. `vercel logs` — ver erro detalhado
2. Localizar linha do erro
3. Fix + commit + push

---

## 🔄 Manutenção periódica

### Semanal
- [ ] Verificar logs Brevo → bounces > 2%? Limpar lista
- [ ] Conferir Vercel Dashboard → erros > 0? Investigar
- [ ] Verificar se landing tem updates de copy (A/B test)

### Mensal
- [ ] Rotacionar BREVO_API_KEY (90 dias ideal)
- [ ] Revisar métricas de conversão
- [ ] Atualizar CHANGELOG.md com releases do mês
- [ ] Checar se há updates do Next.js/Vercel que afetam compatibilidade

### Trimestral
- [ ] Backup completo do repo (já está no GitHub)
- [ ] Audit de segurança (CORS, rate limiting, env vars)
- [ ] Review do produto (conteúdo dos `.md` ainda relevante?)
- [ ] Pesquisa de satisfação dos leads (NPS via Brevo)

---

## 🌐 Custom Domain (futuro)

Pra usar `agente.agenciarmktdigital.com.br`:

1. Comprar/confirmar domínio em algum registrar (ex: Registro.br, Cloudflare)
2. No Vercel Dashboard → Domains → Add `agente.agenciarmktdigital.com.br`
3. Adicionar CNAME no DNS:
   ```
   agente.agenciarmktdigital.com.br → cname.vercel-dns.com
   ```
4. Aguardar propagação (até 48h)
5. Vercel provisiona SSL automático (Let's Encrypt)
6. Atualizar `REDIRECT_URL` env var pra URL absoluta

---

## 🔐 Segurança

### Práticas implementadas
- ✅ API key em env var (não commitada)
- ✅ HTTPS forçado (Vercel default)
- ✅ Email validation (regex RFC 5322 simplificado)
- ✅ Method restriction (POST only)
- ✅ Tamanho máximo em inputs

### Práticas a implementar
- ⏳ Rate limiting por IP no `/api/subscribe` (ex: max 5 submits/min por IP)
- ⏳ reCAPTCHA v3 / hCaptcha no form
- ⏳ Honeypot field anti-bot
- ⏳ Double opt-in (Brevo config)
- ⏳ Webhook signature verification (HMAC)

---

> Dúvidas? Ver [ESPECIFICACOES.md](./ESPECIFICACOES.md) ou [BREVO-NEWSLETTER.md](./BREVO-NEWSLETTER.md).