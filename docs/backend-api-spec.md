# Guia Cidadão — Backend API Specification

> **Stack:** Java 21 + Spring Boot 3.x
> **AI Provider:** OpenRouter (simples POST, sem streaming)
> **APIs Externas:** mcp-brasil (gratuito, open-source) + APIBrasil MCP (comercial, auth)
> **Base URL:** `https://api.guiacidadao.df.gov.br/api/v1` (prod) | `http://localhost:8080/api/v1` (dev)
> **Autenticação:** Bearer token via header `Authorization` (opcional na fase hackathon — CORS aberto)

---

## Sumário de Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/chat` | Enviar pergunta e receber resposta IA estruturada |
| `POST` | `/chat/feedback` | Registrar feedback do usuário (positivo/negativo) |
| `GET` | `/services/featured` | Listar serviços em destaque |
| `GET` | `/services/status` | Painel de situação dos serviços do DF |
| `GET` | `/services/suggestions` | Sugestões de busca populares |
| `GET` | `/faq` | Perguntas frequentes |
| `GET` | `/health` | Health check do servidor |

---

## 1. `POST /chat`

Recebe a pergunta do cidadão, encaminha para OpenRouter com contexto GDF, e retorna uma resposta estruturada.

### Request

```http
POST /api/v1/chat
Content-Type: application/json
```

