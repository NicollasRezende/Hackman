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
