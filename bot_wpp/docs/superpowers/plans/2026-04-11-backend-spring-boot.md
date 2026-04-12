# Backend Spring Boot — Guia Cidadao IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Spring Boot backend that receives citizen questions, enriches context with Brazilian public APIs, calls Gemma 4 31B via OpenRouter, and returns structured JSON responses compatible with the existing React frontend.

**Architecture:** Spring Boot 3.x REST API with IntentDetector (regex-based), ExternalDataAggregator (parallel fail-safe API calls), ContextBuilder (ai-context.md + real-time data), OpenRouterService (Gemma 4 31B free), and ResponseParser (JSON validation). H2 in-memory for feedback/logs. All external APIs use graceful degradation.

**Tech Stack:** Java 21, Spring Boot 3.x, Spring WebFlux (WebClient), Spring Data JPA, H2, Maven, OpenRouter API (Gemma 4 31B free)

---

## File Structure

```
backend/
├── pom.xml
├── src/main/java/br/gov/df/guiacidadao/
│   ├── GuiaCidadaoApplication.java
│   ├── config/
│   │   ├── CorsConfig.java
│   │   └── WebClientConfig.java
│   ├── controller/
│   │   ├── ChatController.java
│   │   └── ServicesController.java
│   ├── model/
│   │   ├── ChatRequest.java
│   │   ├── ChatResponse.java
│   │   ├── DetectedIntent.java
│   │   ├── FeedbackRequest.java
│   │   └── dto/
│   │       ├── CepResponse.java
│   │       ├── CnpjResponse.java
│   │       ├── CnesEstabelecimento.java
│   │       ├── FarmaciaDTO.java
│   │       ├── MedicamentoDTO.java
│   │       ├── BolsaFamiliaDTO.java
│   │       └── PessoaFisicaDTO.java
│   ├── entity/
│   │   ├── ChatFeedback.java
│   │   └── ChatLog.java
│   ├── repository/
│   │   ├── ChatFeedbackRepository.java
│   │   └── ChatLogRepository.java
│   └── service/
│       ├── ChatService.java
│       ├── IntentDetector.java
│       ├── ContextBuilder.java
│       ├── OpenRouterService.java
│       ├── ResponseParser.java
│       ├── ExternalDataAggregator.java
│       └── external/
│           ├── BrasilApiService.java
│           ├── CnesService.java
│           ├── FarmaciaPopularService.java
│           ├── AnvisaService.java
│           └── TransparenciaService.java
├── src/main/resources/
│   ├── application.properties
│   ├── ai-context.md
│   └── data/
│       ├── featured-services.json
│       ├── status-cards.json
│       ├── suggestions.json
│       └── faq.json
├── src/test/java/br/gov/df/guiacidadao/
│   ├── service/
│   │   ├── IntentDetectorTest.java
│   │   ├── ContextBuilderTest.java
│   │   └── ResponseParserTest.java
│   └── controller/
│       └── ChatControllerTest.java
```

Frontend modifications:
- Modify: `src/App.tsx` (replace matchResponse with API call)
- Modify: `src/types/index.ts` (make `keys` optional)

---

### Task 1: Spring Boot Project Scaffold (pom.xml + Application + Config)

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/GuiaCidadaoApplication.java`
- Create: `backend/src/main/resources/application.properties`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/config/WebClientConfig.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/config/CorsConfig.java`

- [ ] **Step 1: Create pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.4</version>
        <relativePath/>
    </parent>

    <groupId>br.gov.df</groupId>
    <artifactId>guia-cidadao</artifactId>
    <version>1.0.0</version>
    <name>Guia Cidadao IA</name>
    <description>Backend do Guia Cidadao - Hackathon Brasilia Virtual 2026</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- WebClient for external API calls -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <!-- JPA + H2 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 2: Create GuiaCidadaoApplication.java**

```java
package br.gov.df.guiacidadao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GuiaCidadaoApplication {
    public static void main(String[] args) {
        SpringApplication.run(GuiaCidadaoApplication.class, args);
    }
}
```

- [ ] **Step 3: Create application.properties**

```properties
server.port=8080

# H2
spring.datasource.url=jdbc:h2:mem:guiacidadao
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# OpenRouter
openrouter.api.key=${OPENROUTER_API_KEY:}
openrouter.api.url=https://openrouter.ai/api/v1/chat/completions
openrouter.model=google/gemma-4-31b-it:free
openrouter.timeout.seconds=30
openrouter.max-tokens=1500
openrouter.temperature=0.3

# External APIs (all optional - graceful degradation)
brasilapi.url=https://brasilapi.com.br/api
cnes.api.url=https://apidadosabertos.saude.gov.br/cnes
farmacia.popular.api.url=https://apifarmaciaaberta.saude.gov.br/api/v1
transparencia.api.url=https://api.portaldatransparencia.gov.br
transparencia.api.key=${PORTAL_TRANSPARENCIA_API_KEY:}
brasilia.ibge.code=530010

# CORS
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}

# Logging
logging.level.br.gov.df.guiacidadao=DEBUG
logging.level.org.springframework.web=INFO
```

- [ ] **Step 4: Create WebClientConfig.java**

```java
package br.gov.df.guiacidadao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }
}
```

- [ ] **Step 5: Create CorsConfig.java**

```java
package br.gov.df.guiacidadao.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        for (String origin : allowedOrigins.split(",")) {
            config.addAllowedOrigin(origin.trim());
        }
        config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

- [ ] **Step 6: Verify project compiles**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 7: Verify application starts**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn spring-boot:run &` then check `curl -s http://localhost:8080/h2-console -o /dev/null -w "%{http_code}"` returns 200, then stop the process.

- [ ] **Step 8: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/pom.xml backend/src/main/java/br/gov/df/guiacidadao/GuiaCidadaoApplication.java backend/src/main/resources/application.properties backend/src/main/java/br/gov/df/guiacidadao/config/
git commit -m "feat: scaffold Spring Boot project with config, CORS, and H2"
```

---

### Task 2: Models, Entities, and Repositories

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/ChatRequest.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/ChatResponse.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/DetectedIntent.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/FeedbackRequest.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/entity/ChatFeedback.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/entity/ChatLog.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/repository/ChatFeedbackRepository.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/repository/ChatLogRepository.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/CepResponse.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/CnpjResponse.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/CnesEstabelecimento.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/FarmaciaDTO.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/MedicamentoDTO.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/BolsaFamiliaDTO.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/model/dto/PessoaFisicaDTO.java`

- [ ] **Step 1: Create ChatRequest.java**

```java
package br.gov.df.guiacidadao.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank @Size(max = 500) String message,
        String sessionId
) {}
```

- [ ] **Step 2: Create ChatResponse.java**

This is the main response returned by `POST /chat`. It wraps the AI response with metadata.

```java
package br.gov.df.guiacidadao.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatResponse(
        Tag tag,
        String intro,
        List<Block> blocks,
        List<String> steps,
        String tip,
        Contact contact,
        List<String> related,
        Meta meta
) {
    public record Tag(String cls, String icon, String txt) {}

    public record Block(String icon, String title, String body, List<String> docs) {}

    public record Contact(String title, String addr, String phone, String hours) {}

    public record Meta(
            String sessionId,
            String responseId,
            String model,
            long processingMs,
            String timestamp
    ) {}

    public static ChatResponse fromParsed(
            Tag tag, String intro, List<Block> blocks, List<String> steps,
            String tip, Contact contact, List<String> related,
            String sessionId, String model, long processingMs
    ) {
        Meta meta = new Meta(
                sessionId,
                "resp_" + UUID.randomUUID().toString().substring(0, 8),
                model,
                processingMs,
                Instant.now().toString()
        );
        return new ChatResponse(tag, intro, blocks, steps, tip, contact, related, meta);
    }

    /** Fallback response when LLM fails */
    public static ChatResponse fallback(String sessionId, String model) {
        return new ChatResponse(
                new Tag("tag-social", "HelpCircle", "Assistente indisponivel"),
                "Desculpe, nosso assistente esta temporariamente indisponivel. Por favor, tente novamente em alguns instantes.",
                List.of(new Block("Phone", "Precisa de ajuda agora?",
                        "Ligue para a Central do Cidadao: <strong>156</strong> (gratuito, 24 horas).", null)),
                List.of(
                        "Ligue <strong>156</strong> para orientacao sobre qualquer servico do GDF",
                        "Acesse <a href=\"https://www.df.gov.br\" class=\"text-verde font-semibold\">df.gov.br</a> para servicos online"
                ),
                null, null,
                List.of("Como agendar consulta pelo SUS?", "Como solicitar seguro-desemprego?", "Como emitir segunda via do RG?"),
                new Meta(sessionId, "resp_fallback", model, 0, Instant.now().toString())
        );
    }
}
```

