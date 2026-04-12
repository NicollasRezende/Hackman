# Backend Spring Boot — Guia Cidadao IA

> Hackathon Brasilia Virtual 2026 — Desafio 1
> Data: 2026-04-11

---

## 1. Visao Geral

Backend Java 21 + Spring Boot 3.x que serve como camada de inteligencia do Guia Cidadao.
Recebe perguntas em linguagem natural, enriquece com dados de APIs brasileiras, envia ao LLM (Gemma 4 31B via OpenRouter), e retorna resposta estruturada em JSON para o frontend React.

**Principio central:** Graceful degradation — se qualquer API externa falhar ou nao estiver configurada, o sistema continua funcionando com contexto estatico. Nenhum endpoint quebra.

---

## 2. Arquitetura

```
Frontend (React/Vite :5173)
    |
    v
Spring Boot (:8080) /api/v1/*
    |
    +-- ChatController --> ChatService
    |                        |
    |                   IntentDetector (regex: CEP, CNPJ, placa, NIS, categoria)
    |                        |
    |                   ExternalDataAggregator (paralelo, fail-safe)
    |                        +-- BrasilApiService (CEP, CNPJ)
    |                        +-- CnesService (UBS, UPA)
    |                        +-- FarmaciaPopularService
    |                        +-- AnvisaService
    |                        +-- TransparenciaService (Bolsa Familia, pessoa)
    |                        |
    |                   ContextBuilder (ai-context.md + dados reais)
    |                        |
    |                   OpenRouterService --> Gemma 4 31B free (OpenRouter)
    |                        |
    |                   ResponseParser (valida JSON --> AIResponse)
    |                        |
    |                   ChatResponse + metadata
    |
    +-- ServicesController --> dados estaticos (featured, status, suggestions, FAQ)
    |
    +-- H2 in-memory --> feedback + logs de sessao
```

---

## 3. Endpoints

| Metodo | Path | Descricao |
|--------|------|-----------|
| `POST` | `/api/v1/chat` | Pergunta do cidadao -> resposta IA estruturada |
| `POST` | `/api/v1/chat/feedback` | Salva feedback (positive/negative) no H2 |
| `GET` | `/api/v1/services/featured` | Servicos em destaque |
| `GET` | `/api/v1/services/status` | Dashboard de status |
| `GET` | `/api/v1/services/suggestions` | Sugestoes de busca |
| `GET` | `/api/v1/faq` | FAQ por categoria |
| `GET` | `/api/v1/health` | Health check |

---

## 4. Fluxo do POST /chat

1. Recebe `{ "message": "...", "sessionId": "..." }`
2. **IntentDetector** extrai do texto:
   - `category`: saude, trabalho, transito, documentos, social, bolsa_familia, cadastro_unico, transparencia, geral
   - `cep`: regex `\d{5}-?\d{3}`
   - `cnpj`: regex `\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}`
   - `placa`: regex `[A-Z]{3}\d{4}` ou `[A-Z]{3}\d[A-Z]\d{2}` (Mercosul)
   - `nis`: regex `\b\d{11}\b`
3. **ExternalDataAggregator** chama APIs em paralelo via `CompletableFuture`:
   - Cada chamada tem timeout de 5 segundos
   - Falhas retornam `Optional.empty()` — sem propagar excecao
   - Chamadas sao condicionais: so chama CNES se categoria for "saude", etc.
4. **ContextBuilder** monta o system prompt:
   - Base: conteudo completo do `ai-context.md`
   - Apende secao `## DADOS EM TEMPO REAL` com dados coletados
   - Se nenhum dado externo disponivel, usa apenas o contexto estatico
   - Apende instrucoes de formato: "Responda SEMPRE em JSON valido com os campos: tag, intro, blocks, steps, tip, contact, related"
5. **OpenRouterService** chama Gemma 4 31B:
   - Model: `google/gemma-4-31b-it:free`
   - `reasoning.enabled: true`
   - `response_format: { type: "json_object" }`
   - `max_tokens: 1500`
   - `temperature: 0.3`
   - Timeout: 30 segundos
6. **ResponseParser** valida o JSON retornado:
   - Extrai campo de resposta do envelope OpenRouter
   - Parseia como `AIResponse`
   - Valida campos obrigatorios (tag, intro, blocks, steps)
   - Se JSON invalido: retry 1x apos 2s
   - Se falhar de novo: retorna resposta fallback (orientar ligar 156)
7. Salva log no H2 (`ChatLog`)
8. Retorna `ChatResponse` com metadata (sessionId, responseId, model, processingMs, timestamp)

