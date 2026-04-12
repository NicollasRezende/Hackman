package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IntentDetectorTest {

    private final IntentDetector detector = new IntentDetector();

    @Test
    void detectsSaudeCategory() {
        DetectedIntent intent = detector.detect("to passando mal preciso de medico");
        assertEquals("saude", intent.category());
    }

    @Test
    void detectsTrabalhoCategory() {
        DetectedIntent intent = detector.detect("fui demitido e preciso do seguro desemprego");
        assertEquals("trabalho", intent.category());
    }

    @Test
    void detectsTransitoCategory() {
        DetectedIntent intent = detector.detect("quero tirar minha primeira CNH");
        assertEquals("transito", intent.category());
    }

    @Test
    void detectsDocumentosCategory() {
        DetectedIntent intent = detector.detect("preciso da segunda via do RG");
        assertEquals("documentos", intent.category());
    }

    @Test
    void detectsSocialCategory() {
        DetectedIntent intent = detector.detect("como me inscrever no bolsa familia");
        assertEquals("social", intent.category());
    }

    @Test
    void detectsPrevidenciaCategory() {
        DetectedIntent intent = detector.detect("quero me aposentar pelo INSS");
        assertEquals("previdencia", intent.category());
    }

    @Test
    void detectsBolsaFamiliaWithNis() {
        DetectedIntent intent = detector.detect("recebi meu bolsa familia? meu NIS 12345678901");
        assertEquals("bolsa_familia", intent.category());
        assertEquals("12345678901", intent.nis());
    }

    @Test
    void detectsCep() {
        DetectedIntent intent = detector.detect("moro no CEP 70040-020 e preciso de medico");
        assertEquals("70040020", intent.cep());
        assertEquals("saude", intent.category());
    }

    @Test
    void detectsCepWithDash() {
        DetectedIntent intent = detector.detect("meu cep eh 72000-000");
        assertEquals("72000000", intent.cep());
    }

    @Test
    void detectsCnpj() {
        DetectedIntent intent = detector.detect("minha empresa CNPJ 12.345.678/0001-90");
        assertEquals("12345678000190", intent.cnpj());
    }

    @Test
    void detectsPlacaOld() {
        DetectedIntent intent = detector.detect("meu carro placa ABC1234");
        assertEquals("ABC1234", intent.placa());
    }

    @Test
    void detectsPlacaMercosul() {
        DetectedIntent intent = detector.detect("placa do veiculo ABC1D23");
        assertEquals("ABC1D23", intent.placa());
    }

    @Test
    void defaultsToGeralWhenNoMatch() {
        DetectedIntent intent = detector.detect("ola bom dia");
        assertEquals("geral", intent.category());
    }

    @Test
    void defaultsCidadeToBrasilia() {
        DetectedIntent intent = detector.detect("qualquer coisa");
        assertEquals("Brasilia", intent.cidade());
    }

    @Test
    void handlesAccentsAndCaseInsensitive() {
        DetectedIntent intent = detector.detect("QUERO TIRAR MINHA CARTEIRA DE MOTORISTA");
        assertEquals("transito", intent.category());
    }

    @Test
    void detectsSaudeWithTypoInPassandoMal() {
        DetectedIntent intent = detector.detect("to pasando mal, preciso de ajuda");
        assertEquals("saude", intent.category());
    }

    @Test
    void detectsSaudeWithPopularSynonymTaMal() {
        DetectedIntent intent = detector.detect("ta mal, nao sei o que fazer");
        assertEquals("saude", intent.category());
    }

    @Test
    void detectsTrabalhoWithTypoInEmprego() {
        DetectedIntent intent = detector.detect("perdi meu empreego ontem");
        assertEquals("trabalho", intent.category());
    }

    @Test
    void detectsTrabalhoWithSynonymMeMandaramEmbora() {
        DetectedIntent intent = detector.detect("me mandaram embora do servico");
        assertEquals("trabalho", intent.category());
    }

    @Test
    void detectsMulherWithTypoInViolencia() {
        DetectedIntent intent = detector.detect("violencia domestca, preciso de ajuda");
        assertEquals("mulher", intent.category());
    }

    @Test
    void detectsMulherWithPopularSynonymMaridoBate() {
        DetectedIntent intent = detector.detect("meu marido bate em mim");
        assertEquals("mulher", intent.category());
    }

    @Test
    void stillDetectsCnpjAfterNormalization() {
        DetectedIntent intent = detector.detect("cnpj 12.345.678/0001-90 inidoneo tcu");
        assertEquals("12345678000190", intent.cnpj());
        assertEquals("tcu", intent.category());
    }
}