- [ ] **Step 3: Create DetectedIntent.java**

```java
package br.gov.df.guiacidadao.model;

public record DetectedIntent(
        String category,
        String cep,
        String cnpj,
        String placa,
        String nis,
        String cidade
) {}
```

- [ ] **Step 4: Create FeedbackRequest.java**

```java
package br.gov.df.guiacidadao.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record FeedbackRequest(
        @NotBlank String responseId,
        String sessionId,
        @NotBlank @Pattern(regexp = "positive|negative") String vote
) {}
```

- [ ] **Step 5: Create entities ChatFeedback.java and ChatLog.java**

```java
// ChatFeedback.java
package br.gov.df.guiacidadao.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_feedback")
public class ChatFeedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "response_id", length = 50)
    private String responseId;

    @Column(name = "session_id", length = 50)
    private String sessionId;

    @Column(length = 10)
    private String vote;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ChatFeedback() {}

    public ChatFeedback(String responseId, String sessionId, String vote) {
        this.responseId = responseId;
        this.sessionId = sessionId;
        this.vote = vote;
    }

    public Long getId() { return id; }
    public String getResponseId() { return responseId; }
    public String getSessionId() { return sessionId; }
    public String getVote() { return vote; }
    public Instant getCreatedAt() { return createdAt; }
}
```

```java
// ChatLog.java
package br.gov.df.guiacidadao.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_log")
public class ChatLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", length = 50)
    private String sessionId;

    @Column(length = 500)
    private String message;

    @Column(name = "response_id", length = 50)
    private String responseId;

    @Column(length = 30)
    private String category;

    @Column(name = "processing_ms")
    private Long processingMs;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ChatLog() {}

    public ChatLog(String sessionId, String message, String responseId, String category, Long processingMs) {
        this.sessionId = sessionId;
        this.message = message;
        this.responseId = responseId;
        this.category = category;
        this.processingMs = processingMs;
    }

    public Long getId() { return id; }
    public String getSessionId() { return sessionId; }
    public String getMessage() { return message; }
    public String getResponseId() { return responseId; }
    public String getCategory() { return category; }
    public Long getProcessingMs() { return processingMs; }
    public Instant getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 6: Create repositories**

```java
// ChatFeedbackRepository.java
package br.gov.df.guiacidadao.repository;

import br.gov.df.guiacidadao.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {}
```

```java
// ChatLogRepository.java
package br.gov.df.guiacidadao.repository;

import br.gov.df.guiacidadao.entity.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {}
```

- [ ] **Step 7: Create external API DTOs**

```java
// CepResponse.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CepResponse(
        String cep, String state, String city,
        String neighborhood, String street
) {}
```

```java
// CnpjResponse.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CnpjResponse(
        String cnpj,
        @JsonProperty("razao_social") String razaoSocial,
        @JsonProperty("nome_fantasia") String nomeFantasia,
        @JsonProperty("descricao_situacao_cadastral") String situacao,
        String municipio, String uf
) {}
```

```java
// CnesEstabelecimento.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CnesEstabelecimento(
        @JsonProperty("nome_fantasia") String nomeFantasia,
        @JsonProperty("endereco_estabelecimento") String endereco,
        @JsonProperty("numero_telefone_estabelecimento") String telefone,
        @JsonProperty("descricao_turno_atendimento") String turno,
        @JsonProperty("codigo_tipo_unidade") String tipoUnidade
) {}
```

```java
// FarmaciaDTO.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FarmaciaDTO(
        String nomeFantasia,
        String endereco,
        String bairro,
        String telefone
) {}
```

```java
// MedicamentoDTO.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MedicamentoDTO(
        String nomeProduto,
        String empresa,
        String processo,
        String registro
) {}
```

```java
// BolsaFamiliaDTO.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BolsaFamiliaDTO(
        String mesReferencia,
        String municipio,
        String uf,
        Double valor
) {}
```

```java
// PessoaFisicaDTO.java
package br.gov.df.guiacidadao.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PessoaFisicaDTO(
        String nome,
        String cpfFormatado,
        String nis
) {}
```

- [ ] **Step 8: Verify compilation**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 9: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/model/ backend/src/main/java/br/gov/df/guiacidadao/entity/ backend/src/main/java/br/gov/df/guiacidadao/repository/
git commit -m "feat: add models, entities, repositories, and external API DTOs"
```

---

### Task 3: IntentDetector

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/IntentDetector.java`
- Create: `backend/src/test/java/br/gov/df/guiacidadao/service/IntentDetectorTest.java`

- [ ] **Step 1: Write IntentDetectorTest.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IntentDetectorTest {

    private final IntentDetector detector = new IntentDetector();

    @Test
    void detectsSaudeCategory() {
        DetectedIntent intent = detector.detect("to passando mal preciso de medico");
        assertEquals("saude", intent.category());
    }

    @Test
    void detectsTrabalhoCategory() {
        DetectedIntent intent = detector.detect("fui demitido e preciso do seguro desemprego");
        assertEquals("trabalho", intent.category());
    }

    @Test
    void detectsTransitoCategory() {
        DetectedIntent intent = detector.detect("quero tirar minha primeira CNH");
        assertEquals("transito", intent.category());
    }

    @Test
    void detectsDocumentosCategory() {
        DetectedIntent intent = detector.detect("preciso da segunda via do RG");
        assertEquals("documentos", intent.category());
    }

    @Test
    void detectsSocialCategory() {
        DetectedIntent intent = detector.detect("como me inscrever no bolsa familia");
        assertEquals("social", intent.category());
    }

    @Test
    void detectsPrevidenciaCategory() {
        DetectedIntent intent = detector.detect("quero me aposentar pelo INSS");
        assertEquals("previdencia", intent.category());
    }

    @Test
    void detectsBolsaFamiliaWithNis() {
        DetectedIntent intent = detector.detect("recebi meu bolsa familia? meu NIS 12345678901");
        assertEquals("bolsa_familia", intent.category());
        assertEquals("12345678901", intent.nis());
    }

    @Test
    void detectsCep() {
        DetectedIntent intent = detector.detect("moro no CEP 70040-020 e preciso de medico");
        assertEquals("70040020", intent.cep());
        assertEquals("saude", intent.category());
    }

    @Test
    void detectsCepWithDash() {
        DetectedIntent intent = detector.detect("meu cep eh 72000-000");
        assertEquals("72000000", intent.cep());
    }

    @Test
    void detectsCnpj() {
        DetectedIntent intent = detector.detect("minha empresa CNPJ 12.345.678/0001-90");
        assertEquals("12345678000190", intent.cnpj());
    }

    @Test
    void detectsPlacaOld() {
        DetectedIntent intent = detector.detect("meu carro placa ABC1234");
        assertEquals("ABC1234", intent.placa());
    }

    @Test
    void detectsPlacaMercosul() {
        DetectedIntent intent = detector.detect("placa do veiculo ABC1D23");
        assertEquals("ABC1D23", intent.placa());
    }

    @Test
    void defaultsToGeralWhenNoMatch() {
        DetectedIntent intent = detector.detect("ola bom dia");
        assertEquals("geral", intent.category());
    }

    @Test
    void defaultsCidadeToBrasilia() {
        DetectedIntent intent = detector.detect("qualquer coisa");
        assertEquals("Brasilia", intent.cidade());
    }

    @Test
    void handlesAccentsAndCaseInsensitive() {
        DetectedIntent intent = detector.detect("QUERO TIRAR MINHA CARTEIRA DE MOTORISTA");
        assertEquals("transito", intent.category());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -pl . -Dtest=IntentDetectorTest -q 2>&1 | tail -5`
Expected: COMPILATION FAILURE (IntentDetector class does not exist)

