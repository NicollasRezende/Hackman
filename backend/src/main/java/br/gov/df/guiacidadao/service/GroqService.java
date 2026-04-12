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
import org.springframework.web.reactive.function.client.WebClientResponseException;

import jakarta.annotation.PostConstruct;
import java.time.Duration;

@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.model:groq/compound}")
    private String model;

    @Value("${groq.fallback.model:llama-3.3-70b-versatile}")
    private String fallbackModel;

    @Value("${groq.timeout.seconds:45}")
    private int timeoutSeconds;

    @Value("${groq.max-tokens:1500}")
    private int maxTokens;

    @Value("${groq.temperature:0.3}")
    private double temperature;

    public GroqService(WebClient webClient) {
        this.webClient = webClient;
    }

    @PostConstruct
    void logConfig() {
        String masked = "(vazio)";
        if (apiKey != null) {
            String k = apiKey.trim();
            if (!k.isEmpty()) {
                int len = k.length();
                String tail = len > 6 ? k.substring(len - 6) : k;
                masked = "len=" + len + " ... " + tail;
            }
        }
        log.info("Config Groq | configured={} | apiKey={} | url={} | model={} | fallbackModel={} | timeout={}s | maxTokens={} | temp={}",
                isConfigured(), masked, apiUrl, model, fallbackModel, timeoutSeconds, maxTokens, temperature);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String getModel() {
        return model;
    }

    /**
     * Chama o Groq com web search (groq/compound).
     * Se falhar, tenta o modelo fallback sem web search.
     */
    public String complete(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            throw new IllegalStateException("GROQ_API_KEY nao configurada");
        }

        // Tenta com groq/compound (web search)
        try {
            log.info("Groq: tentando modelo={} (com web search)", model);
            return callModel(model, systemPrompt, userMessage);
        } catch (Exception e) {
            log.warn("Groq compound falhou: {}. Tentando fallback modelo={}", e.getMessage(), fallbackModel);
        }

        // Fallback: modelo direto sem web search
        try {
            log.info("Groq: tentando fallback modelo={}", fallbackModel);
            return callModel(fallbackModel, systemPrompt, userMessage);
        } catch (Exception e) {
            log.error("Groq fallback tambem falhou: {}", e.getMessage());
            throw new RuntimeException("Groq falhou em ambos os modelos: " + e.getMessage(), e);
        }
    }

    private String callModel(String modelName, String systemPrompt, String userMessage) {
        var messages = objectMapper.createArrayNode();

        var systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

        var userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", modelName);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("temperature", temperature);
        requestBody.set("messages", messages);

        // response_format json_object só para modelos não-compound
        if (!modelName.startsWith("groq/compound")) {
            var responseFormat = objectMapper.createObjectNode();
            responseFormat.put("type", "json_object");
            requestBody.set("response_format", responseFormat);
        }

        log.debug("Groq request modelo={} mensagem={} chars", modelName, userMessage.length());

        String responseJson = post(requestBody);
        return extractContent(responseJson);
    }

    private String extractContent(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            log.error("Resposta Groq sem choices/content: {}", responseJson);
            throw new RuntimeException("Resposta Groq invalida");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao parsear resposta Groq: {}", e.getMessage());
            throw new RuntimeException("Erro ao parsear resposta Groq", e);
        }
    }

    private String post(ObjectNode requestBody) {
        try {
            return webClient.post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody.toString())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Groq HTTP {} {} | url={} | body={}",
                    e.getStatusCode().value(), e.getStatusText(), apiUrl, e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            log.error("Falha ao chamar Groq url={}: {}", apiUrl, e.toString());
            throw new RuntimeException("Falha ao chamar Groq: " + e.getMessage(), e);
        }
    }
}
