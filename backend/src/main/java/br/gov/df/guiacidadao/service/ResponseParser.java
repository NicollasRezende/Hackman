package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.ChatResponse.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;

@Service
public class ResponseParser {

    private static final Logger log = LoggerFactory.getLogger(ResponseParser.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse parse(String rawJson, String sessionId, String model, long processingMs) {
        return parse(rawJson, sessionId, model, processingMs, null);
    }

    public ChatResponse parse(String rawJson, String sessionId, String model, long processingMs, String intentCategory) {
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
                    Tag fallbackTag = tagForCategory(intentCategory);
                    return ChatResponse.fromParsed(
                            fallbackTag,
                            escapeHtml(cleaned).replace("\n", "<br/>"),
                            List.of(),
                            List.of("Se quiser, me diga sua cidade/bairro e o que você precisa exatamente."),
                            null, contactForCategory(intentCategory), null,
                            sessionId, model, processingMs
                    );
                }
            }

            Tag tag = intentCategory != null
                    ? tagForCategory(intentCategory)
                    : parseTag(root.get("tag"));
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
                                String nd = normalizeDoc(d.asText());
                                if (!nd.isBlank()) docs.add(nd);
                            }
                        } else {
                            String nd = normalizeDoc(b.get("docs").asText());
                            if (!nd.isBlank()) docs.add(nd);
                        }
                        if (docs.isEmpty()) docs = null;
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
            contact = normalizeContact(contact, tag, intentCategory);

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
        if (t.startsWith("http://") || t.startsWith("https://")) {
            if (!isAllowedUrl(t)) return "";
        }
        return t;
    }

    private boolean isAllowedUrl(String url) {
        try {
            java.net.URI u = java.net.URI.create(url);
            String host = u.getHost();
            if (host == null) return false;
            String h = host.toLowerCase();
            if (h.equals("df.gov.br") || h.endsWith(".df.gov.br")) return true;
            return h.equals("meu.inss.gov.br");
        } catch (Exception e) {
            return false;
        }
    }

    private Contact normalizeContact(Contact contact, Tag tag, String intentCategory) {
        // Sempre sobrescrevemos o contato com dados curados do DF.
        // O LLM nao e confiavel para enderecos — alucinou ruas ficticias.
        if (intentCategory != null) {
            return contactForCategory(intentCategory);
        }
        String cls = tag != null ? tag.cls() : "tag-social";
        return defaultContactForTag(cls);
    }

    Contact contactForCategory(String category) {
        if (category == null) category = "geral";
        return switch (category) {
            case "mulher" -> new Contact(
                    "Casa da Mulher Brasileira — Brasília (DF)",
                    "SGAS 601, Lote 2, Asa Sul, Brasília/DF",
                    "(61) 3223-3690",
                    "24 horas"
            );
            case "trabalho" -> new Contact(
                    "Agência do Trabalhador — SEDET/DF",
                    "SAIN Parque Rural, Bloco B, Asa Norte, Brasília/DF",
                    "158",
                    "Seg–Sex 8h–17h"
            );
            case "saude" -> new Contact(
                    "Central 156 (GDF) / SES-DF",
                    "Brasília/DF — ligue 156 para a UBS/UPA mais próxima",
                    "156",
                    "24 horas"
            );
            case "previdencia" -> new Contact(
                    "INSS — Meu INSS",
                    "Agências do INSS no DF (agendamento pelo Meu INSS)",
                    "135",
                    "Seg–Sex 7h–17h"
            );
            case "transito" -> new Contact(
                    "DETRAN-DF — Sede",
                    "SGON Quadra 5, Lote 23, Brasília/DF",
                    "154",
                    "Seg–Sex 8h–18h"
            );
            case "documentos" -> new Contact(
                    "Rede Na Hora — GDF",
                    "Postos Na Hora no DF (agendamento em nahora.df.gov.br)",
                    "156",
                    "Seg–Sex 8h–18h"
            );
            case "social", "bolsa_familia" -> new Contact(
                    "CRAS / SEDES-DF",
                    "CRAS mais próximo no DF (consulte sedes.df.gov.br)",
                    "156",
                    "Seg–Sex 8h–17h"
            );
            case "tcu" -> new Contact(
                    "Tribunal de Contas da União (TCU)",
                    "SAFS Quadra 4, Lote 1, Brasília/DF",
                    "(61) 3316-5338",
                    "Seg–Sex 9h–18h"
            );
            case "transparencia" -> new Contact(
                    "Portal da Transparência do DF",
                    "Consulta online — transparencia.df.gov.br",
                    "162",
                    "24 horas (portal online)"
            );
            default -> new Contact(
                    "Central 156 (GDF)",
                    "Brasília/DF — Central do Cidadão",
                    "156",
                    "24 horas"
            );
        };
    }

    Tag tagForCategory(String category) {
        if (category == null) category = "geral";
        return switch (category) {
            case "saude" -> new Tag("tag-health", "Heart", "Saúde");
            case "trabalho" -> new Tag("tag-work", "Briefcase", "Trabalho");
            case "previdencia" -> new Tag("tag-work", "Briefcase", "Previdência");
            case "transito" -> new Tag("tag-transit", "Car", "Trânsito");
            case "documentos" -> new Tag("tag-social", "FileText", "Documentos");
            case "social", "bolsa_familia" -> new Tag("tag-social", "Users", "Social");
            case "mulher" -> new Tag("tag-mulher", "Shield", "Mulher");
            case "tcu" -> new Tag("tag-tcu", "Scale", "TCU");
            case "transparencia" -> new Tag("tag-social", "Eye", "Transparência");
            default -> new Tag("tag-social", "Info", "Resposta");
        };
    }

    private Contact defaultContactForTag(String cls) {
        if (cls == null) cls = "tag-social";
        return switch (cls) {
            case "tag-mulher" -> contactForCategory("mulher");
            case "tag-work" -> contactForCategory("trabalho");
            case "tag-health" -> contactForCategory("saude");
            case "tag-transit" -> contactForCategory("transito");
            case "tag-tcu" -> contactForCategory("tcu");
            default -> contactForCategory("geral");
        };
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("\\D+", "");
        if (digits.isEmpty()) return "";
        if (digits.equals("156") || digits.equals("158") || digits.equals("180") || digits.equals("190")
                || digits.equals("192") || digits.equals("193") || digits.equals("199") || digits.equals("135")) {
            return digits;
        }
        if ((digits.length() == 10 || digits.length() == 11) && digits.startsWith("61")) {
            return phone;
        }
        return "";
    }

    private boolean isLikelyDfAddress(String addr) {
        if (addr == null) return false;
        String t = normalizeText(addr);
        if (t.isBlank()) return false;
        if (t.contains("sao paulo") || t.contains(", sp") || t.contains(" sp ") || t.endsWith(" sp")) return false;
        if (t.contains("rio de janeiro") || t.contains(", rj") || t.endsWith(" rj")) return false;
        if (t.contains("brasilia") || t.contains(" distrito federal") || t.contains(" df")) return true;
        return t.contains("asa sul") || t.contains("asa norte") || t.contains("ceilandia") || t.contains("taguatinga")
                || t.contains("samambaia") || t.contains("guara") || t.contains("planaltina") || t.contains("paranoa")
                || t.contains("sobradinho") || t.contains("gama") || t.contains("recanto das emas") || t.contains("brazlandia");
    }

    private String normalizeText(String s) {
        String lower = s.toLowerCase();
        String n = Normalizer.normalize(lower, Normalizer.Form.NFD).replaceAll("[\\u0300-\\u036f]", "");
        return n.replaceAll("\\s+", " ").trim();
    }

    private String safeTrim(String s) {
        return s == null ? "" : s.trim();
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
