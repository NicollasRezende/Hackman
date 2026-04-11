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

    public String complete(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            throw new IllegalStateException("OPENROUTER_API_KEY nao configurada");
        }

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("temperature", temperature);

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

        var reasoning = objectMapper.createObjectNode();
        reasoning.put("enabled", true);
        requestBody.set("reasoning", reasoning);

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
