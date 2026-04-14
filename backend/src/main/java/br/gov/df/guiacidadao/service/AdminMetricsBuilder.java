package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.entity.ChatLog;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.AuditInteractionRow;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.CategoryOrgSatisfaction;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.ChannelShareRow;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.FiscalImpact;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.RegionalDemandRow;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.TransparencyBundle;
import br.gov.df.guiacidadao.repository.ChatFeedbackRepository;
import br.gov.df.guiacidadao.repository.ChatLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Component
public class AdminMetricsBuilder {

    private static final Map<String, String> CATEGORY_TO_ORG = new LinkedHashMap<>();

    static {
        CATEGORY_TO_ORG.put("saude", "SES-DF");
        CATEGORY_TO_ORG.put("trabalho", "SINE / Trabalho");
        CATEGORY_TO_ORG.put("previdencia", "INSS / Previdência");
        CATEGORY_TO_ORG.put("transito", "DETRAN-DF");
        CATEGORY_TO_ORG.put("documentos", "PCDF / Cartório / GDF");
        CATEGORY_TO_ORG.put("assistencia_social", "SEDES / CRAS");
        CATEGORY_TO_ORG.put("transparencia", "Portal da Transparência");
        CATEGORY_TO_ORG.put("bolsa_familia", "MDS / CadÚnico");
        CATEGORY_TO_ORG.put("mulher", "SPM / GDF");
        CATEGORY_TO_ORG.put("tcu", "TCU");
        CATEGORY_TO_ORG.put("geral", "Central 156 / GDF");
        CATEGORY_TO_ORG.put("error", "Indefinido (fallback)");
    }

    private final ChatLogRepository chatLogRepo;
    private final ChatFeedbackRepository feedbackRepo;

    private final double fiscalMinPerVisit;
    private final double fiscalMaxPerVisit;
    private final double systemInvestmentReais;
    private final String groqModel;
    private final String openRouterModel;
    private final String releaseVersion;
    private final boolean transparenciaKeyConfigured;

    public AdminMetricsBuilder(
            ChatLogRepository chatLogRepo,
            ChatFeedbackRepository feedbackRepo,
            @Value("${guiacidadao.fiscal.custo-atendimento-presencial.min:40}") double fiscalMinPerVisit,
            @Value("${guiacidadao.fiscal.custo-atendimento-presencial.max:80}") double fiscalMaxPerVisit,
            @Value("${guiacidadao.fiscal.investimento-sistema-reais:0}") double systemInvestmentReais,
            @Value("${groq.model:}") String groqModel,
            @Value("${openrouter.model:}") String openRouterModel,
            @Value("${guiacidadao.release.version:1.0.0-demo}") String releaseVersion,
            @Value("${transparencia.api.key:}") String transparenciaApiKey
    ) {
        this.chatLogRepo = chatLogRepo;
        this.feedbackRepo = feedbackRepo;
        this.fiscalMinPerVisit = fiscalMinPerVisit;
        this.fiscalMaxPerVisit = fiscalMaxPerVisit;
        this.systemInvestmentReais = systemInvestmentReais;
        this.groqModel = groqModel == null ? "" : groqModel;
        this.openRouterModel = openRouterModel == null ? "" : openRouterModel;
        this.releaseVersion = releaseVersion;
        this.transparenciaKeyConfigured =
                transparenciaApiKey != null && !transparenciaApiKey.isBlank();
    }