- [ ] **Step 3: Write IntentDetector.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IntentDetector {

    private static final Pattern CEP_PATTERN = Pattern.compile("\\b(\\d{5})-?(\\d{3})\\b");
    private static final Pattern CNPJ_PATTERN = Pattern.compile("\\b(\\d{2})\\.?(\\d{3})\\.?(\\d{3})/?(\\d{4})-?(\\d{2})\\b");
    private static final Pattern PLACA_OLD_PATTERN = Pattern.compile("\\b([A-Z]{3})(\\d{4})\\b");
    private static final Pattern PLACA_MERCOSUL_PATTERN = Pattern.compile("\\b([A-Z]{3})(\\d)([A-Z])(\\d{2})\\b");
    private static final Pattern NIS_PATTERN = Pattern.compile("\\b(\\d{11})\\b");

    public DetectedIntent detect(String message) {
        String normalized = normalize(message);
        String upper = message.toUpperCase();

        String cep = extractCep(normalized);
        String cnpj = extractCnpj(normalized);
        String placa = extractPlaca(upper);
        String nis = extractNis(normalized);

        String category = detectCategory(normalized, nis);

        return new DetectedIntent(category, cep, cnpj, placa, nis, "Brasilia");
    }

    private String detectCategory(String text, String nis) {
        // More specific categories first
        if (containsAny(text, "bolsa familia", "beneficio", "recebi", "pagamento") && nis != null) {
            return "bolsa_familia";
        }
        if (containsAny(text, "bolsa familia", "cras", "bpc", "loas", "assistencia", "cadunico",
                "cad unico", "cadastro unico", "mae solo", "mae solteira", "auxilio",
                "beneficio social", "cesta basica", "pcd", "deficiencia", "deficiente",
                "pessoa com deficiencia")) {
            return "social";
        }
        if (containsAny(text, "aposentar", "aposentadoria", "previdencia", "inss", "me aposentar")) {
            return "previdencia";
        }
        if (containsAny(text, "medico", "saude", "hospital", "upa", "ubs", "sus", "remedio",
                "vacina", "doente", "passando mal", "dor", "consulta", "farmacia",
                "medicamento", "bula", "agendar consulta")) {
            return "saude";
        }
        if (containsAny(text, "emprego", "trabalho", "seguro desemprego", "seguro-desemprego",
                "ctps", "demiti", "demissao", "fgts", "sine", "carteira de trabalho",
                "perdi meu emprego", "fui mandado", "dispensad")) {
            return "trabalho";
        }
        if (containsAny(text, "cnh", "habilitacao", "carteira de motorista", "multa",
                "vistoria", "detran", "placa", "licenciamento", "veiculo")) {
            return "transito";
        }
        if (containsAny(text, "rg", "cpf", "documento", "certidao", "passaporte",
                "identidade", "cin", "titulo de eleitor", "segunda via")) {
            return "documentos";
        }
        if (containsAny(text, "gastos", "licitacao", "contrato governo", "transparencia")) {
            return "transparencia";
        }
        return "geral";
    }

    private String extractCep(String text) {
        Matcher m = CEP_PATTERN.matcher(text);
        return m.find() ? m.group(1) + m.group(2) : null;
    }

    private String extractCnpj(String text) {
        Matcher m = CNPJ_PATTERN.matcher(text);
        return m.find() ? m.group(1) + m.group(2) + m.group(3) + m.group(4) + m.group(5) : null;
    }

    private String extractPlaca(String upper) {
        Matcher m = PLACA_MERCOSUL_PATTERN.matcher(upper);
        if (m.find()) return m.group(1) + m.group(2) + m.group(3) + m.group(4);
        m = PLACA_OLD_PATTERN.matcher(upper);
        return m.find() ? m.group(1) + m.group(2) : null;
    }

    private String extractNis(String text) {
        Matcher m = NIS_PATTERN.matcher(text);
        return m.find() ? m.group(1) : null;
    }

    private String normalize(String text) {
        String lower = text.toLowerCase();
        return Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("[\\u0300-\\u036f]", "");
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -Dtest=IntentDetectorTest -q`
Expected: All 15 tests pass

- [ ] **Step 5: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/IntentDetector.java backend/src/test/java/br/gov/df/guiacidadao/service/IntentDetectorTest.java
git commit -m "feat: add IntentDetector with regex extraction for CEP, CNPJ, placa, NIS, and category detection"
```

---

### Task 4: External API Services (Graceful Degradation)

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/external/BrasilApiService.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/external/CnesService.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/external/FarmaciaPopularService.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/external/AnvisaService.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/external/TransparenciaService.java`

- [ ] **Step 1: Create BrasilApiService.java**

```java
package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.CepResponse;
import br.gov.df.guiacidadao.model.dto.CnpjResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Optional;

@Service
public class BrasilApiService {

    private static final Logger log = LoggerFactory.getLogger(BrasilApiService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient webClient;

    @Value("${brasilapi.url}")
    private String baseUrl;

    public BrasilApiService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<CepResponse> buscarCep(String cep) {
        try {
            CepResponse response = webClient.get()
                    .uri(baseUrl + "/cep/v2/" + cep)
                    .retrieve()
                    .bodyToMono(CepResponse.class)
                    .timeout(TIMEOUT)
                    .block();
            return Optional.ofNullable(response);
        } catch (Exception e) {
            log.warn("BrasilAPI CEP indisponivel para {}: {}", cep, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<CnpjResponse> buscarCnpj(String cnpj) {
        try {
            CnpjResponse response = webClient.get()
                    .uri(baseUrl + "/cnpj/v1/" + cnpj)
                    .retrieve()
                    .bodyToMono(CnpjResponse.class)
                    .timeout(TIMEOUT)
                    .block();
            return Optional.ofNullable(response);
        } catch (Exception e) {
            log.warn("BrasilAPI CNPJ indisponivel para {}: {}", cnpj, e.getMessage());
            return Optional.empty();
        }
    }
}
```

- [ ] **Step 2: Create CnesService.java**

```java
package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.CnesEstabelecimento;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CnesService {

    private static final Logger log = LoggerFactory.getLogger(CnesService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final WebClient webClient;

    @Value("${cnes.api.url}")
    private String baseUrl;

    @Value("${brasilia.ibge.code}")
    private String brasiliaIbge;

    public CnesService(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Busca UBS (tipo_unidade=02) em Brasilia.
     * tipoUnidade: 02=Centro de Saude/UBS, 04=Policlinica, 05=Hospital, 73=UPA
     */
    public Optional<List<CnesEstabelecimento>> buscarEstabelecimentos(String tipoUnidade, int limit) {
        try {
            String json = webClient.get()
                    .uri(baseUrl + "/estabelecimentos?municipio_codigo=" + brasiliaIbge
                            + "&codigo_tipo_unidade=" + tipoUnidade
                            + "&limit=" + limit)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.has("estabelecimentos") ? root.get("estabelecimentos") : root;

            List<CnesEstabelecimento> result = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode node : items) {
                    result.add(objectMapper.treeToValue(node, CnesEstabelecimento.class));
                    if (result.size() >= limit) break;
                }
            }
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception e) {
            log.warn("CNES API indisponivel: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<List<CnesEstabelecimento>> buscarUBS(int limit) {
        return buscarEstabelecimentos("02", limit);
    }

    public Optional<List<CnesEstabelecimento>> buscarUPA(int limit) {
        return buscarEstabelecimentos("73", limit);
    }
}
```

- [ ] **Step 3: Create FarmaciaPopularService.java**

```java
package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.FarmaciaDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FarmaciaPopularService {

    private static final Logger log = LoggerFactory.getLogger(FarmaciaPopularService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final WebClient webClient;

    @Value("${farmacia.popular.api.url}")
    private String baseUrl;

    @Value("${brasilia.ibge.code}")
    private String brasiliaIbge;

    public FarmaciaPopularService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<List<FarmaciaDTO>> buscarFarmacias(int limit) {
        try {
            String json = webClient.get()
                    .uri(baseUrl + "/farmacia/municipio/" + brasiliaIbge)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.isArray() ? root : (root.has("dados") ? root.get("dados") : root);

            List<FarmaciaDTO> result = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode node : items) {
                    result.add(objectMapper.treeToValue(node, FarmaciaDTO.class));
                    if (result.size() >= limit) break;
                }
            }
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception e) {
            log.warn("Farmacia Popular API indisponivel: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
```

- [ ] **Step 4: Create AnvisaService.java**

```java
package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.MedicamentoDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AnvisaService {

    private static final Logger log = LoggerFactory.getLogger(AnvisaService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final WebClient webClient;

    public AnvisaService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<List<MedicamentoDTO>> buscarMedicamento(String nome, int limit) {
        try {
            String json = webClient.get()
                    .uri("https://brasilapi.com.br/api/anvisa/medicamento?nome=" + nome)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.isArray() ? root : (root.has("dados") ? root.get("dados") : root);

            List<MedicamentoDTO> result = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode node : items) {
                    result.add(objectMapper.treeToValue(node, MedicamentoDTO.class));
                    if (result.size() >= limit) break;
                }
            }
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception e) {
            log.warn("ANVISA API indisponivel para {}: {}", nome, e.getMessage());
            return Optional.empty();
        }
    }
}
```

- [ ] **Step 5: Create TransparenciaService.java**

```java
package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.BolsaFamiliaDTO;
import br.gov.df.guiacidadao.model.dto.PessoaFisicaDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class TransparenciaService {

    private static final Logger log = LoggerFactory.getLogger(TransparenciaService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final WebClient webClient;

    @Value("${transparencia.api.url}")
    private String baseUrl;

    @Value("${transparencia.api.key:}")
    private String apiKey;

    public TransparenciaService(WebClient webClient) {
        this.webClient = webClient;
    }

    private boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Optional<List<BolsaFamiliaDTO>> consultarBolsaFamiliaPorNis(String nis) {
        if (!isConfigured()) {
            log.debug("Portal Transparencia nao configurado (PORTAL_TRANSPARENCIA_API_KEY ausente)");
            return Optional.empty();
        }
        try {
            String json = webClient.get()
                    .uri(baseUrl + "/api-de-dados/novo-bolsa-familia-sacado-por-nis?nis=" + nis + "&pagina=1")
                    .header("chave-api-dados", apiKey)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            List<BolsaFamiliaDTO> result = objectMapper.readValue(json, new TypeReference<>() {});
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception e) {
            log.warn("Portal Transparencia indisponivel para NIS {}: {}", nis, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<PessoaFisicaDTO> consultarPessoa(String cpfOuNis) {
        if (!isConfigured()) {
            return Optional.empty();
        }
        try {
            String json = webClient.get()
                    .uri(baseUrl + "/api-de-dados/pessoa-fisica?cpf=" + cpfOuNis)
                    .header("chave-api-dados", apiKey)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            PessoaFisicaDTO result = objectMapper.readValue(json, PessoaFisicaDTO.class);
            return Optional.ofNullable(result);
        } catch (Exception e) {
            log.warn("Portal Transparencia pessoa indisponivel: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
```

- [ ] **Step 6: Verify compilation**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 7: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/external/
git commit -m "feat: add external API services (BrasilAPI, CNES, Farmacia, ANVISA, Transparencia) with graceful degradation"
```

---

### Task 5: ExternalDataAggregator

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/ExternalDataAggregator.java`

- [ ] **Step 1: Create ExternalDataAggregator.java**

This service calls multiple external APIs in parallel based on the detected intent, collecting results as Optional values. All failures are silently absorbed.

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import br.gov.df.guiacidadao.model.dto.*;
import br.gov.df.guiacidadao.service.external.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class ExternalDataAggregator {

    private static final Logger log = LoggerFactory.getLogger(ExternalDataAggregator.class);

    private final BrasilApiService brasilApi;
    private final CnesService cnes;
    private final FarmaciaPopularService farmacia;
    private final AnvisaService anvisa;
    private final TransparenciaService transparencia;
    private final ExecutorService executor = Executors.newFixedThreadPool(5);

    public ExternalDataAggregator(
            BrasilApiService brasilApi, CnesService cnes,
            FarmaciaPopularService farmacia, AnvisaService anvisa,
            TransparenciaService transparencia
    ) {
        this.brasilApi = brasilApi;
        this.cnes = cnes;
        this.farmacia = farmacia;
        this.anvisa = anvisa;
        this.transparencia = transparencia;
    }

    /**
     * Returns a map of data-type -> data collected from external APIs.
     * All calls are parallel and fail-safe.
     */
    public Map<String, Object> aggregate(DetectedIntent intent) {
        Map<String, CompletableFuture<?>> futures = new LinkedHashMap<>();

        // CEP lookup
        if (intent.cep() != null) {
            futures.put("cep", CompletableFuture.supplyAsync(
                    () -> brasilApi.buscarCep(intent.cep()), executor));
        }

        // CNPJ lookup
        if (intent.cnpj() != null) {
            futures.put("cnpj", CompletableFuture.supplyAsync(
                    () -> brasilApi.buscarCnpj(intent.cnpj()), executor));
        }

        // Saude: UBS + UPA
        if ("saude".equals(intent.category())) {
            futures.put("ubs", CompletableFuture.supplyAsync(
                    () -> cnes.buscarUBS(5), executor));
            futures.put("upa", CompletableFuture.supplyAsync(
                    () -> cnes.buscarUPA(5), executor));
            futures.put("farmacias", CompletableFuture.supplyAsync(
                    () -> farmacia.buscarFarmacias(5), executor));
        }

        // Bolsa Familia com NIS
        if ("bolsa_familia".equals(intent.category()) && intent.nis() != null) {
            futures.put("bolsa_familia", CompletableFuture.supplyAsync(
                    () -> transparencia.consultarBolsaFamiliaPorNis(intent.nis()), executor));
        }

        // Wait for all futures (max 8 seconds total)
        Map<String, Object> results = new LinkedHashMap<>();
        futures.forEach((key, future) -> {
            try {
                Object result = future.get(8, TimeUnit.SECONDS);
                if (result instanceof Optional<?> opt && opt.isPresent()) {
                    results.put(key, opt.get());
                }
            } catch (Exception e) {
                log.warn("Falha ao agregar dados externos [{}]: {}", key, e.getMessage());
            }
        });

        return results;
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/ExternalDataAggregator.java
git commit -m "feat: add ExternalDataAggregator with parallel fail-safe API calls"
```

---

### Task 6: ContextBuilder

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/ContextBuilder.java`
- Copy: `docs/ai-context.md` -> `backend/src/main/resources/ai-context.md`
- Create: `backend/src/test/java/br/gov/df/guiacidadao/service/ContextBuilderTest.java`

- [ ] **Step 1: Copy ai-context.md to backend resources**

Run: `cp /home/sea/workspaces/Hackman/docs/ai-context.md /home/sea/workspaces/Hackman/backend/src/main/resources/ai-context.md`

- [ ] **Step 2: Write ContextBuilderTest.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.dto.CepResponse;
import br.gov.df.guiacidadao.model.dto.CnesEstabelecimento;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ContextBuilderTest {

    private final ContextBuilder builder = new ContextBuilder();

    @Test
    void buildsBaseContextFromFile() {
        String context = builder.build(Map.of());
        assertTrue(context.contains("Guia Cidadao IA"));
        assertTrue(context.contains("Responda SEMPRE em JSON"));
    }

    @Test
    void injectsCepData() {
        CepResponse cep = new CepResponse("70040020", "DF", "Brasilia", "Asa Norte", "SBS Quadra 2");
        String context = builder.build(Map.of("cep", cep));
        assertTrue(context.contains("CEP informado pelo cidadao"));
        assertTrue(context.contains("Asa Norte"));
        assertTrue(context.contains("Brasilia"));
    }

    @Test
    void injectsUbsData() {
        List<CnesEstabelecimento> ubs = List.of(
                new CnesEstabelecimento("UBS 1 Asa Norte", "SGAN 905", "(61)3333-0001", "Manha/Tarde", "02")
        );
        String context = builder.build(Map.of("ubs", ubs));
        assertTrue(context.contains("Unidades Basicas de Saude"));
        assertTrue(context.contains("UBS 1 Asa Norte"));
    }

    @Test
    void handlesEmptyExternalData() {
        String context = builder.build(Map.of());
        assertFalse(context.contains("DADOS EM TEMPO REAL"));
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -Dtest=ContextBuilderTest -q 2>&1 | tail -5`
Expected: COMPILATION FAILURE

- [ ] **Step 4: Write ContextBuilder.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class ContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(ContextBuilder.class);

    private final String baseContext;

    private static final String FORMAT_INSTRUCTIONS = """

        ---

        ## INSTRUCOES DE FORMATO

        Responda SEMPRE em JSON valido com exatamente estes campos:
        {
          "tag": { "cls": "tag-health|tag-work|tag-social|tag-transit", "icon": "NomeLucideIcon", "txt": "Categoria" },
          "intro": "Paragrafo introdutorio (pode usar <strong> e <a>)",
          "blocks": [
            { "icon": "NomeLucideIcon", "title": "Titulo do bloco", "body": "Texto (ou omita e use docs)", "docs": ["Doc1", "Doc2"] }
          ],
          "steps": ["Passo 1 (pode usar <strong> e <a>)", "Passo 2"],
          "tip": "Dica opcional",
          "contact": { "title": "Nome do orgao", "addr": "Endereco", "phone": "Telefone", "hours": "Horario" },
          "related": ["Pergunta relacionada 1", "Pergunta relacionada 2", "Pergunta relacionada 3"]
        }

        Regras:
        - Use SOMENTE os portais e URLs listados neste contexto. NUNCA invente URLs.
        - blocks: minimo 1, maximo 4. Cada block tem body OU docs, nunca ambos.
        - steps: minimo 2, maximo 6.
        - related: maximo 4 perguntas.
        - tag.cls deve ser um de: tag-health, tag-work, tag-social, tag-transit.
        - tag.icon deve ser um nome de icone Lucide React valido (ex: HeartPulse, Briefcase, Users, Car, IdCard, ShieldCheck).
        - Responda em portugues brasileiro, tom informal e acolhedor.
        - Se a pergunta estiver fora do escopo de servicos publicos do GDF, retorne tag.cls="tag-social", tag.txt="Fora do escopo" e oriente ligar para 156.
        """;

    public ContextBuilder() {
        this.baseContext = loadBaseContext();
    }

    public String build(Map<String, Object> externalData) {
        StringBuilder ctx = new StringBuilder(baseContext);

        if (!externalData.isEmpty()) {
            ctx.append("\n\n## DADOS EM TEMPO REAL\n\n");
            injectExternalData(ctx, externalData);
        }

        ctx.append(FORMAT_INSTRUCTIONS);
        return ctx.toString();
    }

    @SuppressWarnings("unchecked")
    private void injectExternalData(StringBuilder ctx, Map<String, Object> data) {
        if (data.containsKey("cep")) {
            CepResponse cep = (CepResponse) data.get("cep");
            ctx.append("CEP informado pelo cidadao: ")
                    .append(cep.street() != null ? cep.street() + ", " : "")
                    .append(cep.neighborhood() != null ? cep.neighborhood() + ", " : "")
                    .append(cep.city() != null ? cep.city() : "")
                    .append(cep.state() != null ? "-" + cep.state() : "")
                    .append("\n\n");
        }

        if (data.containsKey("cnpj")) {
            CnpjResponse cnpj = (CnpjResponse) data.get("cnpj");
            ctx.append("Dados da empresa (CNPJ): ")
                    .append(cnpj.razaoSocial())
                    .append(" (").append(cnpj.nomeFantasia()).append(")")
                    .append(" — Situacao: ").append(cnpj.situacao())
                    .append(" — ").append(cnpj.municipio()).append("/").append(cnpj.uf())
                    .append("\n\n");
        }

        if (data.containsKey("ubs")) {
            List<CnesEstabelecimento> ubs = (List<CnesEstabelecimento>) data.get("ubs");
            ctx.append("Unidades Basicas de Saude (UBS) em Brasilia:\n");
            for (CnesEstabelecimento u : ubs) {
                ctx.append("- ").append(u.nomeFantasia());
                if (u.endereco() != null) ctx.append(", ").append(u.endereco());
                if (u.telefone() != null) ctx.append(", Tel: ").append(u.telefone());
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("upa")) {
            List<CnesEstabelecimento> upa = (List<CnesEstabelecimento>) data.get("upa");
            ctx.append("UPAs 24h em Brasilia:\n");
            for (CnesEstabelecimento u : upa) {
                ctx.append("- ").append(u.nomeFantasia());
                if (u.endereco() != null) ctx.append(", ").append(u.endereco());
                if (u.telefone() != null) ctx.append(", Tel: ").append(u.telefone());
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("farmacias")) {
            List<FarmaciaDTO> farmacias = (List<FarmaciaDTO>) data.get("farmacias");
            ctx.append("Farmacias Populares em Brasilia (medicamentos gratuitos):\n");
            for (FarmaciaDTO f : farmacias) {
                ctx.append("- ").append(f.nomeFantasia());
                if (f.endereco() != null) ctx.append(", ").append(f.endereco());
                if (f.bairro() != null) ctx.append(", ").append(f.bairro());
                if (f.telefone() != null) ctx.append(", Tel: ").append(f.telefone());
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("bolsa_familia")) {
            List<BolsaFamiliaDTO> bf = (List<BolsaFamiliaDTO>) data.get("bolsa_familia");
            ctx.append("Dados Bolsa Familia do cidadao:\n");
            for (BolsaFamiliaDTO b : bf) {
                ctx.append("- Mes: ").append(b.mesReferencia())
                        .append(", Valor: R$ ").append(b.valor())
                        .append(" (").append(b.municipio()).append("/").append(b.uf()).append(")")
                        .append("\n");
            }
            ctx.append("\n");
        }
    }

    private String loadBaseContext() {
        try (InputStream is = getClass().getResourceAsStream("/ai-context.md")) {
            if (is != null) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            log.error("Erro ao carregar ai-context.md: {}", e.getMessage());
        }
        log.warn("ai-context.md nao encontrado, usando contexto minimo");
        return "Voce e o Guia Cidadao IA, assistente de servicos publicos do GDF (Governo do Distrito Federal). Oriente cidadaos sobre servicos publicos em Brasilia.";
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -Dtest=ContextBuilderTest -q`
Expected: All 4 tests pass

- [ ] **Step 6: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/ContextBuilder.java backend/src/test/java/br/gov/df/guiacidadao/service/ContextBuilderTest.java backend/src/main/resources/ai-context.md
git commit -m "feat: add ContextBuilder that loads ai-context.md and injects real-time external data"
```

---

### Task 7: OpenRouterService

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/OpenRouterService.java`

- [ ] **Step 1: Create OpenRouterService.java**

```java
package br.gov.df.guiacidadao.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final WebClient webClient;

    @Value("${openrouter.api.key:}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.timeout.seconds}")
    private int timeoutSeconds;

    @Value("${openrouter.max-tokens}")
    private int maxTokens;

    @Value("${openrouter.temperature}")
    private double temperature;

    public OpenRouterService(WebClient webClient) {
        this.webClient = webClient;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String getModel() {
        return model;
    }

    /**
     * Calls OpenRouter with the given system context and user message.
     * Returns the raw content string from the LLM response.
     */
    public String complete(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            throw new IllegalStateException("OPENROUTER_API_KEY nao configurada");
        }

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("temperature", temperature);

        // Messages array
        var messages = objectMapper.createArrayNode();
        var systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

        var userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        requestBody.set("messages", messages);

        // Reasoning
        var reasoning = objectMapper.createObjectNode();
        reasoning.put("enabled", true);
        requestBody.set("reasoning", reasoning);

        // Response format
        var responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_object");
        requestBody.set("response_format", responseFormat);

        log.debug("Chamando OpenRouter modelo={} mensagem={} chars", model, userMessage.length());

        String responseJson = webClient.post()
                .uri(apiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "https://guiacidadao.df.gov.br")
                .header("X-Title", "Guia Cidadao GDF")
                .bodyValue(requestBody.toString())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .block();

        // Extract content from OpenRouter response
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            log.error("Resposta OpenRouter sem choices/content: {}", responseJson);
            throw new RuntimeException("Resposta OpenRouter invalida");
        } catch (Exception e) {
            log.error("Erro ao parsear resposta OpenRouter: {}", e.getMessage());
            throw new RuntimeException("Erro ao parsear resposta OpenRouter", e);
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/OpenRouterService.java
git commit -m "feat: add OpenRouterService for Gemma 4 31B free with reasoning mode"
```

---

### Task 8: ResponseParser

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/ResponseParser.java`
- Create: `backend/src/test/java/br/gov/df/guiacidadao/service/ResponseParserTest.java`

- [ ] **Step 1: Write ResponseParserTest.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResponseParserTest {

    private final ResponseParser parser = new ResponseParser();

    @Test
    void parsesValidJson() {
        String json = """
                {
                  "tag": { "cls": "tag-health", "icon": "HeartPulse", "txt": "Saude" },
                  "intro": "Voce pode ir a UBS.",
                  "blocks": [
                    { "icon": "MapPin", "title": "Onde ir", "body": "UBS mais proxima" }
                  ],
                  "steps": ["Passo 1", "Passo 2"],
                  "tip": "Leve seu cartao SUS",
                  "contact": { "title": "UBS Norte", "addr": "SGAN 905", "phone": "160", "hours": "8h-17h" },
                  "related": ["Como tirar cartao SUS?"]
                }
                """;
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 500);
        assertEquals("tag-health", response.tag().cls());
        assertEquals("Saude", response.tag().txt());
        assertEquals("Voce pode ir a UBS.", response.intro());
        assertEquals(1, response.blocks().size());
        assertEquals("Onde ir", response.blocks().get(0).title());
        assertEquals(2, response.steps().size());
        assertEquals("Leve seu cartao SUS", response.tip());
        assertNotNull(response.contact());
        assertEquals(1, response.related().size());
        assertNotNull(response.meta());
        assertEquals("sess_1", response.meta().sessionId());
    }

    @Test
    void parsesJsonWithDocs() {
        String json = """
                {
                  "tag": { "cls": "tag-work", "icon": "Briefcase", "txt": "Trabalho" },
                  "intro": "Seguro desemprego.",
                  "blocks": [
                    { "icon": "FileText", "title": "Documentos", "docs": ["RG", "CPF", "CTPS"] }
                  ],
                  "steps": ["Passo 1", "Passo 2"]
                }
                """;
        ChatResponse response = parser.parse(json, null, "gemma", 300);
        assertEquals(3, response.blocks().get(0).docs().size());
        assertNull(response.blocks().get(0).body());
        assertNull(response.tip());
    }

    @Test
    void returnsFallbackForInvalidJson() {
        ChatResponse response = parser.parse("not json at all", "sess_1", "gemma", 100);
        assertEquals("tag-social", response.tag().cls());
        assertTrue(response.intro().contains("indisponivel"));
    }

    @Test
    void returnsFallbackForMissingRequiredFields() {
        String json = """
                { "tag": { "cls": "tag-health" } }
                """;
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 100);
        assertEquals("tag-social", response.tag().cls());
        assertTrue(response.intro().contains("indisponivel"));
    }

    @Test
    void handlesJsonWrappedInCodeBlock() {
        String json = """
                ```json
                {
                  "tag": { "cls": "tag-health", "icon": "HeartPulse", "txt": "Saude" },
                  "intro": "Resposta valida.",
                  "blocks": [{ "icon": "Info", "title": "Info", "body": "Texto" }],
                  "steps": ["Passo 1", "Passo 2"]
                }
                ```
                """;
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 100);
        assertEquals("tag-health", response.tag().cls());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -Dtest=ResponseParserTest -q 2>&1 | tail -5`
Expected: COMPILATION FAILURE

- [ ] **Step 3: Write ResponseParser.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.ChatResponse.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResponseParser {

    private static final Logger log = LoggerFactory.getLogger(ResponseParser.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Parses the raw LLM JSON string into a ChatResponse.
     * Returns fallback response if parsing fails or required fields are missing.
     */
    public ChatResponse parse(String rawJson, String sessionId, String model, long processingMs) {
        try {
            String cleaned = cleanJson(rawJson);
            JsonNode root = objectMapper.readTree(cleaned);

            // Validate required fields
            if (!root.has("tag") || !root.has("intro") || !root.has("blocks") || !root.has("steps")) {
                log.warn("JSON do LLM com campos obrigatorios faltando");
                return ChatResponse.fallback(sessionId, model);
            }

            JsonNode tagNode = root.get("tag");
            if (!tagNode.has("cls") || !tagNode.has("icon") || !tagNode.has("txt")) {
                log.warn("JSON do LLM com tag incompleta");
                return ChatResponse.fallback(sessionId, model);
            }

            // Parse tag
            Tag tag = new Tag(
                    tagNode.get("cls").asText(),
                    tagNode.get("icon").asText(),
                    tagNode.get("txt").asText()
            );

            // Parse intro
            String intro = root.get("intro").asText();

            // Parse blocks
            List<Block> blocks = new ArrayList<>();
            for (JsonNode b : root.get("blocks")) {
                String icon = b.has("icon") ? b.get("icon").asText() : "Info";
                String title = b.has("title") ? b.get("title").asText() : "";
                String body = b.has("body") && !b.get("body").isNull() ? b.get("body").asText() : null;
                List<String> docs = null;
                if (b.has("docs") && b.get("docs").isArray()) {
                    docs = new ArrayList<>();
                    for (JsonNode d : b.get("docs")) {
                        docs.add(d.asText());
                    }
                }
                blocks.add(new Block(icon, title, body, docs));
            }

            // Parse steps
            List<String> steps = new ArrayList<>();
            for (JsonNode s : root.get("steps")) {
                steps.add(s.asText());
            }

            // Parse optional fields
            String tip = root.has("tip") && !root.get("tip").isNull() ? root.get("tip").asText() : null;

            Contact contact = null;
            if (root.has("contact") && !root.get("contact").isNull()) {
                JsonNode c = root.get("contact");
                contact = new Contact(
                        c.has("title") ? c.get("title").asText() : "",
                        c.has("addr") ? c.get("addr").asText() : "",
                        c.has("phone") ? c.get("phone").asText() : "",
                        c.has("hours") ? c.get("hours").asText() : ""
                );
            }

            List<String> related = null;
            if (root.has("related") && root.get("related").isArray()) {
                related = new ArrayList<>();
                for (JsonNode r : root.get("related")) {
                    related.add(r.asText());
                }
            }

            return ChatResponse.fromParsed(tag, intro, blocks, steps, tip, contact, related,
                    sessionId, model, processingMs);

        } catch (Exception e) {
            log.error("Erro ao parsear JSON do LLM: {}", e.getMessage());
            return ChatResponse.fallback(sessionId, model);
        }
    }

    /**
     * Cleans raw LLM output: removes markdown code fences, trims whitespace.
     */
    private String cleanJson(String raw) {
        String trimmed = raw.trim();
        // Remove ```json ... ``` wrapper
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
            trimmed = trimmed.trim();
        }
        return trimmed;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -Dtest=ResponseParserTest -q`
Expected: All 5 tests pass

- [ ] **Step 5: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/ResponseParser.java backend/src/test/java/br/gov/df/guiacidadao/service/ResponseParserTest.java
git commit -m "feat: add ResponseParser with JSON validation, code fence cleanup, and fallback"
```

---

### Task 9: ChatService (Orchestrator)

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/service/ChatService.java`

- [ ] **Step 1: Create ChatService.java**

```java
package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.entity.ChatLog;
import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.DetectedIntent;
import br.gov.df.guiacidadao.repository.ChatLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final IntentDetector intentDetector;
    private final ExternalDataAggregator aggregator;
    private final ContextBuilder contextBuilder;
    private final OpenRouterService openRouter;
    private final ResponseParser responseParser;
    private final ChatLogRepository chatLogRepository;

    public ChatService(
            IntentDetector intentDetector,
            ExternalDataAggregator aggregator,
            ContextBuilder contextBuilder,
            OpenRouterService openRouter,
            ResponseParser responseParser,
            ChatLogRepository chatLogRepository
    ) {
        this.intentDetector = intentDetector;
        this.aggregator = aggregator;
        this.contextBuilder = contextBuilder;
        this.openRouter = openRouter;
        this.responseParser = responseParser;
        this.chatLogRepository = chatLogRepository;
    }

    public ChatResponse processMessage(String message, String sessionId) {
        long start = System.currentTimeMillis();
        String model = openRouter.getModel();

        if (!openRouter.isConfigured()) {
            log.error("OpenRouter nao configurado — retornando fallback");
            return ChatResponse.fallback(sessionId, model);
        }

        try {
            // 1. Detect intent
            DetectedIntent intent = intentDetector.detect(message);
            log.debug("Intent detectado: categoria={}, cep={}, cnpj={}, nis={}",
                    intent.category(), intent.cep(), intent.cnpj(), intent.nis());

            // 2. Aggregate external data (parallel, fail-safe)
            Map<String, Object> externalData = aggregator.aggregate(intent);
            log.debug("Dados externos coletados: {} fontes", externalData.size());

            // 3. Build enriched context
            String systemPrompt = contextBuilder.build(externalData);

            // 4. Call LLM
            String llmJson = callWithRetry(systemPrompt, message);

            // 5. Parse response
            long processingMs = System.currentTimeMillis() - start;
            ChatResponse response = responseParser.parse(llmJson, sessionId, model, processingMs);

            // 6. Log
            saveLog(sessionId, message, response.meta().responseId(), intent.category(), processingMs);

            return response;

        } catch (Exception e) {
            long processingMs = System.currentTimeMillis() - start;
            log.error("Erro no processamento da mensagem: {}", e.getMessage(), e);
            saveLog(sessionId, message, "resp_error", "error", processingMs);
            return ChatResponse.fallback(sessionId, model);
        }
    }

    private String callWithRetry(String systemPrompt, String userMessage) {
        try {
            return openRouter.complete(systemPrompt, userMessage);
        } catch (Exception e) {
            log.warn("Primeira tentativa LLM falhou, retentando em 2s: {}", e.getMessage());
            try {
                Thread.sleep(2000);
                return openRouter.complete(systemPrompt, userMessage);
            } catch (Exception e2) {
                log.error("Segunda tentativa LLM falhou: {}", e2.getMessage());
                throw e2;
            }
        }
    }

    private void saveLog(String sessionId, String message, String responseId, String category, long processingMs) {
        try {
            chatLogRepository.save(new ChatLog(sessionId, message, responseId, category, processingMs));
        } catch (Exception e) {
            log.warn("Falha ao salvar log: {}", e.getMessage());
        }
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/service/ChatService.java
git commit -m "feat: add ChatService orchestrator with intent detection, RAG, LLM call with retry, and logging"
```

---

### Task 10: Controllers

**Files:**
- Create: `backend/src/main/java/br/gov/df/guiacidadao/controller/ChatController.java`
- Create: `backend/src/main/java/br/gov/df/guiacidadao/controller/ServicesController.java`
- Create: `backend/src/main/resources/data/featured-services.json`
- Create: `backend/src/main/resources/data/status-cards.json`
- Create: `backend/src/main/resources/data/suggestions.json`
- Create: `backend/src/main/resources/data/faq.json`

- [ ] **Step 1: Create ChatController.java**

```java
package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.entity.ChatFeedback;
import br.gov.df.guiacidadao.model.ChatRequest;
import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.FeedbackRequest;
import br.gov.df.guiacidadao.repository.ChatFeedbackRepository;
import br.gov.df.guiacidadao.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatFeedbackRepository feedbackRepository;

    public ChatController(ChatService chatService, ChatFeedbackRepository feedbackRepository) {
        this.chatService = chatService;
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.processMessage(request.message(), request.sessionId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Boolean>> feedback(@Valid @RequestBody FeedbackRequest request) {
        feedbackRepository.save(new ChatFeedback(request.responseId(), request.sessionId(), request.vote()));
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
```

- [ ] **Step 2: Create static JSON data files**

Create `backend/src/main/resources/data/featured-services.json`:

```json
[
  {
    "icon": "Stethoscope",
    "title": "Agendamento de Saude",
    "desc": "Consultas, exames e vacinas nas UBSs e policlinicas do DF. Sem filas, sem complicacao.",
    "badges": [{"label": "Gratuito", "variant": "green"}, {"label": "Online", "variant": "blue"}],
    "stat": {"icon": "MapPin", "text": "327 unidades disponiveis"},
    "cta": "Agendar",
    "query": "quero agendar uma consulta medica"
  },
  {
    "icon": "Car",
    "title": "CNH e DETRAN-DF",
    "desc": "Habilitacao, licenciamento, multas e transferencia de veiculos.",
    "badges": [{"label": "Online", "variant": "blue"}, {"label": "Presencial", "variant": "ouro"}],
    "stat": {"icon": "Building2", "text": "4 postos no DF"},
    "cta": "Acessar",
    "query": "quero tirar minha primeira CNH"
  },
  {
    "icon": "IdCard",
    "title": "Documento de Identidade",
    "desc": "Emissao e renovacao da carteira de identidade (RG / CIN). Agende sem sair de casa.",
    "badges": [{"label": "Gratuito", "variant": "green"}, {"label": "Presencial", "variant": "ouro"}],
    "stat": {"icon": "Clock", "text": "Proximo: amanha, 08:00"},
    "cta": "Agendar",
    "query": "como emitir segunda via do RG?"
  },
  {
    "icon": "ShieldCheck",
    "title": "Previdencia Social — INSS",
    "desc": "Aposentadoria, beneficio por incapacidade, salario-maternidade e outros servicos do INSS.",
    "badges": [{"label": "Gratuito", "variant": "green"}, {"label": "Online", "variant": "blue"}],
    "stat": {"icon": "Phone", "text": "Meu INSS - Telefone 135"},
    "cta": "Simular",
    "query": "quero me aposentar pelo INSS"
  },
  {
    "icon": "HandHeart",
    "title": "Bolsa Familia e Beneficios",
    "desc": "CadUnico, Bolsa Familia, BPC e mais de 30 programas sociais federais e distritais.",
    "badges": [{"label": "Gratuito", "variant": "green"}],
    "stat": {"icon": "MapPin", "text": "CRAS mais proximo"},
    "cta": "Cadastrar",
    "query": "como me inscrever no Bolsa Familia"
  },
  {
    "icon": "Briefcase",
    "title": "Trabalho e Emprego",
    "desc": "Seguro-desemprego, FGTS, vagas de emprego no SINE-DF e carteira de trabalho digital.",
    "badges": [{"label": "Gratuito", "variant": "green"}, {"label": "Online", "variant": "blue"}],
    "stat": {"icon": "Phone", "text": "Central: 158"},
    "cta": "Solicitar",
    "query": "fui demitido e preciso de ajuda com seguro desemprego"
  }
]
```

Create `backend/src/main/resources/data/status-cards.json`:

```json
[
  {
    "icon": "HeartPulse",
    "iconBg": "rgba(239,68,68,.12)",
    "iconColor": "#F87171",
    "label": "Fila — UPAs do DF",
    "pill": {"text": "Espera moderada", "variant": "yellow"},
    "value": "47 min",
    "detail": "Media geral - Santa Maria: 1h12 - Ceilandia: 38 min - Taguatinga: 52 min"
  },
  {
    "icon": "Droplets",
    "iconBg": "rgba(34,197,94,.12)",
    "iconColor": "#4ADE80",
    "label": "Abastecimento de Agua",
    "pill": {"text": "Normal", "variant": "green"},
    "value": "98%",
    "detail": "Restricao pontual: Sol Nascente — manutencao ate 16h de hoje"
  },
  {
    "icon": "Wind",
    "iconBg": "rgba(234,179,8,.12)",
    "iconColor": "#FDE047",
    "label": "Qualidade do Ar",
    "pill": {"text": "Boa", "variant": "green"},
    "value": "IQA 42",
    "detail": "Umidade relativa: 28% — baixa. Hidrate-se. Fonte: IBRAM - 09:00"
  },
  {
    "icon": "Construction",
    "iconBg": "rgba(59,130,246,.12)",
    "iconColor": "#60A5FA",
    "label": "Obras e Interdicoes",
    "pill": {"text": "3 ativas", "variant": "yellow"},
    "value": "EPNB",
    "detail": "W3 Sul, Eixo Monumental e EPNB. Previsao de conclusao: 25/04/2026"
  }
]
```

Create `backend/src/main/resources/data/suggestions.json`:

```json
[
  {"icon": "TrendingUp", "label": "Segunda via do RG", "query": "como emitir segunda via do RG?"},
  {"icon": "TrendingUp", "label": "Agendamento de consulta", "query": "quero agendar uma consulta medica"},
  {"icon": "TrendingUp", "label": "Seguro-desemprego", "query": "como solicitar seguro desemprego"},
  {"icon": "Car", "label": "Tirar primeira CNH", "query": "quero tirar minha primeira CNH"},
  {"icon": "HandHeart", "label": "Inscricao no Bolsa Familia", "query": "como me inscrever no Bolsa Familia"},
  {"icon": "ShieldCheck", "label": "Aposentadoria pelo INSS", "query": "quero me aposentar pelo INSS"}
]
```

Create `backend/src/main/resources/data/faq.json`:

```json
[
  {
    "category": "Documentos e Identificacao",
    "icon": "IdCard",
    "items": [
      {"q": "Como tirar a segunda via do RG?", "a": "Acesse o portal SSP-DF, agende um horario e compareca com certidao de nascimento ou casamento e comprovante de residencia. A primeira emissao e gratuita.", "query": "como emitir segunda via do RG?"},
      {"q": "Como emitir a certidao de nascimento online?", "a": "Pelo Portal da Transparencia dos Cartorios ou no cartorio onde foi registrado.", "query": "como emitir certidao de nascimento pela internet"},
      {"q": "Onde solicitar a Carteira de Trabalho Digital?", "a": "Pelo aplicativo Carteira de Trabalho Digital (Android e iOS) ou pelo portal gov.br. Processo 100% online e gratuito.", "query": "como solicitar carteira de trabalho digital"}
    ]
  },
  {
    "category": "Saude e Educacao",
    "icon": "HeartPulse",
    "items": [
      {"q": "Como me cadastrar no SUS no DF?", "a": "Compareca a UBS mais proxima com RG, CPF e comprovante de residencia. O cartao SUS e emitido gratuitamente na hora.", "query": "como me cadastrar no SUS"},
      {"q": "Meu filho pode se matricular na escola publica a qualquer momento?", "a": "Sim. Fora do periodo regular, a familia deve ir a escola mais proxima com certidao de nascimento, comprovante de residencia e RG dos responsaveis.", "query": "como matricular filho na escola publica"},
      {"q": "Quais vacinas sao oferecidas gratuitamente em 2026?", "a": "O calendario nacional inclui gripe, COVID-19, febre amarela, hepatite B, entre outras. Consulte a UBS mais proxima.", "query": "quais vacinas gratuitas estao disponiveis"}
    ]
  },
  {
    "category": "Beneficios e Assistencia",
    "icon": "HandCoins",
    "items": [
      {"q": "Quem tem direito ao Bolsa Familia?", "a": "Familias com renda per capita de ate R$ 218/mes. E necessario estar inscrito no CadUnico.", "query": "quero saber se tenho direito ao Bolsa Familia"},
      {"q": "O que e o BPC e quem pode receber?", "a": "O BPC paga 1 salario minimo a idosos com 65+ anos ou pessoas com deficiencia com renda familiar per capita abaixo de 1/4 do salario minimo.", "query": "tenho deficiencia e quero saber sobre o BPC"},
      {"q": "Como conseguir cesta basica emergencial?", "a": "Procure o CRAS da sua regiao com RG, CPF e comprovante de residencia.", "query": "preciso de cesta basica emergencial"}
    ]
  }
]
```

- [ ] **Step 3: Create ServicesController.java**

```java
package br.gov.df.guiacidadao.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ServicesController {

    private static final Logger log = LoggerFactory.getLogger(ServicesController.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/services/featured")
    public ResponseEntity<JsonNode> featured() {
        return ResponseEntity.ok(loadJson("data/featured-services.json"));
    }

    @GetMapping("/services/status")
    public ResponseEntity<JsonNode> status() {
        return ResponseEntity.ok(loadJson("data/status-cards.json"));
    }

    @GetMapping("/services/suggestions")
    public ResponseEntity<JsonNode> suggestions() {
        return ResponseEntity.ok(loadJson("data/suggestions.json"));
    }

    @GetMapping("/faq")
    public ResponseEntity<JsonNode> faq() {
        return ResponseEntity.ok(loadJson("data/faq.json"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        ));
    }

    private JsonNode loadJson(String resourcePath) {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            if (is != null) {
                return objectMapper.readTree(is);
            }
        } catch (Exception e) {
            log.error("Erro ao carregar {}: {}", resourcePath, e.getMessage());
        }
        return objectMapper.createArrayNode();
    }
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/main/java/br/gov/df/guiacidadao/controller/ backend/src/main/resources/data/
git commit -m "feat: add ChatController, ServicesController, and static JSON data files"
```

---

### Task 11: Integration Test

**Files:**
- Create: `backend/src/test/java/br/gov/df/guiacidadao/controller/ChatControllerTest.java`

- [ ] **Step 1: Write ChatControllerTest.java**

This tests the controller layer with a mocked ChatService.

```java
package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.ChatResponse.*;
import br.gov.df.guiacidadao.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatService chatService;

    @Test
    void postChat_returnsStructuredResponse() throws Exception {
        ChatResponse mockResponse = ChatResponse.fromParsed(
                new Tag("tag-health", "HeartPulse", "Saude"),
                "Voce pode ir a UBS.",
                List.of(new Block("MapPin", "Onde ir", "UBS mais proxima", null)),
                List.of("Passo 1", "Passo 2"),
                "Dica", null, List.of("Pergunta?"),
                "sess_1", "gemma", 500
        );
        when(chatService.processMessage(anyString(), anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"preciso de medico\", \"sessionId\": \"sess_1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tag.cls").value("tag-health"))
                .andExpect(jsonPath("$.intro").value("Voce pode ir a UBS."))
                .andExpect(jsonPath("$.blocks[0].title").value("Onde ir"))
                .andExpect(jsonPath("$.steps[0]").value("Passo 1"))
                .andExpect(jsonPath("$.meta.sessionId").value("sess_1"));
    }

    @Test
    void postChat_rejectsEmptyMessage() throws Exception {
        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postFeedback_savesAndReturnsOk() throws Exception {
        mockMvc.perform(post("/api/v1/chat/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"responseId\": \"resp_123\", \"sessionId\": \"sess_1\", \"vote\": \"positive\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void getFeatured_returnsArray() throws Exception {
        mockMvc.perform(get("/api/v1/services/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].icon").exists());
    }

    @Test
    void getHealth_returnsUp() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void getFaq_returnsArray() throws Exception {
        mockMvc.perform(get("/api/v1/faq"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").exists());
    }
}
```

- [ ] **Step 2: Run tests**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -Dtest=ChatControllerTest -q`
Expected: All 6 tests pass

- [ ] **Step 3: Run all tests**

Run: `cd /home/sea/workspaces/Hackman/backend && mvn test -q`
Expected: All tests pass (IntentDetectorTest + ContextBuilderTest + ResponseParserTest + ChatControllerTest)

- [ ] **Step 4: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add backend/src/test/java/br/gov/df/guiacidadao/controller/ChatControllerTest.java
git commit -m "test: add integration tests for ChatController and ServicesController"
```

---

### Task 12: Frontend Migration (Connect to Backend API)

**Files:**
- Modify: `src/types/index.ts` (make `keys` optional)
- Modify: `src/App.tsx` (replace `matchResponse` with API call)
- Modify: `vite.config.ts` (add proxy for dev)

- [ ] **Step 1: Make `keys` optional in types**

In `src/types/index.ts`, change line 31 from:

```typescript
  keys: string[]
```

to:

```typescript
  keys?: string[]
```

- [ ] **Step 2: Add dev proxy in vite.config.ts**

In `vite.config.ts`, replace the entire file with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react:   ['react', 'react-dom'],
          lucide:  ['lucide-react'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
})
```

- [ ] **Step 3: Update App.tsx to call backend API**

Replace the entire `src/App.tsx` with:

```typescript
import { useState, useCallback, useRef } from 'react'
import AlertBar from './components/AlertBar'
import IdentityBar from './components/IdentityBar'
import Nav from './components/Nav'
import Hero from './components/Hero'
import FeaturedServices from './components/FeaturedServices'
import StatusDashboard from './components/StatusDashboard'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import ChatSection from './components/Chat'
import BottomBar from './components/Chat/BottomBar'
import type { Message } from './types'

let msgId = 0
const uid = () => String(++msgId)

const SESSION_KEY = 'guia-cidadao-session'
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export default function App() {
  const [chatStarted, setChatStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const sessionId = useRef(getSessionId())

  const send = useCallback(async (text: string) => {
    if (!chatStarted) setChatStarted(true)

    // Add user message
    const userMsg: Message = { id: uid(), type: 'user', text }
    // Add typing placeholder (data: undefined = typing)
    const typingMsg: Message = { id: uid(), type: 'ai', text: '', data: undefined }

    setMessages(prev => [...prev, userMsg, typingMsg])

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      })

      const data = await res.json()

      setMessages(prev =>
        prev.map(m =>
          m.id === typingMsg.id
            ? { ...m, data: data ?? null }
            : m
        )
      )
    } catch (error) {
      console.error('Erro ao chamar API:', error)
      setMessages(prev =>
        prev.map(m =>
          m.id === typingMsg.id
            ? { ...m, data: null }
            : m
        )
      )
    }
  }, [chatStarted])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AlertBar />
      <IdentityBar />
      <Nav />
      <Hero compact={chatStarted} onSend={send} />

      {chatStarted ? (
        <>
          <ChatSection messages={messages} onRelated={send} />
          <BottomBar onSend={send} />
        </>
      ) : (
        <>
          <FeaturedServices onServiceClick={send} />
          <StatusDashboard />
          <FAQ onQuery={send} />
          <Footer />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify frontend builds**

Run: `cd /home/sea/workspaces/Hackman && npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
cd /home/sea/workspaces/Hackman
git add src/App.tsx src/types/index.ts vite.config.ts
git commit -m "feat: connect frontend to backend API, add dev proxy, make keys optional"
```

---

### Task 13: End-to-End Verification

- [ ] **Step 1: Start backend**

Run: `cd /home/sea/workspaces/Hackman/backend && OPENROUTER_API_KEY=$OPENROUTER_API_KEY mvn spring-boot:run &`
Wait for "Started GuiaCidadaoApplication"

- [ ] **Step 2: Verify health endpoint**

Run: `curl -s http://localhost:8080/api/v1/health | python3 -m json.tool`
Expected: `{ "status": "UP", "timestamp": "..." }`

- [ ] **Step 3: Verify services endpoints**

Run: `curl -s http://localhost:8080/api/v1/services/featured | python3 -m json.tool | head -10`
Expected: JSON array with featured services

Run: `curl -s http://localhost:8080/api/v1/faq | python3 -m json.tool | head -10`
Expected: JSON array with FAQ categories

- [ ] **Step 4: Test chat endpoint**

Run: `curl -s -X POST http://localhost:8080/api/v1/chat -H "Content-Type: application/json" -d '{"message": "preciso de medico", "sessionId": "test_1"}' | python3 -m json.tool | head -20`
Expected: Structured JSON response with tag, intro, blocks, steps, meta

- [ ] **Step 5: Test feedback endpoint**

Run: `curl -s -X POST http://localhost:8080/api/v1/chat/feedback -H "Content-Type: application/json" -d '{"responseId": "resp_123", "sessionId": "test_1", "vote": "positive"}' | python3 -m json.tool`
Expected: `{ "ok": true }`

- [ ] **Step 6: Stop backend**

Kill the Spring Boot process.

- [ ] **Step 7: Final commit**

```bash
cd /home/sea/workspaces/Hackman
git add -A
git commit -m "chore: end-to-end verification complete — backend + frontend integration working"
```
