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
public class OpenCodeZenService {

    private static final Logger log = LoggerFactory.getLogger(OpenCodeZenService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;

    @Value("${opencode.zen.api.key:}")
    private String apiKey;

    @Value("${opencode.zen.api.url:https://opencode.ai/zen/v1/chat/completions}")
    private String apiUrl;

    @Value("${opencode.zen.model:minimax-m2.5}")
    private String model;

    @Value("${opencode.zen.timeout.seconds:45}")
    private int timeoutSeconds;

    @Value("${opencode.zen.max-tokens:1500}")
    private int maxTokens;

    @Value("${opencode.zen.temperature:0.3}")
    private double temperature;

    public OpenCodeZenService(WebClient webClient) {
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
        log.info("Config OpenCode Zen | configured={} | apiKey={} | url={} | model={} | timeout={}s | maxTokens={} | temp={}",
                isConfigured(), masked, apiUrl, model, timeoutSeconds, maxTokens, temperature);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String getModel() {
        return model;
    }

    public String complete(String systemPrompt, String userMessage) {
        if (!isConfigured()) {
            throw new IllegalStateException("OPENCODE_API_KEY nao configurada");
        }

        var messages = objectMapper.createArrayNode();

        var systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

        var userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        log.debug("Chamando OpenCode Zen modelo={} mensagem={} chars", model, userMessage.length());

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("temperature", temperature);
        requestBody.set("messages", messages);

        String responseJson = post(requestBody);

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            log.error("Resposta OpenCode Zen sem choices/content: {}", responseJson);
            throw new RuntimeException("Resposta OpenCode Zen invalida");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao parsear resposta OpenCode Zen: {}", e.getMessage());
            throw new RuntimeException("Erro ao parsear resposta OpenCode Zen", e);
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
            log.error("OpenCode Zen HTTP {} {} | url={} | model={} | body={}",
                    e.getStatusCode().value(), e.getStatusText(), apiUrl, model, e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            log.error("Falha ao chamar OpenCode Zen url={} model={}: {}", apiUrl, model, e.toString());
            throw new RuntimeException("Falha ao chamar OpenCode Zen: " + e.getMessage(), e);
        }
    }
}
