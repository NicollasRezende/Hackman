package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.dto.CepResponse;
import br.gov.df.guiacidadao.model.dto.CnesEstabelecimento;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ContextBuilderTest {

    private final ContextBuilder builder = new ContextBuilder();

    @Test
    void buildsBaseContextFromFile() {
        String context = builder.build(Map.of());
        assertTrue(context.contains("Guia Cidadao IA"));
        assertTrue(context.contains("Responda SEMPRE em JSON"));
    }

    @Test
    void injectsCepData() {
        CepResponse cep = new CepResponse("70040020", "DF", "Brasilia", "Asa Norte", "SBS Quadra 2");
        String context = builder.build(Map.of("cep", cep));
        assertTrue(context.contains("CEP informado pelo cidadao"));
        assertTrue(context.contains("Asa Norte"));
        assertTrue(context.contains("Brasilia"));
    }

    @Test
    void injectsUbsData() {
        List<CnesEstabelecimento> ubs = List.of(
                new CnesEstabelecimento("UBS 1 Asa Norte", "SGAN 905", "(61)3333-0001", "Manha/Tarde", "02")
        );
        String context = builder.build(Map.of("ubs", ubs));
        assertTrue(context.contains("Unidades Basicas de Saude"));
        assertTrue(context.contains("UBS 1 Asa Norte"));
    }

    @Test
    void handlesEmptyExternalData() {
        String context = builder.build(Map.of());
        assertFalse(context.contains("DADOS EM TEMPO REAL"));
    }
}