---

## 5. Integracao OpenRouter

### Configuracao

```properties
openrouter.api.key=${OPENROUTER_API_KEY}
openrouter.api.url=https://openrouter.ai/api/v1/chat/completions
openrouter.model=google/gemma-4-31b-it:free
openrouter.timeout.seconds=30
openrouter.max-tokens=1500
openrouter.temperature=0.3
```

### Request ao OpenRouter

```json
{
  "model": "google/gemma-4-31b-it:free",
  "messages": [
    {
      "role": "system",
      "content": "<ai-context.md + dados em tempo real + instrucoes de formato JSON>"
    },
    {
      "role": "user",
      "content": "<pergunta do cidadao>"
    }
  ],
  "max_tokens": 1500,
  "temperature": 0.3,
  "reasoning": { "enabled": true },
  "response_format": { "type": "json_object" }
}
```

### Schema JSON esperado do LLM

```json
{
  "tag": { "cls": "tag-health", "icon": "HeartPulse", "txt": "Saude" },
  "intro": "string (HTML basico permitido)",
  "blocks": [
    { "icon": "string", "title": "string", "body": "string (opcional)", "docs": ["string (opcional)"] }
  ],
  "steps": ["string (HTML basico permitido)"],
  "tip": "string (opcional)",
  "contact": { "title": "string", "addr": "string", "phone": "string", "hours": "string" },
  "related": ["string"]
}
```

---

## 6. APIs Externas — Graceful Degradation

Todas as chamadas externas seguem o mesmo padrao:

```java
public Optional<T> buscar(String param) {
    try {
        // chamada HTTP com timeout de 5s
        return Optional.of(resultado);
    } catch (Exception e) {
        log.warn("API X indisponivel: {}", e.getMessage());
        return Optional.empty();
    }
}
```

Se a variavel de ambiente nao estiver configurada (ex: `PORTAL_TRANSPARENCIA_API_KEY` vazia), o service nem tenta chamar — retorna `Optional.empty()` direto.

### APIs e Triggers

| Service | API Base | Auth | Trigger (categoria/dados) |
|---------|----------|------|--------------------------|
| BrasilApiService | brasilapi.com.br | Nenhuma | CEP detectado no texto |
| BrasilApiService | brasilapi.com.br | Nenhuma | CNPJ detectado no texto |
| CnesService | apidadosabertos.saude.gov.br | Nenhuma | categoria = saude |
| FarmaciaPopularService | apifarmaciaaberta.saude.gov.br | Nenhuma | categoria = saude + "remedio/farmacia" |
| AnvisaService | (via BrasilAPI/mcp-brasil) | Nenhuma | "medicamento/remedio/bula" no texto |
| TransparenciaService | api.portaldatransparencia.gov.br | chave-api-dados | NIS detectado OU categoria = bolsa_familia/transparencia |

### Variaveis de Ambiente

```env
# Obrigatorio
OPENROUTER_API_KEY=sk-or-...

# Opcionais (graceful degradation se ausentes)
PORTAL_TRANSPARENCIA_API_KEY=
BRASILAPI_URL=https://brasilapi.com.br/api
CNES_API_URL=https://apidadosabertos.saude.gov.br/cnes
```

---

## 7. Banco de Dados (H2 In-Memory)

### Tabela: chat_feedback

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | BIGINT (PK, auto) | ID |
| response_id | VARCHAR(50) | ID da resposta avaliada |
| session_id | VARCHAR(50) | ID da sessao |
| vote | VARCHAR(10) | "positive" ou "negative" |
| created_at | TIMESTAMP | Data/hora |

### Tabela: chat_log

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | BIGINT (PK, auto) | ID |
| session_id | VARCHAR(50) | ID da sessao |
| message | VARCHAR(500) | Pergunta do cidadao |
| response_id | VARCHAR(50) | ID da resposta gerada |
| category | VARCHAR(30) | Categoria detectada |
| processing_ms | BIGINT | Tempo de processamento |
| created_at | TIMESTAMP | Data/hora |

### Configuracao

```properties
spring.datasource.url=jdbc:h2:mem:guiacidadao
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create
spring.h2.console.enabled=true
```

Console H2 acessivel em `/h2-console` durante dev.

---

## 8. Endpoints Estaticos

Os endpoints `GET /services/*`, `GET /faq` retornam dados estaticos carregados de arquivos JSON em `src/main/resources/data/`. Esses JSONs sao gerados a partir dos dados que ja existem no frontend (`src/data/services.ts`).

---

## 9. CORS

