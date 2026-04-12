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

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${cors.allowed.origins:*}")
    private String corsAllowedOrigins;

    public OpenRouterService(WebClient webClient) {
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
        log.info("Config OpenRouter | configured={} | apiKey={} | url={} | model={} | timeout={}s | maxTokens={} | temp={} | serverPort={} | corsOrigins={}",
                isConfigured(), masked, apiUrl, model, timeoutSeconds, maxTokens, temperature, serverPort, corsAllowedOrigins);
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

        var messages = objectMapper.createArrayNode();
        var systemMsg = objectMapper.createObjectNode();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

        var userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        log.debug("Chamando OpenRouter modelo={} mensagem={} chars", model, userMessage.length());

        String responseJson;
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);
            requestBody.set("messages", messages);

            var responseFormat = objectMapper.createObjectNode();
            responseFormat.put("type", "json_object");
            requestBody.set("response_format", responseFormat);

            responseJson = post(requestBody);
        } catch (WebClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 400 || status == 401 || status == 403 || status == 422) {
                log.warn("OpenRouter retornou {}. Retentando com payload minimo.", status);
                ObjectNode minimalBody = objectMapper.createObjectNode();
                minimalBody.put("model", model);
                minimalBody.put("max_tokens", maxTokens);
                minimalBody.put("temperature", temperature);
                minimalBody.set("messages", messages);
                try {
                    responseJson = post(minimalBody);
                } catch (WebClientResponseException e2) {
                    throw new RuntimeException("OpenRouter HTTP " + e2.getStatusCode().value()
                            + " (modelo=" + model + "): " + e2.getResponseBodyAsString(), e2);
                }
            } else {
                throw new RuntimeException("OpenRouter HTTP " + status
                        + " (modelo=" + model + "): " + e.getResponseBodyAsString(), e);
            }
        }

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

    private String post(ObjectNode requestBody) {
        try {
            return webClient.post()
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
        } catch (WebClientResponseException e) {
            String body = e.getResponseBodyAsString();
            log.error("OpenRouter HTTP {} {} | url={} | model={} | body={}",
                    e.getStatusCode().value(), e.getStatusText(), apiUrl, model, body);
            throw e;
        } catch (Exception e) {
            log.error("Falha ao chamar OpenRouter url={} model={}: {}", apiUrl, model, e.toString());
            throw new RuntimeException("Falha ao chamar OpenRouter: " + e.getMessage(), e);
        }
    }
}
