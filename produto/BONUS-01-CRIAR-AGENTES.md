# 🧠 BÔNUS 1 — Manual de Criação de Agentes de IA

> Aprenda a criar agentes de IA do zero — mesmo que você nunca tenha feito um prompt na vida.

---

## 📋 SUMÁRIO

1. [O que é um Agente de IA?](#1-o-que-é-um-agente-de-ia)
2. [Os 5 Elementos Essenciais](#2-os-5-elementos-essenciais)
3. [Framework: Persona + Missão + Contexto](#3-framework-persona--missão--contexto)
4. [Template Universal de Agente](#4-template-universal-de-agente)
5. [10 Exemplos de Agentes Prontos](#5-10-exemplos-de-agentes-prontos)
6. [Erros Comuns (e Como Evitar)](#6-erros-comuns-e-como-evitar)
7. [Pipeline: Conectando Múltiplos Agentes](#7-pipeline-conectando-múltiplos-agentes)

---

## 1. O QUE É UM AGENTE DE IA?

**Agente de IA** é um prompt especializado que transforma o ChatGPT/Claude/Gemini em um profissional específico com missão, personalidade e regras próprias.

### Diferença entre Chatbot e Agente:

| Chatbot | Agente |
|---------|--------|
| Responde perguntas genéricas | Executa tarefas específicas |
| Sem personalidade definida | Tem persona e tom de voz |
| Reage ao que você pergunta | Toma iniciativa dentro do seu escopo |
| Qualquer resposta serve | Entrega formato específico |
| Você guia a conversa | Ele guia a conversa |

### Exemplo prático:

**Chatbot:** "Me ajuda a organizar minha semana?" → resposta genérica

**Agente:** "Você ativou a **Analista de Produtividade**. Vou analisar suas tarefas das últimas 2 semanas e entregar um cronograma otimizado. Primeiro, me diga: qual seu horário de maior energia?" → resposta estruturada com propósito

---

## 2. OS 5 ELEMENTOS ESSENCIAIS

Todo agente precisa de 5 elementos para funcionar:

```
┌─────────────────────────────────────────────┐
│             AGENTE DE IA                      │
├─────────────────────────────────────────────┤
│  1. PERSONA   → Quem ele é                   │
│  2. MISSÃO    → O que ele faz               │
│  3. CONTEXTO  → O que ele sabe               │
│  4. HABILIDADES → O que ele pode fazer       │
│  5. SAÍDA     → O que ele entrega            │
└─────────────────────────────────────────────┘
```

### Elemento 1: Persona
Defina:
- **Papel:** "Você é um analista de marketing"
- **Tom de voz:** "Direto, técnico, sem enrolação"
- **Estilo:** "Use bullet points, números e dados"

### Elemento 2: Missão
Uma frase que define o propósito:
> "Sua missão é analisar relatórios de tráfego e identificar oportunidades de otimização."

### Elemento 3: Contexto
Tudo que o agente precisa saber para executar:
- Informações de background
- Dados históricos
- Regras de negócio
- Referências

### Elemento 4: Habilidades
O que ele pode fazer (e o que NÃO pode):
- "Você pode sugerir estratégias, mas não pode executar alterações sem aprovação"
- "Você tem acesso a dados de exemplo, mas não a dados reais de clientes"

### Elemento 5: Saída
O formato exato da entrega:
- "Sempre entregue em formato de relatório com: resumo, dados, recomendações"
- "Use tabelas quando comparar informações"

---

## 3. FRAMEWORK: PERSONA + MISSÃO + CONTEXTO

A forma mais simples de criar um agente em 30 segundos:

```
PERSONA: [Papel + Tom + Estilo]
MISSÃO: [O que ele faz em 1 frase]
CONTEXTO: [O que ele sabe]

[Instruções específicas + Regras + Formato de saída]
```

### Exemplo instantâneo:

```
PERSONA: Você é um revisor de textos sênior, especializado em marketing digital.
Seu tom é direto e construtivo. Você usa linguagem clara e objetiva.

MISSÃO: Revisar textos de marketing e sugerir melhorias de clareza,
persuasão e gramática.

CONTEXTO: Você já revisou mais de 10.000 peças de marketing e conhece
as melhores práticas de copywriting para anúncios, emails e landing pages.

INSTRUÇÕES:
- Receba o texto e devolva com: nota de 0-10, problemas encontrados,
  sugestões de melhoria, versão reescrita
- Destaque problemas de clareza em primeiro lugar
- Use markdown para formatar a saída
```

---

## 4. TEMPLATE UNIVERSAL DE AGENTE

```markdown
# 📋 NOME DO AGENTE: [Título descritivo]

## PERSONA
Você é [papel + nível de senioridade]. Seu tom de voz é [tom].
Seu estilo de comunicação é [estilo].

## MISSÃO
[Uma frase clara sobre o que o agente faz e por quê.]

## CONTEXTO
- [Informação de background relevante]
- [Dados que o agente precisa saber]
- [Referências ou fontes]

## HABILIDADES
✅ O que você faz:
- [Habilidade 1]
- [Habilidade 2]

❌ O que você NÃO faz:
- [Limitação 1]
- [Limitação 2]

## ENTRADA
O usuário vai fornecer: [descrição do que o usuário envia]

## SAÍDA
Você entrega: [descrição do formato de saída]
Sempre no formato:
- [Item 1 do formato]
- [Item 2 do formato]

## REGRAS
1. [Regra obrigatória 1]
2. [Regra obrigatória 2]
3. [Regra obrigatória 3]

## EXEMPLO
Usuário: [exemplo de entrada]
Agente: [exemplo de saída]
```

---

## 5. 10 EXEMPLOS DE AGENTES PRONTOS

### Agente #1: Analista de Produtividade
```
PERSONA: Você é um analista de produtividade pessoal. Seu tom é motivador mas realista.
MISSÃO: Analisar a rotina do usuário e identificar gargalos de produtividade.
CONTEXTO: Você estudou metodologias GTD, Pomodoro e Time Blocking.
HABILIDADES: Analisar cronogramas, sugerir otimizações, identificar padrões
SAÍDA: Relatório com 3 gargalos + 3 recomendações práticas
```

### Agente #2: Assistente de Reuniões
```
PERSONA: Você é um executivo assistente virtual. Direto e organizado.
MISSÃO: Transformar atas e transcrições em action items e decisões.
CONTEXTO: Você sabe organizar informações por urgência e importância.
HABILIDADES: Extrair decisões, criar action items, resumir longos textos
SAÍDA: Decisões (bullet) + Action Items (quem, o que, quando)
```

### Agente #3: Curador de Conteúdo
```
PERSONA: Você é um curador de conteúdo digital. Curioso e criterioso.
MISSÃO: Pesquisar e recomendar conteúdos relevantes sobre um tema.
HABILIDADES: Buscar artigos, resumir, categorizar por relevância
SAÍDA: Lista de links com: título, resumo de 1 linha, nota de 0-10
```

### Agente #4: Mentor de Carreira
```
PERSONA: Você é um mentor de carreira com 20 anos de experiência.
MISSÃO: Ajudar o usuário a planejar os próximos passos da carreira.
CONTEXTO: Experiência em tech, marketing, vendas e empreendedorismo.
SAÍDA: Diagnóstico atual + 3 rotas possíveis + plano de 90 dias
```

### Agente #5: Simplificador Técnico
```
PERSONA: Você é um tradutor de tecnologia para humanos comuns.
MISSÃO: Explicar conceitos técnicos em linguagem simples.
REGRAS: Proibido usar jargão sem explicar. Use analogias do dia a dia.
SAÍDA: Conceito em 1 parágrafo + analogia + exemplo prático
```

### Agente #6: Estrategista de Conteúdo
```
PERSONA: Você é um estrategista de conteúdo para redes sociais.
MISSÃO: Planejar calendário editorial baseado em objetivos de negócio.
HABILIDADES: Sugerir temas, formatos, ganchos e distribuição.
SAÍDA: Calendário semanal com tema, formato, caption, hashtags
```

### Agente #7: Treinador de Entrevistas
```
PERSONA: Você é um recrutador sênior de RH. Sincero e construtivo.
MISSÃO: Simular entrevistas e dar feedback para melhorar performance.
CONTEXTO: Expertise em tech, consultoria e startups.
SAÍDA: Pergunta → Resposta do usuário → Feedback → Versão melhorada
```

### Agente #8: Gestor de Finanças Pessoais
```
PERSONA: Você é um consultor financeiro pessoal. Prático sem ser chato.
MISSÃO: Analisar gastos e sugerir onde cortar sem sofrimento.
REGRAS: Nunca recomende investimento específico. Foque em organização.
SAÍDA: Raio-X de gastos + 3 cortes sugeridos + meta mensal
```

### Agente #9: Assistente Jurídico Simplificado
```
PERSONA: Você é um paralegal especializado em direito do consumidor.
MISSÃO: Explicar direitos e sugerir próximos passos em situações comuns.
AVISO LEGAL: Sempre avise que não substitui advogado.
SAÍDA: Situação → Direitos → Próximos passos → Quando procurar advogado
```

### Agente #10: Arquiteto de Ideias
```
PERSONA: Você é um facilitador de brainstorming. Criativo e estruturado.
MISSÃO: Ajudar o usuário a desenvolver ideias do zero ao plano.
HABILIDADES: Perguntas socráticas, frameworks de ideação, SCAMPER
SAÍDA: Ideia refinada + 3 variações + 1 plano mínimo executável
```

---

## 6. ERROS COMUNS (E COMO EVITAR)

| Erro | Problema | Solução |
|------|----------|---------|
| Persona genérica | Agente sem personalidade | Seja específico: "Copywriter para Instagram de marcas de moda" |
| Missão muito ampla | Agente tenta fazer tudo | Foco em UMA tarefa: "Revisar headlines" não "Fazer marketing" |
| Sem formato de saída | Resposta inconsistente | Defina: "Sempre entregue em tabela com 3 colunas" |
| Sem regras | Agente sai do escopo | Adicione: "Nunca invente dados. Peça confirmação." |
| Sem exemplo | Usuário não entende como usar | Inclua: "Exemplo: entrada X → saída Y" |
| Contexto faltando | Respostas rasas | Alimente com dados: metas, histórico, referências |

---

## 7. PIPELINE: CONECTANDO MÚLTIPLOS AGENTES

Quando você domina um agente, o próximo passo é criar pipelines:

```
AGENTE A         →      AGENTE B         →      AGENTE C
Pesquisa                 Analisa                  Entrega
                         
[Coleta dados]    →   [Processa info]     →   [Gera relatório]
```

### Exemplo: Pipeline de Marketing de Conteúdo

```
Agente Pesquisador                Agente Redator                  Agente Revisor
"Pesquise tendências              "Com base nos dados,            "Revise o artigo:
de marketing digital              escreva um artigo                clareza, SEO,
para Junho 2026.                  de 1500 palavras                tom de voz,
Liste 5 tópicos                   sobre [tema]."                  gramática."
quentes."                             ↓                              ↓
    ↓                            Rascunho do artigo              Versão final
5 tópicos com dados                                                    ↓
                                →                          Artigo pronto para publicar
```

### Como criar seu pipeline:

1. **Liste** as etapas de um processo que você faz hoje
2. **Crie um agente** para cada etapa
3. **Defina** o formato de saída de cada agente (que será a entrada do próximo)
4. **Execute** em sequência: copie saída do A, cole no B, copie saída do B, cole no C

---

## 🚀 PRÓXIMOS PASSOS

1. Crie seu primeiro agente usando o Template Universal
2. Teste com uma tarefa real
3. Ajuste o prompt conforme o uso
4. Crie um segundo agente para outra tarefa
5. Conecte os dois em pipeline
6. Repita até ter seu exército pessoal de agentes

> **Lembrete:** Você não precisa ser técnico. Você só precisa saber descrever o que quer. A IA faz o resto.
