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
            cleaned = sanitizeJsonLike(cleaned);
            JsonNode root;
            try {
                root = objectMapper.readTree(cleaned);
            } catch (Exception e) {
                String extracted = extractJsonObject(cleaned);
                if (extracted != null) {
                    extracted = sanitizeJsonLike(extracted);
                    root = objectMapper.readTree(extracted);
                } else {
                    return ChatResponse.fromParsed(
                            new Tag("tag-social", "Info", "Resposta"),
                            escapeHtml(cleaned).replace("\n", "<br/>"),
                            List.of(),
                            List.of("Se quiser, me diga sua cidade/bairro e o que você precisa exatamente."),
                            null, null, null,
                            sessionId, model, processingMs
                    );
                }
            }

            Tag tag = parseTag(root.get("tag"));
            String intro = root.has("intro") && !root.get("intro").isNull()
                    ? root.get("intro").asText()
                    : escapeHtml(cleaned).replace("\n", "<br/>");

            List<Block> blocks = new ArrayList<>();
            if (root.has("blocks") && root.get("blocks").isArray()) {
                for (JsonNode b : root.get("blocks")) {
                    String icon = b.has("icon") ? b.get("icon").asText() : "Info";
                    String title = b.has("title") ? b.get("title").asText() : "";
                    String body = b.has("body") && !b.get("body").isNull() ? b.get("body").asText() : null;
                    List<String> docs = null;
                    if (b.has("docs") && !b.get("docs").isNull()) {
                        docs = new ArrayList<>();
                        if (b.get("docs").isArray()) {
                            for (JsonNode d : b.get("docs")) {
                                docs.add(normalizeDoc(d.asText()));
                            }
                        } else {
                            docs.add(normalizeDoc(b.get("docs").asText()));
                        }
                    }
                    blocks.add(new Block(icon, title, body, docs));
                }
            }

            List<String> steps = new ArrayList<>();
            if (root.has("steps") && root.get("steps").isArray()) {
                for (JsonNode s : root.get("steps")) {
                    steps.add(s.asText());
                }
            }
            if (steps.isEmpty()) {
                steps.add("Se quiser, me diga sua cidade/bairro e o que você precisa exatamente.");
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

    private String extractJsonObject(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return null;
    }

    private String sanitizeJsonLike(String s) {
        if (s == null) return "";
        String input = s
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replace('“', '"')
                .replace('”', '"')
                .replace('’', '\'');

        StringBuilder out = new StringBuilder(input.length() + 16);
        boolean inString = false;
        boolean escaping = false;

        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);

            if (inString) {
                if (escaping) {
                    out.append(c);
                    escaping = false;
                    continue;
                }
                if (c == '\\') {
                    out.append(c);
                    escaping = true;
                    continue;
                }
                if (c == '"') {
                    out.append(c);
                    inString = false;
                    continue;
                }
                if (c == '\n') {
                    out.append("\\n");
                    continue;
                }
                out.append(c);
                continue;
            }

            if (c == '"') {
                out.append(c);
                inString = true;
                continue;
            }

            out.append(c);
        }

        return out.toString();
    }

    private String normalizeDoc(String d) {
        if (d == null) return "";
        String t = d.trim();
        if (t.startsWith("`") && t.endsWith("`") && t.length() >= 2) {
            t = t.substring(1, t.length() - 1).trim();
        }
        if (t.startsWith("`")) t = t.substring(1).trim();
        if (t.endsWith("`")) t = t.substring(0, t.length() - 1).trim();
        return t;
    }

    private Tag parseTag(JsonNode tagNode) {
        String cls = "tag-social";
        String icon = "Info";
        String txt = "Resposta";

        if (tagNode == null || tagNode.isNull()) {
            return new Tag(cls, icon, txt);
        }

        if (tagNode.isTextual()) {
            cls = tagNode.asText(cls);
            txt = humanizeTag(cls);
            return new Tag(cls, icon, txt);
        }

        if (tagNode.isObject()) {
            if (tagNode.has("cls") && !tagNode.get("cls").isNull()) cls = tagNode.get("cls").asText(cls);
            if (tagNode.has("icon") && !tagNode.get("icon").isNull()) icon = tagNode.get("icon").asText(icon);
            if (tagNode.has("txt") && !tagNode.get("txt").isNull()) {
                txt = tagNode.get("txt").asText(humanizeTag(cls));
            } else {
                txt = humanizeTag(cls);
            }
            return new Tag(cls, icon, txt);
        }

        return new Tag(cls, icon, txt);
    }

    private String humanizeTag(String cls) {
        if (cls == null) return "Resposta";
        return switch (cls) {
            case "tag-health" -> "Saúde";
            case "tag-work" -> "Trabalho";
            case "tag-transit" -> "Trânsito";
            case "tag-tcu" -> "TCU";
            case "tag-mulher" -> "Mulher";
            case "tag-social" -> "Social";
            default -> "Resposta";
        };
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
