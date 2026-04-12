package br.gov.df.guiacidadao.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MetricsSummary(
        long totalInteractions,
        long totalFeedback,
        long positiveFeedback,
        long negativeFeedback,
        double approvalRate,
        double averageProcessingMs,
        List<CategoryCount> categories,
        Map<String, Object> highlights,
        String generatedAt
) {
    public record CategoryCount(String category, long count, double share) {}
}
