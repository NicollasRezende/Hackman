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
