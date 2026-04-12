package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IntentDetector {

    private static final Pattern CEP_PATTERN = Pattern.compile("\\b(\\d{5})-?(\\d{3})\\b");
    private static final Pattern CNPJ_PATTERN = Pattern.compile("\\b(\\d{2})\\.?(\\d{3})\\.?(\\d{3})/?(\\d{4})-?(\\d{2})\\b");
    private static final Pattern PLACA_OLD_PATTERN = Pattern.compile("\\b([A-Z]{3})(\\d{4})\\b");
    private static final Pattern PLACA_MERCOSUL_PATTERN = Pattern.compile("\\b([A-Z]{3})(\\d)([A-Z])(\\d{2})\\b");
    private static final Pattern NIS_PATTERN = Pattern.compile("\\b(\\d{11})\\b");
    private static final Pattern NON_ALPHANUM = Pattern.compile("[^a-z0-9\\s]");
    private static final Pattern MULTI_SPACE = Pattern.compile("\\s+");

    // Expansoes de linguagem popular para termos canonicos usados pelo detector.
    // Ordem importa: expansoes mais especificas primeiro.
    private static final Map<String, String> SYNONYMS = new LinkedHashMap<>() {{
        // saude
        put("to mal", "passando mal");
        put("tou mal", "passando mal");
        put("ta mal", "passando mal");
        put("nao to bem", "passando mal");
        put("nao tou bem", "passando mal");
        put("to doente", "passando mal");
        put("tou doente", "passando mal");
        put("to com dor", "dor");
        put("ta doendo", "dor");
        // trabalho
        put("perdi o trabalho", "perdi meu emprego");
        put("perdi o servico", "perdi meu emprego");
        put("sem trampo", "perdi meu emprego");
        put("sem trabalho", "perdi meu emprego");
        put("fui mandado embora", "demissao");
        put("me mandaram embora", "demissao");
        put("me botaram na rua", "demissao");
        put("fui dispensado", "demissao");
        // violencia
        put("meu marido bate", "violencia domestica");
        put("meu marido me bate", "violencia domestica");
        put("meu companheiro bate", "violencia domestica");
        put("apanho em casa", "violencia domestica");
        put("sofro agressao", "violencia domestica");
        put("tou apanhando", "violencia domestica");
        put("to apanhando", "violencia domestica");
        // social
        put("nao tenho o que comer", "cesta basica");
        put("to passando fome", "cesta basica");
        put("cadastro unico", "cadunico");
    }};

    public DetectedIntent detect(String message) {
        String rawNormalized = stripAccents(message.toLowerCase());
        String tokens = normalize(message);
        String upper = message.toUpperCase();

        String cep = extractCep(rawNormalized);
        String cnpj = extractCnpj(rawNormalized);
        String placa = extractPlaca(upper);
        String nis = extractNis(rawNormalized);

        String category = detectCategory(tokens, nis);

        return new DetectedIntent(category, cep, cnpj, placa, nis, "Brasilia");
    }

    private String stripAccents(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("[\\u0300-\\u036f]", "");
    }

    private String detectCategory(String text, String nis) {
        if (containsAny(text, "bolsa familia", "beneficio", "recebi", "pagamento") && nis != null) {
            return "bolsa_familia";
        }
        if (containsAny(text, "bolsa familia", "cras", "bpc", "loas", "assistencia", "cadunico",
                "cad unico", "cadastro unico", "mae solo", "mae solteira", "auxilio",
                "beneficio social", "cesta basica", "pcd", "deficiencia", "deficiente",
                "pessoa com deficiencia")) {
            return "social";
        }
        if (containsAny(text, "aposentar", "aposentadoria", "previdencia", "inss", "me aposentar")) {
            return "previdencia";
        }
        if (containsAny(text, "medico", "saude", "hospital", "upa", "ubs", "sus", "remedio",
                "vacina", "doente", "passando mal", "dor", "consulta", "farmacia",
                "medicamento", "bula", "agendar consulta")) {
            return "saude";
        }
        if (containsAny(text, "emprego", "trabalho", "seguro desemprego", "seguro-desemprego",
                "ctps", "demiti", "demissao", "fgts", "sine", "carteira de trabalho",
                "perdi meu emprego", "fui mandado", "dispensad")) {
            return "trabalho";
        }
        if (containsAny(text, "cnh", "habilitacao", "carteira de motorista", "multa",
                "vistoria", "detran", "placa", "licenciamento", "veiculo")) {
            return "transito";
        }
        if (containsAny(text, "rg", "cpf", "documento", "certidao", "passaporte",
                "identidade", "cin", "titulo de eleitor", "segunda via")) {
            return "documentos";
        }
        if (containsAny(text, "maria da penha", "violencia domestica", "violencia contra mulher",
                "mulher agredida", "deam", "delegacia da mulher", "casa da mulher",
                "feminicidio", "medida protetiva", "apanho", "meu marido me bate",
                "meu companheiro me agride", "abuso", "agressao", "estupro",
                "assedio", "direitos da mulher", "mulher", "mae gestante",
                "gestante", "pre natal", "parto", "maternidade")) {
            return "mulher";
        }
        if (containsAny(text, "tcu", "tribunal de contas", "licitante inidoneo", "inidoneo",
                "inabilitado", "certidao negativa tcu", "contas publicas", "fiscalizacao tcu",
                "inidoneos", "sancionado", "impedido de licitar", "certidao tcu")) {
            return "tcu";
        }
        if (containsAny(text, "gastos", "licitacao", "contrato governo", "transparencia",
                "portal transparencia", "contas publicas", "fiscalizacao")) {
            return "transparencia";
        }
        return "geral";
    }

    private String extractCep(String text) {
        Matcher m = CEP_PATTERN.matcher(text);
        return m.find() ? m.group(1) + m.group(2) : null;
    }

    private String extractCnpj(String text) {
        Matcher m = CNPJ_PATTERN.matcher(text);
        return m.find() ? m.group(1) + m.group(2) + m.group(3) + m.group(4) + m.group(5) : null;
    }

    private String extractPlaca(String upper) {
        Matcher m = PLACA_MERCOSUL_PATTERN.matcher(upper);
        if (m.find()) return m.group(1) + m.group(2) + m.group(3) + m.group(4);
        m = PLACA_OLD_PATTERN.matcher(upper);
        return m.find() ? m.group(1) + m.group(2) : null;
    }

    private String extractNis(String text) {
        Matcher m = NIS_PATTERN.matcher(text);
        return m.find() ? m.group(1) : null;
    }

    private String normalize(String text) {
        String lower = text.toLowerCase();
        String noAccent = Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("[\\u0300-\\u036f]", "");
        String cleaned = NON_ALPHANUM.matcher(noAccent).replaceAll(" ");
        cleaned = MULTI_SPACE.matcher(cleaned).replaceAll(" ").trim();
        for (Map.Entry<String, String> e : SYNONYMS.entrySet()) {
            if (cleaned.contains(e.getKey())) {
                cleaned = cleaned.replace(e.getKey(), e.getValue());
            }
        }
        return cleaned;
    }

    private boolean containsAny(String text, String... keywords) {
        String[] tokens = text.isEmpty() ? new String[0] : text.split("\\s+");
        for (String kw : keywords) {
            if (kw.contains(" ")) {
                if (text.contains(kw)) return true;
                if (fuzzyContainsPhrase(tokens, kw)) return true;
                continue;
            }
            if (text.contains(kw)) return true;
            if (kw.length() < 5) continue;
            int maxDist = kw.length() >= 7 ? 2 : 1;
            for (String t : tokens) {
                if (t.length() < 3) continue;
                if (Math.abs(t.length() - kw.length()) > maxDist) continue;
                if (levenshtein(t, kw) <= maxDist) return true;
            }
        }
        return false;
    }

    // Tenta casar uma frase multi-palavra contra tokens consecutivos,
    // tolerando erros de digitacao por palavra (distancia de edicao).
    private boolean fuzzyContainsPhrase(String[] tokens, String phrase) {
        String[] parts = phrase.split("\\s+");
        if (parts.length == 0 || parts.length > tokens.length) return false;
        outer:
        for (int i = 0; i <= tokens.length - parts.length; i++) {
            for (int j = 0; j < parts.length; j++) {
                String kw = parts[j];
                String tk = tokens[i + j];
                if (kw.equals(tk)) continue;
                if (kw.length() < 4) continue outer;
                int maxDist = kw.length() >= 7 ? 2 : 1;
                if (Math.abs(kw.length() - tk.length()) > maxDist) continue outer;
                if (levenshtein(kw, tk) > maxDist) continue outer;
            }
            return true;
        }
        return false;
    }

    // Distancia de edicao limitada — retorna cedo se passar do limite.
    private int levenshtein(String a, String b) {
        int n = a.length();
        int m = b.length();
        if (n == 0) return m;
        if (m == 0) return n;
        int[] prev = new int[m + 1];
        int[] curr = new int[m + 1];
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            curr[0] = i;
            for (int j = 1; j <= m; j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(
                        Math.min(curr[j - 1] + 1, prev[j] + 1),
                        prev[j - 1] + cost
                );
            }
            int[] tmp = prev;
            prev = curr;
            curr = tmp;
        }
        return prev[m];
    }
}
