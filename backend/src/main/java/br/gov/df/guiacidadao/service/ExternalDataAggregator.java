package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import br.gov.df.guiacidadao.model.dto.*;
import br.gov.df.guiacidadao.service.external.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class ExternalDataAggregator {

    private static final Logger log = LoggerFactory.getLogger(ExternalDataAggregator.class);

    private final BrasilApiService brasilApi;
    private final CnesService cnes;
    private final FarmaciaPopularService farmacia;
    private final AnvisaService anvisa;
    private final TransparenciaService transparencia;
    private final ExecutorService executor = Executors.newFixedThreadPool(5);

    public ExternalDataAggregator(
            BrasilApiService brasilApi, CnesService cnes,
            FarmaciaPopularService farmacia, AnvisaService anvisa,
            TransparenciaService transparencia
    ) {
        this.brasilApi = brasilApi;
        this.cnes = cnes;
        this.farmacia = farmacia;
        this.anvisa = anvisa;
        this.transparencia = transparencia;
    }

    public Map<String, Object> aggregate(DetectedIntent intent) {
        Map<String, CompletableFuture<?>> futures = new LinkedHashMap<>();

        if (intent.cep() != null) {
            futures.put("cep", CompletableFuture.supplyAsync(
                    () -> brasilApi.buscarCep(intent.cep()), executor));
        }

        if (intent.cnpj() != null) {
            futures.put("cnpj", CompletableFuture.supplyAsync(
                    () -> brasilApi.buscarCnpj(intent.cnpj()), executor));
        }

        if ("saude".equals(intent.category())) {
            futures.put("ubs", CompletableFuture.supplyAsync(
                    () -> cnes.buscarUBS(5), executor));
            futures.put("upa", CompletableFuture.supplyAsync(
                    () -> cnes.buscarUPA(5), executor));
            futures.put("farmacias", CompletableFuture.supplyAsync(
                    () -> farmacia.buscarFarmacias(5), executor));
        }

        if ("bolsa_familia".equals(intent.category()) && intent.nis() != null) {
            futures.put("bolsa_familia", CompletableFuture.supplyAsync(
                    () -> transparencia.consultarBolsaFamiliaPorNis(intent.nis()), executor));
        }

        Map<String, Object> results = new LinkedHashMap<>();
        futures.forEach((key, future) -> {
            try {
                Object result = future.get(8, TimeUnit.SECONDS);
                if (result instanceof Optional<?> opt && opt.isPresent()) {
                    results.put(key, opt.get());
                }
            } catch (Exception e) {
                log.warn("Falha ao agregar dados externos [{}]: {}", key, e.getMessage());
            }
        });

        return results;
    }
}
