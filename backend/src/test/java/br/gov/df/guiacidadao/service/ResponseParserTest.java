package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResponseParserTest {

    private final ResponseParser parser = new ResponseParser();

    @Test
    void parsesValidJson() {
        String json = """
                {
                  "tag": { "cls": "tag-health", "icon": "HeartPulse", "txt": "Saude" },
                  "intro": "Voce pode ir a UBS.",
                  "blocks": [
                    { "icon": "MapPin", "title": "Onde ir", "body": "UBS mais proxima" }
                  ],
                  "steps": ["Passo 1", "Passo 2"],
                  "tip": "Leve seu cartao SUS",
                  "contact": { "title": "UBS Norte", "addr": "SGAN 905", "phone": "160", "hours": "8h-17h" },
                  "related": ["Como tirar cartao SUS?"]
                }
                """;
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 500);
        assertEquals("tag-health", response.tag().cls());
        assertEquals("Saude", response.tag().txt());
        assertEquals("Voce pode ir a UBS.", response.intro());
        assertEquals(1, response.blocks().size());
        assertEquals("Onde ir", response.blocks().get(0).title());
        assertEquals(2, response.steps().size());
        assertEquals("Leve seu cartao SUS", response.tip());
        assertNotNull(response.contact());
        assertEquals(1, response.related().size());
        assertNotNull(response.meta());
        assertEquals("sess_1", response.meta().sessionId());
    }

    @Test
    void parsesJsonWithDocs() {
        String json = """
                {
                  "tag": { "cls": "tag-work", "icon": "Briefcase", "txt": "Trabalho" },
                  "intro": "Seguro desemprego.",
                  "blocks": [
                    { "icon": "FileText", "title": "Documentos", "docs": ["RG", "CPF", "CTPS"] }
                  ],
                  "steps": ["Passo 1", "Passo 2"]
                }
                """;
        ChatResponse response = parser.parse(json, null, "gemma", 300);
        assertEquals(3, response.blocks().get(0).docs().size());
        assertNull(response.blocks().get(0).body());
        assertNull(response.tip());
    }

    @Test
    void returnsFallbackForInvalidJson() {
        ChatResponse response = parser.parse("not json at all", "sess_1", "gemma", 100);
        assertEquals("tag-social", response.tag().cls());
        assertEquals("Resposta", response.tag().txt());
        assertTrue(response.intro().contains("not json at all"));
    }

    @Test
    void returnsFallbackForMissingRequiredFields() {
        String json = """
                { "tag": { "cls": "tag-health" } }
                """;
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 100);
        assertEquals("tag-health", response.tag().cls());
        assertEquals("Saúde", response.tag().txt());
        assertTrue(response.intro().contains("tag"));
    }

    @Test
    void handlesJsonWrappedInCodeBlock() {
        String json = """
                ```json
                {
                  "tag": { "cls": "tag-health", "icon": "HeartPulse", "txt": "Saude" },
                  "intro": "Resposta valida.",
                  "blocks": [{ "icon": "Info", "title": "Info", "body": "Texto" }],
                  "steps": ["Passo 1", "Passo 2"]
                }
                ```
                """;
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 100);
        assertEquals("tag-health", response.tag().cls());
    }

    @Test
    void handlesNewlinesInsideJsonStringValues() {
        String json = "{ \"tag\": \"tag-social\", \"intro\": \"Linha 1\nLinha 2\", \"blocks\": [], \"steps\": [] }";
        ChatResponse response = parser.parse(json, "sess_1", "gemma", 100);
        assertEquals("tag-social", response.tag().cls());
        assertTrue(response.intro().contains("Linha 1"));
        assertTrue(response.intro().contains("Linha 2"));
    }
}