```java
allowedOrigins: "http://localhost:5173" (dev), "https://guiacidadao.df.gov.br" (prod)
allowedMethods: GET, POST, OPTIONS
allowedHeaders: *
```

Configuravel via `CORS_ALLOWED_ORIGINS` env var.

---

## 10. Estrutura de Pacotes

```
backend/
+-- pom.xml
+-- src/main/java/br/gov/df/guiacidadao/
|   +-- GuiaCidadaoApplication.java
|   +-- controller/
|   |   +-- ChatController.java
|   |   +-- ServicesController.java
|   +-- service/
|   |   +-- ChatService.java
|   |   +-- IntentDetector.java
|   |   +-- ContextBuilder.java
|   |   +-- OpenRouterService.java
|   |   +-- ResponseParser.java
|   |   +-- ExternalDataAggregator.java
|   |   +-- external/
|   |       +-- BrasilApiService.java
|   |       +-- CnesService.java
|   |       +-- FarmaciaPopularService.java
|   |       +-- AnvisaService.java
|   |       +-- TransparenciaService.java
|   +-- model/
|   |   +-- ChatRequest.java
|   |   +-- ChatResponse.java
|   |   +-- DetectedIntent.java
|   |   +-- FeedbackRequest.java
|   |   +-- dto/
|   |       +-- CepResponse.java
|   |       +-- CnpjResponse.java
|   |       +-- CnesEstabelecimento.java
|   |       +-- FarmaciaDTO.java
|   |       +-- MedicamentoDTO.java
|   |       +-- BolsaFamiliaDTO.java
|   |       +-- PessoaFisicaDTO.java
|   +-- entity/
|   |   +-- ChatFeedback.java
|   |   +-- ChatLog.java
|   +-- repository/
|   |   +-- ChatFeedbackRepository.java
|   |   +-- ChatLogRepository.java
|   +-- config/
|       +-- CorsConfig.java
|       +-- WebClientConfig.java
+-- src/main/resources/
    +-- application.properties
    +-- ai-context.md
    +-- data/
        +-- featured-services.json
        +-- status-cards.json
        +-- suggestions.json
        +-- faq.json
```

---

## 11. Migracao do Frontend

Unica mudanca necessaria no frontend — `src/App.tsx`:

```typescript
// ANTES
const data = matchResponse(text)

// DEPOIS
const res = await fetch('http://localhost:8080/api/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: text, sessionId }),
})
const json = await res.json()
const data: AIResponse = json // schema identico
```

O campo `keys` do tipo `AIResponse` no frontend passa a ser opcional (nao vem da API).
Todos os componentes de chat (`AIMessage`, `LocationsMap`, etc.) continuam funcionando sem alteracao.

---

## 12. Dependencias Maven (pom.xml)

- `spring-boot-starter-web` — REST controllers
- `spring-boot-starter-data-jpa` — JPA + H2
- `spring-boot-starter-webflux` — WebClient para chamadas HTTP reativas
- `spring-boot-starter-validation` — validacao de request
- `h2` (runtime) — banco in-memory
- `lombok` — reduzir boilerplate
- `jackson-databind` — JSON parsing (ja incluso no starter-web)

---

## 13. Health Check

`GET /api/v1/health` retorna:

```json
{
  "status": "UP",
  "timestamp": "2026-04-11T10:00:00Z",
  "services": {
    "openrouter": "UP|DOWN",
    "brasilapi": "UP|DOWN|NOT_CONFIGURED",
    "cnes": "UP|DOWN|NOT_CONFIGURED",
    "transparencia": "UP|DOWN|NOT_CONFIGURED"
  }
}
```

Status de cada servico externo eh verificado com base na ultima chamada bem-sucedida (cache de 5 min).

---

## 14. Decisoes de Design

| Decisao | Justificativa |
|---------|--------------|
| Gemma 4 31B free | Gratuito, 256K contexto, reasoning mode, multilingual |
| H2 in-memory | Zero config para hackathon, JPA pronto |
| WebClient (WebFlux) | Chamadas HTTP nao-bloqueantes para APIs externas |
| CompletableFuture para APIs | Paralelismo nas chamadas externas, reduce latencia total |
| Monorepo (backend/) | Tudo junto para hackathon, um repo so |
| Graceful degradation | APIs externas sao bonus, nao dependencia |
| Retry 1x no LLM | Equilibrio entre resiliencia e latencia |
| JSON estatico para services/faq | Identico ao frontend, sem duplicar logica |

---

*Spec para Hackathon Brasilia Virtual 2026 — Desafio 1*