    public AdminMetricsDTO build() {
        long totalMessages = chatLogRepo.count();
        long uniqueSessions = chatLogRepo.countUniqueSessions();
        long avgMs = Math.round(chatLogRepo.averageProcessingMs());

        long positive = feedbackRepo.countByVote("positive");
        long negative = feedbackRepo.countByVote("negative");
        long feedbackTotal = positive + negative;

        List<AdminMetricsDTO.CategoryCount> categoryCounts = chatLogRepo.countByCategory().stream()
                .map(row -> new AdminMetricsDTO.CategoryCount((String) row[0], (Long) row[1]))
                .toList();

        List<AdminMetricsDTO.TimelineCount> timelineCounts = chatLogRepo.countByHour().stream()
                .map(row -> new AdminMetricsDTO.TimelineCount((String) row[0], (Long) row[1]))
                .toList();

        List<AdminMetricsDTO.TopMessage> topMessages = chatLogRepo.topMessages().stream()
                .limit(10)
                .map(row -> new AdminMetricsDTO.TopMessage((String) row[0], (Long) row[1]))
                .toList();

        long spanDays = computeSpanDays(
                chatLogRepo.findMinCreatedAt(),
                chatLogRepo.findMaxCreatedAt());
        FiscalImpact fiscal = buildFiscal(totalMessages, spanDays);

        List<CategoryOrgSatisfaction> orgRanking = buildOrgRanking(
                feedbackRepo.countFeedbackVotesByCategory());

        List<AuditInteractionRow> auditSample = buildAuditSample(
                chatLogRepo.findTop100ByOrderByCreatedAtDesc());

        TransparencyBundle transparency = new TransparencyBundle(
                primaryModelLabel(),
                openRouterModel.isBlank() ? null : openRouterModel,
                releaseVersion,
                "/v1/admin/metrics/export.csv",
                "/v1/transparency/summary",
                "/v1/metrics/summary"
        );

        List<RegionalDemandRow> regionalDemand = List.of();
        List<ChannelShareRow> channelShares = List.of(
                new ChannelShareRow("Web (Guia Cidadão)", totalMessages, 100.0,
                        "Coleta por canal em evolução — hoje 100% web.")
        );

        List<String> staleness = new ArrayList<>();
        if (!transparenciaKeyConfigured) {
            staleness.add(
                    "API do Portal da Transparência sem chave: "
                            + "dados orçamentários externos podem estar desatualizados.");
        }
        staleness.add(
                "Monitoramento automático de alteração legislativa: "
                        + "não configurado (roadmap auditoria).");

        long errorInteractions = categoryCounts.stream()
                .filter(c -> "error".equalsIgnoreCase(c.category()))
                .mapToLong(AdminMetricsDTO.CategoryCount::count)
                .sum();

        List<String> controlNotes = List.of(
                "Taxa de fallback / baixa confiança (categoria error): "
                        + percent(errorInteractions, totalMessages) + "%.",
                "Feedback negativo por domínio: ver tabela "
                        + "\"Desempenho por domínio / órgão\".",
                "Fonte legal por resposta: campo `provenance` na API POST /v1/chat."
        );

        return new AdminMetricsDTO(
                totalMessages,
                uniqueSessions,
                avgMs,
                feedbackTotal,
                positive,
                negative,
                categoryCounts,
                timelineCounts,
                topMessages,
                fiscal,
                orgRanking,
                auditSample,
                transparency,
                regionalDemand,
                channelShares,
                controlNotes,
                staleness
        );
    }

    public String buildCsv(AdminMetricsDTO dto) {
        StringBuilder sb = new StringBuilder();
        sb.append("metrica,valor\n");
        sb.append("total_atendimentos,").append(dto.totalMessages()).append('\n');
        sb.append("sessoes_unicas,").append(dto.uniqueSessions()).append('\n');
        sb.append("tempo_medio_ms,").append(dto.avgProcessingMs()).append('\n');
        sb.append("feedback_total,").append(dto.feedbackTotal()).append('\n');
        sb.append("feedback_positivo,").append(dto.feedbackPositive()).append('\n');
        sb.append("feedback_negativo,").append(dto.feedbackNegative()).append('\n');
        FiscalImpact f = dto.fiscalImpact();
        sb.append("economia_estimada_min_reais,")
                .append(round2(f.savingsEstimateMinReais())).append('\n');
        sb.append("economia_estimada_max_reais,")
                .append(round2(f.savingsEstimateMaxReais())).append('\n');
        sb.append("economia_anualizada_min_reais,")
                .append(round2(f.annualizedSavingsMinReais())).append('\n');
        sb.append("economia_anualizada_max_reais,")
                .append(round2(f.annualizedSavingsMaxReais())).append('\n');
        for (AdminMetricsDTO.CategoryCount c : dto.categoryCounts()) {
            sb.append("categoria,").append(csvEscape(c.category()))
                    .append(",").append(c.count()).append('\n');
        }
        for (CategoryOrgSatisfaction o : dto.orgRankingByDomain()) {
            sb.append("orgao_dominio,")
                    .append(csvEscape(o.orgLabel())).append(',')
                    .append(csvEscape(o.category())).append(',')
                    .append(o.interactions()).append(',')
                    .append(o.feedbackPositive()).append(',')
                    .append(o.feedbackNegative()).append(',')
                    .append(o.reliabilityIndexPercent() == null
                            ? ""
                            : String.valueOf(round2(o.reliabilityIndexPercent())))
                    .append('\n');
        }
        sb.append("versao_sistema,").append(csvEscape(dto.transparency().releaseVersion()))
                .append('\n');
        sb.append("modelo_ia,").append(csvEscape(dto.transparency().primaryModelLabel()))
                .append('\n');
        return sb.toString();
    }

    private static String csvEscape(String s) {
        if (s == null) {
            return "";
        }
        String t = s.replace("\"", "\"\"");
        if (t.contains(",") || t.contains("\n") || t.contains("\"")) {
            return "\"" + t + "\"";
        }
        return t;
    }

