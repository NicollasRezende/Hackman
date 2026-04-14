# Guia Cidadão IA — Apresentação de Mentoria

> Mentoria de alinhamento com auditor Antônio França (TCU)
> Duração: 15 minutos · Foco: aderência às expectativas do Tribunal e escalabilidade

---

## 1. Pitch (30 segundos)

**Guia Cidadão IA** é um assistente conversacional que traduz a burocracia dos serviços públicos em linguagem natural. O cidadão pergunta — por texto, voz ou WhatsApp — e recebe o caminho exato: onde ir, o que levar, quanto custa, qual telefone ligar. Piloto no Distrito Federal, arquitetado para escalar a qualquer município ou estado do Brasil.

**Problema:** 60% das dúvidas no 156 são sobre "onde encontro X" e "quais documentos preciso". O cidadão não sabe qual órgão procurar.

**Solução:** Uma única porta de entrada em linguagem natural, integrada a fontes públicas oficiais, com trilha de auditoria completa.

---

## 2. O que está entregue

### Frontend (cidadão)
- Interface web responsiva, acessível (WCAG AA, VLibras, alto contraste, escala de fonte)
- Busca por voz (Web Speech API) e por texto
- Chips temáticos: Saúde, Trabalho, Previdência, Família, PCD, CNH, RG, Mulher, **TCU**
- Integração com WhatsApp Bot (mesmo cérebro, canais diferentes)

### Backend (Spring Boot + IA)
- API REST com Claude como motor de linguagem natural
- Context Builder carregando o catálogo oficial do GDF (`ai-context.md`)
- Classificação automática por categoria (saúde, trabalho, TCU, etc.)
- Provenance: cada resposta carrega as fontes consultadas
- Métricas e feedback persistidos

### Painel Administrativo (o "coração" para o TCU)
- **Total de mensagens** e sessões únicas
- **Tempo médio de processamento** (SLA da IA)
- **Feedback positivo vs negativo** por resposta
- **Top categorias** (pizza) — mostra o que o cidadão mais procura
- **Timeline horária** — picos de demanda
- **Top mensagens** — dúvidas mais frequentes (insumo direto para política pública)

---

## 3. Por que isso interessa ao TCU

O TCU é órgão de **controle externo**. Um assistente público precisa provar que:

| Exigência TCU | Como atendemos |
|---|---|
| Transparência ativa | Dashboard público de uso, categorias e desempenho |
| Rastreabilidade | Toda resposta tem provenance (fontes oficiais consultadas) |
| Auditabilidade | Log de todas as interações, feedback e latência |
| Economicidade | Reduz carga no 156 e atendimento presencial |
| LGPD | Não processa dados pessoais; sessões anônimas |
| Acessibilidade (Lei 13.146) | VLibras, alto contraste, fonte escalável, teclado |
| Linguagem simples (Lei 15.263/2025 e Lei 14.129) | Núcleo do produto — a Política Nacional de Linguagem Simples é exatamente o que o assistente entrega: tradução de textos e procedimentos oficiais para o português do cidadão |

O painel administrativo permite que o gestor público (ou um auditor do TCU) visualize, em tempo real, **como o serviço está sendo usado e se está cumprindo seu propósito**.

---

## 4. Diferencial vs catálogos existentes

- **Catálogo de serviços tradicional:** o cidadão precisa saber o nome do serviço para buscar.
- **Guia Cidadão IA:** o cidadão descreve o problema em português comum ("perdi meu emprego", "meu filho precisa de consulta") e a IA mapeia para o serviço certo.

Não substitui o catálogo — **consome** o catálogo e o torna acessível.

---

## 5. Escalabilidade para outras regiões

### Arquitetura desenhada para replicação

O projeto separa **motor** de **conteúdo**:

```
┌──────────────────────────────┐
│   MOTOR (reutilizável)       │  ← Spring Boot + Claude + Frontend React
│   - Classificação            │
│   - Provenance               │
│   - Métricas                 │
│   - Canais (Web/WhatsApp)    │
└──────────────────────────────┘
              ↑ carrega
┌──────────────────────────────┐
│   CONTEXTO (por município)   │  ← ai-context.md específico
│   - Órgãos locais            │
│   - Endereços                │
│   - Telefones                │
│   - Portais regionais        │
└──────────────────────────────┘
```

### Replicar em um novo município custa:
1. **Trocar o `ai-context.md`** — catálogo de serviços locais (endereços, telefones, portais)
2. **Ajustar identidade visual** (cores, brasão, nome do ente)
3. **Apontar canais** (número de WhatsApp, domínio)

Nenhuma linha de código do motor precisa mudar.

### Caminhos de escala

- **Municípios via CNM (Confederação Nacional dos Municípios)** — 5.568 municípios; a CNM já consolida catálogos municipais e pode ser parceira para alimentar o contexto em massa.
- **Estados** — cada secretaria estadual pode ter sua instância, integrando a dados abertos locais.
- **Governo Federal** — integração com gov.br como camada de login unificada (já prevista na UI).
- **Multi-tenant** — uma única instalação pode servir N entes, roteando por subdomínio ou parâmetro; o dashboard segrega métricas por tenant.

### Custo marginal
- Infraestrutura: Spring Boot escala horizontalmente; custo dominante é a chamada ao modelo (cacheável por pergunta frequente).
- **Prompt caching** reduz em até 90% o custo de contexto repetido — o `ai-context.md` vai no cache, só a pergunta varia.
- Estimativa: um município de 100k habitantes cabe em um tier de infraestrutura básico.

### Dados abertos como combustível
Cada região tem seu portal de dados abertos (dados.gov.br, dados.df.gov.br, etc.). O Context Builder pode ser estendido para **ingerir esses portais automaticamente**, mantendo o contexto vivo sem intervenção manual.

---

## 6. Próximos passos (roadmap curto)

1. **Autenticação gov.br** no painel administrativo (gestor público entra com selo oficial)
2. **Ingestão automática** do Portal de Dados Abertos do DF
3. **Exportação de relatórios** (CSV/PDF) do dashboard para prestação de contas
4. **API pública de métricas** — o TCU pode consumir dados agregados em tempo real
5. **Piloto com segundo município** para validar o processo de replicação

---

## 7. O que pedir ao auditor França

- Quais **indicadores específicos** o TCU gostaria de ver no dashboard?
- Há um **padrão de trilha de auditoria** que o Tribunal recomenda para sistemas de IA no setor público?
- Como o projeto se encaixa nas **diretrizes do Acórdão TCU sobre IA Generativa no Governo**?
- Existe interesse do TCU em um **piloto institucional** (o próprio TCU usando o motor para orientar cidadãos sobre controle externo, denúncias, certidões)?

---

## 8. Demo (5 min do slot)

1. Abrir a home → fazer uma pergunta por voz ("preciso de médico")
2. Mostrar resposta com provenance e chips temáticos
3. Clicar em **Entrar** → abrir o **Painel Administrativo**
4. Percorrer métricas, gráfico de categorias e top mensagens
5. Mostrar o mesmo fluxo pelo WhatsApp Bot
