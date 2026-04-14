package br.gov.df.guiacidadao.model.dto;

import java.util.List;

public record AdminMetricsDTO(
        long totalMessages,
        long uniqueSessions,
        long avgProcessingMs,
        long feedbackTotal,
        long feedbackPositive,
        long feedbackNegative,
        List<CategoryCount> categoryCounts,
        List<TimelineCount> timelineCounts,
        List<TopMessage> topMessages,
        FiscalImpact fiscalImpact,
        List<CategoryOrgSatisfaction> orgRankingByDomain,
        List<AuditInteractionRow> auditInteractionSample,
        TransparencyBundle transparency,
        List<RegionalDemandRow> regionalDemand,
        List<ChannelShareRow> channelAccess,
        List<String> aiControlNotes,
        List<String> stalenessAlerts
) {

    public record CategoryCount(String category, long count) {}

    public record TimelineCount(String period, long count) {}

    public record TopMessage(String message, long count) {}

    public record FiscalImpact(
            long digitalInteractions,
            double costPerVisitMinReais,
            double costPerVisitMaxReais,
            double savingsEstimateMinReais,
            double savingsEstimateMaxReais,
            double annualizedSavingsMinReais,
            double annualizedSavingsMaxReais,
            int dataSpanDays,
            Double roiMin,
            Double roiMax,
            double systemInvestmentReais,
            String methodologyNote
    ) {}

    public record CategoryOrgSatisfaction(
            String category,
            String orgLabel,
            long interactions,
            long feedbackPositive,
            long feedbackNegative,
            Double reliabilityIndexPercent
    ) {}

    public record AuditInteractionRow(
            String instantIso,
            String sessionFingerprint,
            String channel,
            String intentCategory,
            String indicatedOrg,
            String resolutionLabel,
            String legalSourceNote
    ) {}

    public record TransparencyBundle(
            String primaryModelLabel,
            String fallbackModelLabel,
            String releaseVersion,
            String exportCsvPath,
            String publicTransparencyJsonPath,
            String publicSummaryJsonPath
    ) {}

    public record RegionalDemandRow(
            String administrativeRegion,
            long interactions,
            double sharePercent
    ) {}

    public record ChannelShareRow(
            String channel,
            long interactions,
            double sharePercent,
            String note
    ) {}
}
