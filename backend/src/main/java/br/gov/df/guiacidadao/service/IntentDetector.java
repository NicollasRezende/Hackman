package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.DetectedIntent;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IntentDetector {

    private static final Pattern CEP_PATTERN = Pattern.compile("\\b(\\d{5})-?(\\d{3})\\b");
    private static final Pattern CNPJ_PATTERN = Pattern.compile("\\b(\\d{2})\\.?(\\d{3})\\.?(\\d{3})/?(\\d{4})-?(\\d{2})\\b");
    private static final Pattern PLACA_OLD_PATTERN = Pattern.compile("\\b([A-Z]{3})(\\d{4})\\b");
    private static final Pattern PLACA_MERCOSUL_PATTERN = Pattern.compile("\\b([A-Z]{3})(\\d)([A-Z])(\\d{2})\\b");
    private static final Pattern NIS_PATTERN = Pattern.compile("\\b(\\d{11})\\b");

    public DetectedIntent detect(String message) {
        String normalized = normalize(message);
        String upper = message.toUpperCase();

        String cep = extractCep(normalized);
        String cnpj = extractCnpj(normalized);
        String placa = extractPlaca(upper);
        String nis = extractNis(normalized);

        String category = detectCategory(normalized, nis);

        return new DetectedIntent(category, cep, cnpj, placa, nis, "Brasilia");
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
        return Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("[\\u0300-\\u036f]", "");
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