    private FiscalImpact buildFiscal(long digitalInteractions, long spanDays) {
        double savingsMin = digitalInteractions * fiscalMinPerVisit;
        double savingsMax = digitalInteractions * fiscalMaxPerVisit;
        double daily = digitalInteractions / (double) Math.max(1L, spanDays);
        double annualMin = daily * 365.0 * fiscalMinPerVisit;
        double annualMax = daily * 365.0 * fiscalMaxPerVisit;
        Double roiMin = systemInvestmentReais > 0 ? savingsMin / systemInvestmentReais : null;
        Double roiMax = systemInvestmentReais > 0 ? savingsMax / systemInvestmentReais : null;
        String note = String.format(Locale.ROOT,
                "Premissas: custo presencial estimado R$ %.0f–%.0f por atendimento; "
                        + "cada interação digital conta como 1 atendimento evitado; "
                        + "projeção anual = média diária (sobre %d dias com logs) × 365.",
                fiscalMinPerVisit, fiscalMaxPerVisit, spanDays);
        return new FiscalImpact(
                digitalInteractions,
                fiscalMinPerVisit,
                fiscalMaxPerVisit,
                round2(savingsMin),
                round2(savingsMax),
                round2(annualMin),
                round2(annualMax),
                (int) spanDays,
                roiMin == null ? null : round2(roiMin),
                roiMax == null ? null : round2(roiMax),
                systemInvestmentReais,
                note
        );
    }

    private long computeSpanDays(Instant min, Instant max) {
        if (min == null || max == null) {
            return 1L;
        }
        long days = ChronoUnit.DAYS.between(min, max) + 1L;
        return Math.max(1L, days);
    }

    private List<CategoryOrgSatisfaction> buildOrgRanking(List<Object[]> voteRows) {
        Map<String, long[]> acc = new HashMap<>();
        for (Object[] row : voteRows) {
            String cat = row[0] == null ? "geral" : row[0].toString();
            String vote = row[1] == null ? "" : row[1].toString();
            long n = ((Number) row[2]).longValue();
            long[] pair = acc.computeIfAbsent(cat, k -> new long[2]);
            if ("positive".equalsIgnoreCase(vote)) {
                pair[0] += n;
            } else if ("negative".equalsIgnoreCase(vote)) {
                pair[1] += n;
            }
        }

        Map<String, Long> interactionsByCat = new HashMap<>();
        for (Object[] row : chatLogRepo.countByCategory()) {
            String cat = row[0] == null ? "geral" : row[0].toString();
            interactionsByCat.put(cat, ((Number) row[1]).longValue());
        }

        List<CategoryOrgSatisfaction> list = new ArrayList<>();
        for (Map.Entry<String, Long> e : interactionsByCat.entrySet()) {
            String cat = e.getKey();
            long interactions = e.getValue();
            long[] fb = acc.getOrDefault(cat, new long[2]);
            long pos = fb[0];
            long neg = fb[1];
            long fbTotal = pos + neg;
            Double reliability = fbTotal == 0
                    ? null
                    : round2(100.0 * pos / fbTotal);
            String org = CATEGORY_TO_ORG.getOrDefault(
                    cat,
                    orgTitleCase(cat));
            list.add(new CategoryOrgSatisfaction(
                    cat,
                    org,
                    interactions,
                    pos,
                    neg,
                    reliability
            ));
        }
        list.sort(Comparator.comparingLong(CategoryOrgSatisfaction::interactions).reversed());
        return list;
    }

    private List<AuditInteractionRow> buildAuditSample(List<ChatLog> rows) {
        List<AuditInteractionRow> out = new ArrayList<>(Math.min(rows.size(), 80));
        int n = 0;
        for (ChatLog c : rows) {
            if (n++ >= 80) {
                break;
            }
            String fp = fingerprint(c.getSessionId());
            String cat = c.getCategory() == null ? "geral" : c.getCategory();
            String org = CATEGORY_TO_ORG.getOrDefault(cat, orgTitleCase(cat));
            out.add(new AuditInteractionRow(
                    Optional.ofNullable(c.getCreatedAt()).orElse(Instant.now()).toString(),
                    fp,
                    "web",
                    cat,
                    org,
                    "nao_medido",
                    "Ver proveniência em POST /api/v1/chat (campo provenance)."
            ));
        }
        return out;
    }

    private static String fingerprint(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return "anon";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(sessionId.getBytes(StandardCharsets.UTF_8));
            return "sha256:" + HexFormat.of().formatHex(d, 0, 8);
        } catch (Exception e) {
            return "hash_indisponivel";
        }
    }

    private static String orgTitleCase(String cat) {
        if (cat == null || cat.isBlank()) {
            return "GDF";
        }
        return cat.substring(0, 1).toUpperCase(Locale.ROOT) + cat.substring(1);
    }

    private String primaryModelLabel() {
        if (!groqModel.isBlank()) {
            return "Groq: " + groqModel;
        }
        if (!openRouterModel.isBlank()) {
            return "OpenRouter: " + openRouterModel;
        }
        return "não configurado";
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static int percent(long part, long total) {
        if (total == 0L) {
            return 0;
        }
        return (int) Math.round(100.0 * part / total);
    }
}
