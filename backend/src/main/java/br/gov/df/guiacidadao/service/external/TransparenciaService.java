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
