package br.gov.df.guiacidadao.service.external;

import br.gov.df.guiacidadao.model.dto.CepResponse;
import br.gov.df.guiacidadao.model.dto.CnpjResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Optional;

@Service
public class BrasilApiService {

    private static final Logger log = LoggerFactory.getLogger(BrasilApiService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final WebClient webClient;

    @Value("${brasilapi.url}")
    private String baseUrl;

    public BrasilApiService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<CepResponse> buscarCep(String cep) {
        try {
            CepResponse response = webClient.get()
                    .uri(baseUrl + "/cep/v2/" + cep)
                    .retrieve()
                    .bodyToMono(CepResponse.class)
                    .timeout(TIMEOUT)
                    .block();
            return Optional.ofNullable(response);
        } catch (Exception e) {
            log.warn("BrasilAPI CEP indisponivel para {}: {}", cep, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<CnpjResponse> buscarCnpj(String cnpj) {
        try {
            CnpjResponse response = webClient.get()
                    .uri(baseUrl + "/cnpj/v1/" + cnpj)
                    .retrieve()
                    .bodyToMono(CnpjResponse.class)
                    .timeout(TIMEOUT)
                    .block();
            return Optional.ofNullable(response);
        } catch (Exception e) {
            log.warn("BrasilAPI CNPJ indisponivel para {}: {}", cnpj, e.getMessage());
            return Optional.empty();
        }
    }
}
