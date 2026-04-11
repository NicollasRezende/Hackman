package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.ChatResponse.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResponseParser {

    private static final Logger log = LoggerFactory.getLogger(ResponseParser.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse parse(String rawJson, String sessionId, String model, long processingMs) {
        try {
            String cleaned = cleanJson(rawJson);
            JsonNode root = objectMapper.readTree(cleaned);

            if (!root.has("tag") || !root.has("intro") || !root.has("blocks") || !root.has("steps")) {
                log.warn("JSON do LLM com campos obrigatorios faltando");
                return ChatResponse.fallback(sessionId, model);
            }

            JsonNode tagNode = root.get("tag");
            if (!tagNode.has("cls") || !tagNode.has("icon") || !tagNode.has("txt")) {
                log.warn("JSON do LLM com tag incompleta");
                return ChatResponse.fallback(sessionId, model);
            }

            Tag tag = new Tag(
                    tagNode.get("cls").asText(),
                    tagNode.get("icon").asText(),
                    tagNode.get("txt").asText()
            );

            String intro = root.get("intro").asText();

            List<Block> blocks = new ArrayList<>();
            for (JsonNode b : root.get("blocks")) {
                String icon = b.has("icon") ? b.get("icon").asText() : "Info";
                String title = b.has("title") ? b.get("title").asText() : "";
                String body = b.has("body") && !b.get("body").isNull() ? b.get("body").asText() : null;
                List<String> docs = null;
                if (b.has("docs") && b.get("docs").isArray()) {
                    docs = new ArrayList<>();
                    for (JsonNode d : b.get("docs")) {
                        docs.add(d.asText());
                    }
                }
                blocks.add(new Block(icon, title, body, docs));
            }

            List<String> steps = new ArrayList<>();
            for (JsonNode s : root.get("steps")) {
                steps.add(s.asText());
            }

            String tip = root.has("tip") && !root.get("tip").isNull() ? root.get("tip").asText() : null;

            Contact contact = null;
            if (root.has("contact") && !root.get("contact").isNull()) {
                JsonNode c = root.get("contact");
                contact = new Contact(
                        c.has("title") ? c.get("title").asText() : "",
                        c.has("addr") ? c.get("addr").asText() : "",
                        c.has("phone") ? c.get("phone").asText() : "",
                        c.has("hours") ? c.get("hours").asText() : ""
                );
            }

            List<String> related = null;
            if (root.has("related") && root.get("related").isArray()) {
                related = new ArrayList<>();
                for (JsonNode r : root.get("related")) {
                    related.add(r.asText());
                }
            }

            return ChatResponse.fromParsed(tag, intro, blocks, steps, tip, contact, related,
                    sessionId, model, processingMs);

        } catch (Exception e) {
            log.error("Erro ao parsear JSON do LLM: {}", e.getMessage());
            return ChatResponse.fallback(sessionId, model);
        }
    }

    private String cleanJson(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
            trimmed = trimmed.trim();
        }
        return trimmed;
    }
}
