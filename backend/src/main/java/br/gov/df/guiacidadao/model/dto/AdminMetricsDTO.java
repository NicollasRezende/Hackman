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
        List<TopMessage> topMessages
) {
    public record CategoryCount(String category, long count) {}
    public record TimelineCount(String period, long count) {}
    public record TopMessage(String message, long count) {}
}
