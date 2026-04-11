package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.TcuCertidaoDTO;
import br.gov.df.guiacidadao.model.dto.TcuLicitanteInidoneDTO;
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
public class TcuService {

    private static final Logger log = LoggerFactory.getLogger(TcuService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(8);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final WebClient webClient;

    @Value("${tcu.api.url}")
    private String baseUrl;

    @Value("${tcu.certidao.url}")
    private String certidaoUrl;

    public TcuService(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Consulta a lista de licitantes inidôneos declarados pelo TCU.
     * Endpoint público, não requer autenticação.
     */
    public Optional<List<TcuLicitanteInidoneDTO>> consultarLicitantesInidoneos() {
        try {
            String json = webClient.get()
                    .uri(baseUrl + "/rest/recursos/licitante_inidoneo/.json")
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            List<TcuLicitanteInidoneDTO> result = objectMapper.readValue(json, new TypeReference<>() {});
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception e) {
            log.warn("TCU API licitantes inidoneos indisponivel: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Verifica se um CNPJ específico está na lista de licitantes inidôneos do TCU.
     */
    public Optional<List<TcuLicitanteInidoneDTO>> consultarLicitanteInidoneoPorCnpj(String cnpj) {
        try {
            String json = webClient.get()
                    .uri(baseUrl + "/rest/recursos/licitante_inidoneo/.json?CPF_CNPJ=" + cnpj)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            List<TcuLicitanteInidoneDTO> result = objectMapper.readValue(json, new TypeReference<>() {});
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception e) {
            log.warn("TCU API inidoneo CNPJ {} indisponivel: {}", cnpj, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Consulta a situação de contas de um CPF/CNPJ no TCU (certidão negativa).
     * Retorna se há irregularidades ou contas julgadas.
     */
    public Optional<TcuCertidaoDTO> consultarCertidao(String cpfCnpj) {
        try {
            String json = webClient.get()
                    .uri(certidaoUrl + "/api/rest/certidao/" + cpfCnpj)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(TIMEOUT)
                    .block();

            TcuCertidaoDTO result = objectMapper.readValue(json, TcuCertidaoDTO.class);
            return Optional.ofNullable(result);
        } catch (Exception e) {
            log.warn("TCU Certidao indisponivel para {}: {}", cpfCnpj, e.getMessage());
            return Optional.empty();
        }
    }
}
