package br.gov.df.guiacidadao.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.gov.df.guiacidadao.service.OpenRouterService;
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
    private final OpenRouterService openRouterService;

    public ServicesController(OpenRouterService openRouterService) {
        this.openRouterService = openRouterService;
    }

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

    @GetMapping("/openrouter/status")
    public ResponseEntity<Map<String, Object>> openRouterStatus() {
        return ResponseEntity.ok(Map.of(
                "configured", openRouterService.isConfigured(),
                "model", openRouterService.getModel()
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
