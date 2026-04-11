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