```json
{
  "message": "preciso de médico mas não tenho dinheiro",
  "sessionId": "sess_abc123"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `message` | `string` | ✅ | Pergunta do cidadão (máx. 500 chars) |
| `sessionId` | `string` | ❌ | ID de sessão para rastrear histórico (UUID gerado pelo front) |

### Response `200 OK`

```json
{
  "tag": {
    "cls": "tag-health",
    "icon": "HeartPulse",
    "txt": "Saúde Pública"
  },
  "intro": "Você tem direito ao atendimento gratuito pelo <strong>SUS</strong>. Veja como acessar os serviços de saúde mais próximos.",
  "blocks": [
    {
      "icon": "FileText",
      "title": "Documentos necessários",
      "docs": ["Cartão SUS", "RG ou CPF", "Comprovante de residência"]
    },
    {
      "icon": "Info",
      "title": "Como funciona o atendimento",
      "body": "Atendimentos de urgência podem ser feitos diretamente na <strong>UPA 24h</strong> sem agendamento prévio. Para consultas eletivas, acesse uma <strong>Unidade Básica de Saúde (UBS)</strong>."
    }
  ],
  "steps": [
    "Para emergências, ligue <strong>192 (SAMU)</strong> ou vá à UPA 24h mais próxima",
    "Para consultas, procure a UBS do seu bairro com RG e cartão SUS",
    "A UBS vai encaminhar para especialistas via regulação (SISREG) se necessário",
    "Acompanhe sua solicitação de regulação no portal <a href=\"https://info.saude.df.gov.br\" target=\"_blank\">info.saude.df.gov.br</a>"
  ],
  "tip": "O Cartão SUS é gratuito e pode ser emitido na UBS do seu bairro. Sem ele, você ainda será atendido em emergências.",
  "contact": {
    "title": "Secretaria de Saúde do DF (SES-DF)",
    "addr": "SAIN, Parque Rural, Brasília — DF",
    "phone": "160",
    "hours": "Seg–Sex, 8h–18h"
  },
  "locations": [
    {
      "name": "Na Hora Rodoviária",
      "type": "na-hora",
      "address": "Plataforma Inferior, Rodoviária do Plano Piloto, Brasília",
      "lat": -15.7943,
      "lng": -47.8826,
      "phone": "(61) 2244-1146",
      "hours": "Seg–Sex 7h30–19h | Sáb 7h30–13h",
      "services": ["RG/CIN", "CPF", "CNH", "Trabalho"],
      "online": "https://agenda.df.gov.br"
    },
    {
      "name": "Instituto de Identificação — PCDF",
      "type": "pcdf",
      "address": "SDS — Setor de Diversões Sul, Brasília",
      "lat": -15.7987,
      "lng": -47.8938,
      "phone": "(61) 3362-6950",
      "hours": "Seg–Sex 7h–17h",
      "services": ["RG/CIN (primeira via)", "RG/CIN (segunda via)"],
      "online": "https://agenda.df.gov.br"
    }
  ],
  "related": [
    "Como conseguir medicamentos gratuitos?",
    "Onde fica a UPA mais próxima de mim?",
    "Como agendar consulta pelo SUS?"
  ],
  "meta": {
    "sessionId": "sess_abc123",
    "responseId": "resp_xyz789",
    "model": "openrouter/mistralai/mistral-7b-instruct",
    "processingMs": 1240,
    "timestamp": "2026-04-11T10:30:00Z"
  }
}
```

#### Campos da resposta

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `tag.cls` | `string` | ❌ | Classe CSS do badge: `tag-work`, `tag-health`, `tag-social`, `tag-transit` |
| `tag.icon` | `string` | ❌ | Nome do ícone Lucide React (ex: `HeartPulse`, `Briefcase`) |
| `tag.txt` | `string` | ❌ | Texto do badge (ex: "Saúde Pública") |
| `intro` | `string` | ❌ | Parágrafo introdutório (pode conter HTML básico: `<strong>`, `<a>`) |
| `blocks` | `array` | ❌ | Blocos informativos (mín. 1, máx. 4) |
| `blocks[].icon` | `string` | ❌ | Ícone Lucide do bloco |
| `blocks[].title` | `string` | ❌ | Título do bloco em caps (ex: "Documentos necessários") |
| `blocks[].body` | `string` | ✅ | Texto do bloco (HTML básico permitido) — mutuamente exclusivo com `docs` |
| `blocks[].docs` | `string[]` | ✅ | Lista de documentos como chips — mutuamente exclusivo com `body` |
| `steps` | `string[]` | ❌ | Passo a passo (mín. 2, máx. 6 passos; HTML básico permitido) |
| `tip` | `string` | ✅ | Dica extra em destaque dourado |
| `contact` | `object` | ✅ | Card de atendimento presencial |
| `contact.title` | `string` | — | Nome do órgão |
| `contact.addr` | `string` | — | Endereço |
| `contact.phone` | `string` | — | Telefone |
| `contact.hours` | `string` | — | Horário de funcionamento |
| `locations` | `ServiceLocation[]` | ✅ | Postos de atendimento com coordenadas para o mapa (ver tipo abaixo) |
| `related` | `string[]` | ✅ | Perguntas relacionadas (máx. 4) |

#### Tipo `ServiceLocation`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `name` | `string` | ❌ | Nome do posto (ex: "Na Hora Rodoviária") |
| `type` | `string` | ❌ | `na-hora` \| `pcdf` \| `detran` \| `ubs` \| `cras` \| `sedet` \| `inss` \| `other` |
| `address` | `string` | ❌ | Endereço completo legível |
| `lat` | `number` | ❌ | Latitude WGS84 |
| `lng` | `number` | ❌ | Longitude WGS84 |
| `phone` | `string` | ✅ | Telefone de contato |
| `hours` | `string` | ✅ | Horário de funcionamento |
| `services` | `string[]` | ✅ | Lista de serviços disponíveis neste posto |
| `online` | `string` | ✅ | URL para agendamento online equivalente |
| `distance` | `number` | ✅ | Distância em km — **calculada no frontend** após geolocalização, **não enviar pelo backend** |

**Regra de negócio — quando incluir `locations`:**
O backend deve popular `locations` sempre que o serviço exige comparecimento presencial. Mapeamento por categoria:

| Categoria detectada | `locations` a incluir |
|--------------------|-----------------------|
| `documentos` (RG, CIN, CPF) | PCDF/SSP-DF + todos os postos Na Hora |
| `transito` (CNH, DETRAN) | DETRAN-DF + postos Na Hora com CNH |
| `trabalho` (seguro-desemprego, emprego) | SEDET/SINE + postos Na Hora com Trabalho |
| `social` (Bolsa Família, CRAS, BPC) | CRAS do DF |
| `previdencia` (INSS, aposentadoria) | INSS + postos Na Hora com INSS |
| `saude` | UBS/UPA via CNES API (dados dinâmicos) |
| `meta.sessionId` | `string` | ✅ | ID da sessão passado pelo cliente |
| `meta.responseId` | `string` | ❌ | ID único da resposta (UUID) |
| `meta.model` | `string` | ❌ | Modelo LLM usado |
| `meta.processingMs` | `number` | ❌ | Tempo de processamento em ms |
| `meta.timestamp` | `string` | ❌ | ISO 8601 timestamp |

### Response `422 Unprocessable Entity`

Quando a pergunta está fora do escopo de serviços públicos do GDF:

```json
{
  "tag": {
    "cls": "tag-social",
    "icon": "HelpCircle",
    "txt": "Fora do escopo"
  },
  "intro": "Não consegui identificar um serviço público do GDF relacionado à sua pergunta.",
  "blocks": [
    {
      "icon": "Phone",
      "title": "Posso te ajudar com",
      "body": "Serviços de saúde, emprego, documentos, trânsito, assistência social e habitação no Distrito Federal."
    }
  ],
  "steps": [
    "Tente reformular sua pergunta",
    "Ou ligue para a Central do Cidadão: <strong>156</strong>"
  ],
  "related": [
    "Como agendar consulta pelo SUS?",
    "Como solicitar seguro-desemprego?",
    "Como emitir segunda via do RG?"
  ],
  "meta": {
    "responseId": "resp_fallback_001",
    "model": "openrouter/mistralai/mistral-7b-instruct",
    "processingMs": 320,
    "timestamp": "2026-04-11T10:31:00Z"
  }
}
```

---

## 2. `POST /chat/feedback`

Registra o feedback do cidadão sobre uma resposta.

### Request

```json
{
  "responseId": "resp_xyz789",
  "sessionId": "sess_abc123",
  "vote": "positive"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `responseId` | `string` | ✅ | ID da resposta avaliada |
| `sessionId` | `string` | ❌ | ID da sessão |
| `vote` | `string` | ✅ | `"positive"` ou `"negative"` |

### Response `200 OK`

```json
{ "ok": true }
```

---

## 3. `GET /services/featured`

Retorna os serviços em destaque exibidos na homepage.

### Response `200 OK`

```json
[
  {
    "icon": "HeartPulse",
    "title": "Agendamento pelo SUS",
    "desc": "Marque consultas e exames pelo sistema de regulação da SES-DF gratuitamente.",
    "badges": [
      { "label": "Gratuito", "variant": "green" },
      { "label": "Online", "variant": "blue" }
    ],
    "stat": {
      "icon": "Users",
      "text": "12.400 agendados este mês"
    },
    "cta": "Agendar",
    "query": "quero agendar uma consulta pelo SUS"
  }
]
```

---

## 4. `GET /services/status`

Retorna o painel de situação dos sistemas e serviços do GDF em tempo real (ou mock atualizado).

### Response `200 OK`

```json
[
  {
    "icon": "Activity",
    "iconBg": "rgba(0,132,61,0.1)",
    "iconColor": "#00843D",
    "label": "Agenda DF",
    "pill": { "text": "Operacional", "variant": "green" },
    "value": "98.7%",
    "detail": "SLA 30 dias — 4 min tempo médio de atendimento"
  }
]
```

---

## 5. `GET /services/suggestions`

Sugestões de busca populares para autocompletar no Hero.

### Response `200 OK`

```json
[
  { "label": "Renovar CNH", "query": "quero renovar minha CNH", "icon": "Car" },
  { "label": "Bolsa Família", "query": "como me cadastrar no bolsa família", "icon": "Heart" }
]
```

---

## 6. `GET /faq`

Retorna as perguntas frequentes por categoria.

### Response `200 OK`

```json
[
  {
    "category": "Saúde",
    "icon": "HeartPulse",
    "items": [
      {
        "q": "Como consultar pelo SUS no DF?",
        "a": "Procure a UBS mais próxima com RG e comprovante de residência. O agendamento para especialistas é feito via regulação da SES-DF.",
        "query": "como consultar pelo SUS"
      }
    ]
  }
]
```

---

## 7. `GET /health`

Health check para monitoramento.

### Response `200 OK`

```json
{
  "status": "UP",
  "timestamp": "2026-04-11T10:00:00Z",
  "services": {
    "openrouter": "UP",
    "database": "UP"
  }
}
```

---

## Tratamento de Erros

Todos os erros seguem o padrão:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "O campo 'message' é obrigatório.",
    "timestamp": "2026-04-11T10:00:00Z"
  }
}
```

| HTTP Status | Code | Situação |
|-------------|------|----------|
| `400` | `INVALID_INPUT` | Campos obrigatórios ausentes ou inválidos |
| `429` | `RATE_LIMITED` | Muitas requisições (limite: 20 req/min por IP) |
| `500` | `INTERNAL_ERROR` | Erro inesperado no servidor |
| `503` | `AI_UNAVAILABLE` | OpenRouter indisponível |

---

## Integração com OpenRouter

### Configuração

```properties
# application.properties
openrouter.api.key=${OPENROUTER_API_KEY}
openrouter.api.url=https://openrouter.ai/api/v1/chat/completions
openrouter.model=mistralai/mistral-7b-instruct:free
openrouter.timeout.seconds=30
```

### Chamada ao OpenRouter

```http
POST https://openrouter.ai/api/v1/chat/completions
Content-Type: application/json
Authorization: Bearer {OPENROUTER_API_KEY}
HTTP-Referer: https://guiacidadao.df.gov.br
X-Title: Guia Cidadão GDF
```

```json
{
  "model": "mistralai/mistral-7b-instruct:free",
  "messages": [
    {
      "role": "system",
      "content": "<conteúdo do docs/ai-context.md>\n\nResponda SEMPRE em JSON válido com os campos: tag, intro, blocks, steps, tip (opcional), contact (opcional), related. Nunca invente URLs. Use apenas os portais listados no contexto."
    },
    {
      "role": "user",
      "content": "preciso de médico mas não tenho dinheiro"
    }
  ],
  "max_tokens": 1200,
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

### JSON Schema esperado do LLM

O backend deve validar e mapear a resposta do LLM para o contrato de resposta da API:

```json
{
  "tag": { "cls": "string", "icon": "string", "txt": "string" },
  "intro": "string",
  "blocks": [
    {
      "icon": "string",
      "title": "string",
      "body": "string (opcional)",
      "docs": ["string (opcional)"]
    }
  ],
  "steps": ["string"],
  "tip": "string (opcional)",
  "contact": {
    "title": "string",
    "addr": "string",
    "phone": "string",
    "hours": "string"
  },
  "related": ["string"]
}
```

### Fallback

Se o LLM falhar ou retornar JSON inválido, o backend deve:
1. Tentar retry uma vez (após 2s)
2. Retornar resposta `422` com orientação para ligar ao 156
3. Logar o erro com `responseId` para análise posterior

---

## Dados do Front-End (Referência de Tipos)

Os tipos TypeScript do frontend (em `src/types/index.ts`) mapeiam diretamente para os campos da resposta:

```typescript
// Mapeamento frontend ↔ API response
interface AIResponse {
  // 'keys' não vem da API — é removido (era usado apenas no matching local)
  tag: { cls: string; icon: string; txt: string }
  intro: string
  blocks: InfoBlock[]   // array de { icon, title, body?, docs? }
  steps: string[]
  tip?: string
  contact?: ContactInfo // { title, addr, phone, hours }
  related?: string[]
}
```

> **Nota:** O campo `keys` do tipo atual (`AIResponse.keys: string[]`) é legado do matching client-side e **não deve** ser retornado pela API. O front-end pode ser atualizado para remover esse campo.

---

## Migração do Front-End (App.tsx)

Para migrar de `matchResponse()` (local) para a API:

```typescript
// ANTES (client-side, App.tsx)
const data = matchResponse(text)

// DEPOIS (com API real)
const res = await fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: text, sessionId }),
})
const data: AIResponse = await res.json()
```

O `sessionId` pode ser gerado no front com `crypto.randomUUID()` e armazenado em `sessionStorage`.

---

## CORS

```java
// CorsConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:5173",         // Dev
        "https://guiacidadao.df.gov.br"  // Prod
    ));
    config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    return new UrlBasedCorsConfigurationSource();
}
```

---

## Rate Limiting (Recomendado)

- 20 requisições por minuto por IP no endpoint `/chat`
- Implementar com Spring Boot + Bucket4j ou filtro customizado
- Retorna `429` com header `Retry-After: 60`

---

## Variáveis de Ambiente

```env
OPENROUTER_API_KEY=sk-or-...
SPRING_PROFILES_ACTIVE=dev|prod
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
```

---

## Estrutura Sugerida (Spring Boot)

```
src/main/java/br/gov/df/guiacidadao/
├── controller/
│   ├── ChatController.java       # POST /chat, POST /chat/feedback
│   └── ServicesController.java   # GET /services/*, GET /faq, GET /health
├── service/
│   ├── ChatService.java          # Orquestra LLM + validação + fallback
│   └── OpenRouterService.java    # Integração HTTP com OpenRouter
├── model/
│   ├── ChatRequest.java
│   ├── ChatResponse.java         # Mapeia para AIResponse do front
│   ├── FeedbackRequest.java
│   └── ServiceData.java
├── config/
│   ├── CorsConfig.java
│   └── OpenRouterConfig.java
└── GuiaCidadaoApplication.java
```

---

---

## Integração com APIs Brasileiras (mcp-brasil + APIBrasil)

O backend enriquece o contexto enviado ao LLM com dados reais buscados em tempo real **antes** de chamar o OpenRouter.
Este padrão é chamado de **RAG dinâmico**: detectar intenção → buscar dados → injetar no prompt → gerar resposta.

### Arquitetura do Fluxo `/chat`

```
Frontend → POST /chat
              │
              ▼
      IntentDetector.java
      (detecta CEP, serviço, cidade)
              │
    ┌─────────┴──────────┐
    ▼                    ▼
mcp-brasil             APIBrasil
(gratuito)             (comercial)
    │                    │
    └─────────┬──────────┘
              ▼
    ContextBuilder.java
    (monta system prompt enriquecido)
              │
              ▼
         OpenRouter
              │
              ▼
    ResponseParser.java
    (valida JSON → AIResponse)
              │
              ▼
         Frontend
```

---

### mcp-brasil (Open-Source, Gratuito)

**Repositório:** https://github.com/jxnxts/mcp-brasil
**Docs:** https://github.com/jxnxts/mcp-brasil#readme
**41 APIs públicas brasileiras, 363 tools**
**38 APIs sem autenticação**

#### Tools Relevantes para Guia Cidadão

| Tool | Descrição | Trigger |
|------|-----------|---------|
| `brasilapi_cep_v2` | Busca endereço completo por CEP | Usuário menciona CEP ou "meu bairro é X" |
| `brasilapi_cnpj` | Dados de empresa por CNPJ | "minha empresa", "empregador" |
| `cnes_estabelecimentos` | Lista unidades de saúde (UBS, UPA, hospital) | "médico", "saúde", "hospital" |
| `cnes_profissionais` | Profissionais de saúde cadastrados no SUS | "especialista", "médico" |
| `farmaciapopular_farmacia` | Farmácias com medicamentos gratuitos próximas | "medicamento", "remédio gratuito" |
| `anvisa_medicamento` | Consulta registro de medicamento na ANVISA | "remédio", "medicamento", "bula" |
| `sipni_cobertura_vacinal` | Cobertura vacinal por município/UF | "vacina", "vacinação" |
| `rename_medicamento` | Lista de medicamentos essenciais do SUS | "SUS", "remédio gratuito" |
| `transparencia_servidores` | Dados de servidores públicos | — |
| `brasilapi_ddd` | Cidades do DDD (para localização) | CEP não informado |

#### Chamada HTTP Direta (sem MCP client — recomendado para Java)

O mcp-brasil expõe as APIs subjacentes. Para o hackathon, chamar BrasilAPI diretamente é mais simples:

```java
// CEP lookup — BrasilAPI (gratuita, sem auth)
GET https://brasilapi.com.br/api/cep/v2/{cep}

// CNPJ
GET https://brasilapi.com.br/api/cnpj/v1/{cnpj}

// CNES — estabelecimentos de saúde
GET https://apidadosabertos.saude.gov.br/cnes/estabelecimentos?municipio_codigo=530010&limit=20
// Código IBGE de Brasília: 530010

// Farmácia Popular
GET https://apifarmaciaaberta.saude.gov.br/api/v1/farmacia/municipio/{municipio_ibge}
```

#### Exemplo — Enriquecer resposta sobre saúde com CNES

```java
// CnesService.java
public List<Estabelecimento> buscarUBSProximas(String municipioIbge) {
    String url = "https://apidadosabertos.saude.gov.br/cnes/estabelecimentos"
        + "?municipio_codigo=" + municipioIbge
        + "&tipo_unidade=01"   // 01 = UBS
        + "&limit=5";
    // ...GET, parse JSON, return list
}

// No ContextBuilder — adiciona ao system prompt:
// "Unidades Básicas de Saúde disponíveis em Brasília-DF:
//  - UBS 702 Norte, Tel: (61) 3325-xxxx
//  - UBS Asa Sul, Tel: ..."
```

---

### LocationService — Postos de Atendimento com Mapa

O backend mantém um banco estático de locais de atendimento e os injeta na resposta quando o serviço exige presença. O frontend renderiza um mapa Leaflet (OpenStreetMap) com os locais e botões de rota para Google Maps e Waze.

#### Locais cadastrados (dados estáticos — `locations.json` ou classe Java)

**Na Hora (9 unidades):**

| Nome | Lat | Lng | Telefone | Serviços |
|------|-----|-----|----------|----------|
| Rodoviária | -15.7943 | -47.8826 | (61) 2244-1146 | RG, CPF, CNH, Trabalho |
| Taguatinga / Águas Claras | -15.8344 | -48.0288 | (61) 2244-1158 | RG, CPF, CNH, Trabalho |
| Ceilândia | -15.8178 | -48.1043 | (61) 2244-1164 | RG, CPF, CNH, Trabalho |
| Gama | -16.0108 | -48.0620 | (61) 2104-1563 | RG, CPF, CNH, Trabalho |
| Sobradinho | -15.6538 | -47.7908 | (61) 2244-1170 | RG, CPF, CNH, Trabalho |
| Samambaia | -15.8769 | -48.0800 | (61) 2244-1172 | RG, CPF, CNH, Trabalho |
| Riacho Fundo | -15.8897 | -48.0239 | (61) 2244-1143 | RG, CPF, CNH, Trabalho |
| Brazlândia | -15.6736 | -48.2016 | (61) 2244-1176 | RG, CPF, Trabalho |
| Venâncio 2000 | -15.8042 | -47.9021 | (61) 2244-1148 | RG, CPF, CNH, INSS |

**PCDF / SSP-DF (2 unidades):**

| Nome | Lat | Lng | Telefone | Serviços |
|------|-----|-----|----------|----------|
| Instituto de Identificação — Central | -15.7987 | -47.8938 | (61) 3362-6950 | RG/CIN 1ª e 2ª via |
| Delegacia Eletrônica (online) | — | — | 197 | BO online, certidão |

**DETRAN-DF (4 unidades):**

| Nome | Lat | Lng | Serviços |
|------|-----|-----|----------|
| DETRAN Central (SEPN 515) | -15.7540 | -47.8910 | CNH, vistoria, licenciamento |
| DETRAN Taguatinga | -15.8427 | -48.0552 | CNH, vistoria |
| DETRAN Ceilândia | -15.8090 | -48.1038 | CNH, vistoria |
| DETRAN Gama | -16.0142 | -48.0596 | CNH, vistoria |

**SEDET/SINE (3 agências):** Brasília, Taguatinga, Ceilândia — Seguro-Desemprego, Emprego, Qualificação

**CRAS (5 unidades):** Asa Norte, Asa Sul, Ceilândia, Taguatinga, Samambaia — CadÚnico, Bolsa Família, BPC

**INSS (2 unidades):** Centro (Asa Sul) e Taguatinga — Aposentadoria, BPC, Auxílio

#### LocationService.java

```java
@Service
public class LocationService {

    // Carregado de locations.json no classpath (ou hardcoded para hackathon)
    private final Map<String, List<ServiceLocation>> locationsByCategory;

    public List<ServiceLocation> getForCategory(String category) {
        return locationsByCategory.getOrDefault(category, List.of());
    }
}
```

```java
// ServiceLocation.java (modelo)
public record ServiceLocation(
    String name,
    String type,          // "na-hora" | "pcdf" | "detran" | "sedet" | "cras" | "inss" | "ubs"
    String address,
    double lat,
    double lng,
    String phone,         // nullable
    String hours,         // nullable
    List<String> services,// nullable
    String online         // URL agendamento — nullable
) {}
```

#### Fluxo de seleção de locais no ChatService

```java
// ChatService.java — após detectar intent, antes de chamar OpenRouter
List<ServiceLocation> locations = locationService.getForCategory(intent.category());

// Para saúde: busca UBS dinâmicas via CNES (complementa com estáticos)
if ("saude".equals(intent.category())) {
    List<ServiceLocation> ubs = cnesService.buscarUBSProximas("530010");
    locations = new ArrayList<>(ubs);
}

// Inclui na resposta final
chatResponse.setLocations(locations);
```

#### Frontend — renderização do mapa

O frontend recebe `locations[]` na resposta do `/chat` e renderiza automaticamente o componente `LocationsMap`:

- **Mapa:** Leaflet + OpenStreetMap (sem API key, gratuito)
- **Pins coloridos:** verde = Na Hora | azul = PCDF | laranja = DETRAN | roxo = CRAS | vermelho = INSS
- **"Perto de mim":** geolocalização do browser → reordena lista por distância (Haversine) → pin azul do usuário no mapa
- **"Como chegar":** abre `google.com/maps/dir/?destination=LAT,LNG&travelmode=transit`
- **"Waze":** abre `waze.com/ul?ll=LAT,LNG&navigate=yes`
- **Popup no pin:** nome, tipo, telefone, horário, link "Como chegar"

---

### APIBrasil MCP (Comercial)

**MCP Server:** https://mcp.apibrasil.cloud/mcp
**Docs:** https://mcp.apibrasil.io / https://doc.apibrasil.io
**Requer:** cadastro para obter `deviceToken`; `bearer` via login

#### Autenticação

```java
// Fazer login UMA VEZ e cachear o bearer (TTL: verificar na doc)
POST https://mcp.apibrasil.cloud/mcp
Tool: apibrasil.auth_login
Params: { "email": "...", "password": "..." }
Response: { "bearer": "eyJ...", "expires_in": 3600 }
```

#### Tools Relevantes para Guia Cidadão

| Tool | Parâmetros | Trigger |
|------|-----------|---------|
| `apibrasil.cep_lookup` | `cep` | CEP no texto do usuário |
| `apibrasil.cnpj_lookup` | `cnpj` | CNPJ mencionado |
| `apibrasil.clima_tempo` | `cidade` | "como está o tempo", previsão |
| `apibrasil.vehicles_consulta` | `tipo`, `placa` | "meu carro", "placa", "FIPE" |
| `apibrasil.sms_send` | `numero`, `mensagem` | Notificação pós-atendimento |

#### Configuração Java

```properties
# application.properties
apibrasil.mcp.url=https://mcp.apibrasil.cloud/mcp
apibrasil.email=${APIBRASIL_EMAIL}
apibrasil.password=${APIBRASIL_PASSWORD}
apibrasil.device-token=${APIBRASIL_DEVICE_TOKEN}
apibrasil.bearer.cache-ttl-seconds=3500
```

```java
// ApiBrasilService.java
@Service
public class ApiBrasilService {

    @Value("${apibrasil.mcp.url}")
    private String mcpUrl;

    private String cachedBearer;
    private Instant bearerExpiry;

    public String getBearer() {
        if (cachedBearer == null || Instant.now().isAfter(bearerExpiry)) {
            // POST login ao MCP e atualizar cache
            cachedBearer = doLogin();
            bearerExpiry = Instant.now().plusSeconds(3500);
        }
        return cachedBearer;
    }

    public Map<String, Object> callTool(String tool, Map<String, Object> params) {
        params.put("bearer", getBearer());
        params.put("deviceToken", deviceToken);
        // POST para mcpUrl com JSON-RPC format
        // { "jsonrpc": "2.0", "method": "tools/call",
        //   "params": { "name": tool, "arguments": params } }
        // ...
    }
}
```

---

### IntentDetector — Detecção de Intenção e Dados

Antes de chamar o LLM, extrair dados estruturados do texto do usuário:

```java
// IntentDetector.java
public record DetectedIntent(
    String category,        // "saude", "trabalho", "transito", "documentos", "social"
    String cep,            // se mencionado
    String cnpj,           // se mencionado
    String placa,          // se mencionado
    String cidade          // extraída ou default "Brasília"
) {}

public DetectedIntent detect(String message) {
    String lower = message.toLowerCase();
    String cep = extractCep(lower);     // regex \d{5}-?\d{3}
    String cnpj = extractCnpj(lower);   // regex
    String placa = extractPlaca(lower); // regex [A-Z]{3}\d{4} ou [A-Z]{3}\d[A-Z]\d{2}

    String category = "geral";
    if (containsAny(lower, "médico","saúde","hospital","upa","sus","remédio","vacina"))
        category = "saude";
    else if (containsAny(lower, "emprego","trabalho","seguro desemprego","ctps","demiti"))
        category = "trabalho";
    else if (containsAny(lower, "cnh","carteira habilitação","multa","vistoria","detran","placa"))
        category = "transito";
    else if (containsAny(lower, "bolsa família","cras","bpc","assistência","pcd","aposentadoria"))
        category = "social";
    else if (containsAny(lower, "rg","cpf","documento","certidão","passaporte","identidade"))
        category = "documentos";

    return new DetectedIntent(category, cep, cnpj, placa, "Brasília");
}
```

---

### ContextBuilder — Injeção de Dados Reais no Prompt

```java
// ContextBuilder.java
public String buildEnrichedContext(DetectedIntent intent) {
    StringBuilder ctx = new StringBuilder();

    // Base: conteúdo do ai-context.md (carregado na inicialização)
    ctx.append(baseAiContext);
    ctx.append("\n\n## DADOS EM TEMPO REAL\n");

    if (intent.cep() != null) {
        var addr = brasilApiService.lookupCep(intent.cep());
        ctx.append("CEP informado pelo cidadão: ")
           .append(addr.logradouro()).append(", ")
           .append(addr.bairro()).append(", ")
           .append(addr.cidade()).append("-").append(addr.uf()).append("\n");
    }

    if ("saude".equals(intent.category())) {
        var ubs = cnesService.buscarUBSProximas("530010"); // Brasília IBGE
        ctx.append("Unidades Básicas de Saúde em Brasília:\n");
        ubs.forEach(u -> ctx.append("- ").append(u.nome())
            .append(", Tel: ").append(u.telefone()).append("\n"));
    }

    if ("transito".equals(intent.category()) && intent.placa() != null) {
        var veiculo = apiBrasilService.consultarVeiculo(intent.placa());
        ctx.append("Dados do veículo placa ").append(intent.placa()).append(":\n")
           .append(veiculo.toString()).append("\n");
    }

    return ctx.toString();
}
```

---

### Fluxo Completo do `POST /chat` com Enriquecimento

```java
// ChatService.java
public ChatResponse processMessage(ChatRequest req) {
    // 1. Detectar intenção e extrair dados estruturados
    DetectedIntent intent = intentDetector.detect(req.message());

    // 2. Buscar dados reais em paralelo (quando aplicável)
    String enrichedContext = contextBuilder.buildEnrichedContext(intent);

    // 3. Chamar OpenRouter com contexto enriquecido
    OpenRouterRequest llmReq = OpenRouterRequest.builder()
        .model("mistralai/mistral-7b-instruct:free")
        .systemMessage(enrichedContext)
        .userMessage(req.message())
        .maxTokens(1200)
        .temperature(0.3f)
        .responseFormat("json_object")
        .build();

    String llmJson = openRouterService.complete(llmReq);

    // 4. Parsear e validar resposta
    AIResponse aiResp = responseParser.parse(llmJson);

    // 5. Adicionar metadata e retornar
    return ChatResponse.from(aiResp, req.sessionId());
}
```

---

### Variáveis de Ambiente (Atualizado)

```env
# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# APIBrasil MCP (opcional — features avançadas)
APIBRASIL_EMAIL=seuemail@gmail.com
APIBRASIL_PASSWORD=suasenha
APIBRASIL_DEVICE_TOKEN=ea0cc458-df8c-4a0b-ac42-336c4fb7ccf5

# BrasilAPI (gratuita, sem auth — apenas configurar URL base)
BRASILAPI_URL=https://brasilapi.com.br/api

# CNES / DataSUS (gratuita, sem auth)
CNES_API_URL=https://apidadosabertos.saude.gov.br/cnes

# Spring
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

### Estrutura de Pacotes (Atualizada)

```
src/main/java/br/gov/df/guiacidadao/
├── controller/
│   ├── ChatController.java
│   └── ServicesController.java
├── service/
│   ├── ChatService.java              # Orquestra tudo
│   ├── OpenRouterService.java        # Integração LLM
│   ├── IntentDetector.java           # Detecta intenção no texto
│   ├── ContextBuilder.java           # Monta prompt enriquecido
│   ├── ResponseParser.java           # Parseia/valida JSON do LLM
│   ├── external/
│   │   ├── BrasilApiService.java     # CEP, CNPJ (gratuito)
│   │   ├── CnesService.java          # Estabelecimentos de saúde
│   │   ├── FarmaciaPopularService.java # Farmácias gratuitas
│   │   └── ApiBrasilService.java     # APIBrasil MCP (clima, veículos)
├── model/
│   ├── ChatRequest.java
│   ├── ChatResponse.java
│   ├── DetectedIntent.java
│   └── external/                     # DTOs das APIs externas
│       ├── CepResponse.java
│       ├── CnesEstabelecimento.java
│       └── VeiculoResponse.java
├── config/
│   ├── CorsConfig.java
│   ├── OpenRouterConfig.java
│   └── ExternalApiConfig.java
└── GuiaCidadaoApplication.java
```

---

---

## Portal da Transparência API (Federal)

**Swagger:** https://api.portaldatransparencia.gov.br/swagger-ui/index.html
**OpenAPI spec:** https://api.portaldatransparencia.gov.br/v3/api-docs
**Base URL:** `https://api.portaldatransparencia.gov.br`
**Auth:** Bearer token — cadastrar em portaldatransparencia.gov.br/api-de-dados/cadastrar-email
**Rate limits:** 400 req/min (geral) | 700 req/min (00h–06h) | 180 req/min (endpoints restritos)

### Endpoints Relevantes para Guia Cidadão

#### Benefícios Sociais

| Endpoint | Parâmetros | Caso de uso |
|----------|-----------|-------------|
| `GET /api-de-dados/novo-bolsa-familia-sacado-por-nis` | `nis`, `pagina` | Cidadão consulta se recebeu Bolsa Família pelo NIS |
| `GET /api-de-dados/novo-bolsa-familia-por-municipio` | `mesAno`, `codigoIbge`, `pagina` | Dados agregados de BF em Brasília (IBGE: 530010) |
| `GET /api-de-dados/peti-por-cpf-ou-nis` | `codigo` (CPF/NIS), `pagina` | Programa de Erradicação do Trabalho Infantil por NIS |
| `GET /api-de-dados/seguro-defeso-codigo` | `codigo` (CPF/NIS), `pagina` | Seguro Defeso por CPF/NIS |
| `GET /api-de-dados/safra-codigo-por-cpf-ou-nis` | `codigo` (CPF/NIS), `pagina` | Garantia-Safra por CPF/NIS |

#### Pessoas

| Endpoint | Parâmetros | Caso de uso |
|----------|-----------|-------------|
| `GET /api-de-dados/pessoa-fisica` | `cpf` ou `nis` | Verifica benefícios vinculados a uma pessoa |
| `GET /api-de-dados/pessoa-juridica` | `cnpj` | Dados de empresa (empregador) |

#### Sanções (Listas Negras)

| Endpoint | Parâmetros | Caso de uso |
|----------|-----------|-------------|
| `GET /api-de-dados/ceis` | `pagina` | Empresas e pessoas sancionadas (CEIS) |
| `GET /api-de-dados/cnep` | `pagina` | Cadastro Nacional de Empresas Punidas |
| `GET /api-de-dados/cepim` | `pagina` | Entidades impedidas de receber convênios |

#### Gastos Públicos (Transparência)

| Endpoint | Parâmetros | Caso de uso |
|----------|-----------|-------------|
| `GET /api-de-dados/despesas/por-orgao` | `ano`, `pagina` | Gastos anuais por órgão federal |
| `GET /api-de-dados/contratos` | `codigoOrgao`, `pagina` | Contratos por órgão |
| `GET /api-de-dados/licitacoes` | `codigoOrgao`, `pagina` | Licitações por órgão |
| `GET /api-de-dados/emendas` | `pagina` | Emendas parlamentares |

### Casos de Uso Práticos no Guia Cidadão

```
Pergunta: "recebi meu Bolsa Família esse mês?"
→ Intent: BOLSA_FAMILIA + NIS extraído do texto (ou solicitar ao cidadão)
→ GET /api-de-dados/novo-bolsa-familia-sacado-por-nis?nis={nis}&pagina=1
→ Resposta indica se houve saque/pagamento no mês corrente

Pergunta: "como saber se estou no cadastro único?"
→ Intent: CADASTRO_UNICO
→ GET /api-de-dados/pessoa-fisica?nis={nis}
→ Se retornar vazio → orientar procurar CRAS para inscrição

Pergunta: "quero saber sobre gastos do GDF"
→ Intent: TRANSPARENCIA
→ GET /api-de-dados/despesas/por-orgao?ano=2025&pagina=1
→ Formatar dados e injetar no contexto do LLM
```

### Configuração Java

```properties
# application.properties
transparencia.api.url=https://api.portaldatransparencia.gov.br
transparencia.api.key=${PORTAL_TRANSPARENCIA_API_KEY}
# Código IBGE do município de Brasília-DF
brasilia.ibge.code=530010
```

```java
// TransparenciaService.java
@Service
public class TransparenciaService {

    @Value("${transparencia.api.url}")
    private String baseUrl;

    @Value("${transparencia.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private <T> T get(String path, Class<T> type) throws Exception {
        var req = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("chave-api-dados", apiKey)      // auth header
            .header("Accept", "application/json")
            .GET().build();
        var res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        return new ObjectMapper().readValue(res.body(), type);
    }

    /** Consulta pagamentos Bolsa Família pelo NIS do cidadão */
    public List<BolsaFamiliaDTO> consultarBolsaFamilia(String nis) throws Exception {
        return get("/api-de-dados/novo-bolsa-familia-sacado-por-nis?nis=" + nis + "&pagina=1",
            new TypeReference<List<BolsaFamiliaDTO>>(){});
    }

    /** Verifica pessoa física (benefícios vinculados) */
    public PessoaFisicaDTO consultarPessoa(String cpfOuNis) throws Exception {
        return get("/api-de-dados/pessoa-fisica?cpf=" + cpfOuNis, PessoaFisicaDTO.class);
    }

    /** Dados de empresa pelo CNPJ */
    public PessoaJuridicaDTO consultarEmpresa(String cnpj) throws Exception {
        return get("/api-de-dados/pessoa-juridica?cnpj=" + cnpj, PessoaJuridicaDTO.class);
    }

    /** Bolsa Família agregado no mês para Brasília */
    public List<BeneficioMunicipioDTO> bolsaFamiliaEmBrasilia(String mesAno) throws Exception {
        return get("/api-de-dados/novo-bolsa-familia-por-municipio"
            + "?mesAno=" + mesAno + "&codigoIbge=530010&pagina=1",
            new TypeReference<List<BeneficioMunicipioDTO>>(){});
    }
}
```

### Atualização do IntentDetector

```java
// Novas categorias de intent para Portal da Transparência
if (containsAny(lower, "bolsa família", "benefício", "nis", "recebi", "pagamento"))
    category = "bolsa_familia";
else if (containsAny(lower, "cadastro único", "cad único", "cadunico"))
    category = "cadastro_unico";
else if (containsAny(lower, "gastos", "licitação", "contrato governo", "transparência"))
    category = "transparencia";

// Extração de NIS (11 dígitos)
String nis = extractNis(lower);  // regex \b\d{11}\b
```

### Atualização das Variáveis de Ambiente

```env
# Portal da Transparência (cadastrar em portaldatransparencia.gov.br/api-de-dados/cadastrar-email)
PORTAL_TRANSPARENCIA_API_KEY=sua-chave-aqui
```

### Estrutura de Pacotes (Atualizada)

```
service/
├── ChatService.java               # Orquestra tudo: intent → contexto → LLM → locais → resposta
├── IntentDetector.java            # Detecta categoria + extrai CEP, NIS, CNPJ, placa
├── ContextBuilder.java            # Monta system prompt com ai-context.md + dados reais
├── OpenRouterService.java         # POST para openrouter.ai/api/v1/chat/completions
├── ResponseParser.java            # Valida e parseia JSON do LLM → ChatResponse
├── LocationService.java           # Retorna ServiceLocation[] por categoria
└── external/
    ├── BrasilApiService.java      # CEP, CNPJ (gratuito, sem auth)
    ├── CnesService.java           # UBS/UPA por município IBGE (gratuito)
    ├── FarmaciaPopularService.java# Farmácias com remédios gratuitos (gratuito)
    ├── ApiBrasilService.java      # APIBrasil MCP: clima, FIPE, SMS (auth)
    └── TransparenciaService.java  # Portal da Transparência: BF por NIS, sanções (chave gratuita)

model/
├── ChatRequest.java               # { message, sessionId }
├── ChatResponse.java              # AIResponse completo + meta + locations
├── ServiceLocation.java           # { name, type, address, lat, lng, phone, hours, services, online }
├── DetectedIntent.java            # { category, cep, nis, cnpj, placa, cidade }
└── external/
    ├── CepResponse.java
    ├── CnesEstabelecimento.java
    ├── VeiculoResponse.java
    ├── BolsaFamiliaDTO.java
    ├── PessoaFisicaDTO.java
    ├── PessoaJuridicaDTO.java
    └── BeneficioMunicipioDTO.java

resources/
├── application.properties
├── locations.json                 # Banco estático de postos (Na Hora, PCDF, DETRAN, CRAS, INSS, SEDET)
└── ai-context.md                  # Copiado de docs/ai-context.md — carregado como system prompt base
```

---

### Resumo de Todas as Fontes de Dados Externas

| Fonte | Auth | Custo | Casos de Uso Principais |
|-------|------|-------|------------------------|
| **BrasilAPI** | Sem auth | Gratuito | CEP, CNPJ, DDD |
| **CNES/DataSUS** | Sem auth | Gratuito | UBS, UPA, hospitais próximos |
| **Farmácia Popular** | Sem auth | Gratuito | Remédios gratuitos SUS |
| **ANVISA** | Sem auth | Gratuito | Registro de medicamentos |
| **mcp-brasil** | Sem auth (38/41 APIs) | Gratuito | Meta-tool com 363 tools |
| **APIBrasil MCP** | Bearer + deviceToken | Comercial | CEP, CNPJ, clima, FIPE, SMS |
| **Portal Transparência** | chave-api-dados | Gratuito (cadastro) | Bolsa Família por NIS, pessoa física, sanções |

---

*Especificação elaborada para Hackathon Brasília Virtual 2026 — Desafio 1*
*Versão: 1.3 — Abril 2026 (+ LocationService, mapa Leaflet, ServiceLocation no response)*
