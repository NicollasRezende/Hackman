package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.MetricsSummary;
import br.gov.df.guiacidadao.model.MetricsSummary.CategoryCount;
import br.gov.df.guiacidadao.repository.ChatFeedbackRepository;
import br.gov.df.guiacidadao.repository.ChatLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MetricsService {

    private final ChatLogRepository logRepository;
    private final ChatFeedbackRepository feedbackRepository;

    public MetricsService(ChatLogRepository logRepository, ChatFeedbackRepository feedbackRepository) {
        this.logRepository = logRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public MetricsSummary summary() {
        long totalInteractions = logRepository.count();
        long positive = feedbackRepository.countByVote("positive");
        long negative = feedbackRepository.countByVote("negative");
        long totalFeedback = positive + negative;
        double approvalRate = totalFeedback == 0 ? 0.0 : round2((double) positive / totalFeedback);
        double avgMs = round2(logRepository.averageProcessingMs() == null ? 0.0 : logRepository.averageProcessingMs());

        List<Object[]> raw = logRepository.countByCategory();
        List<CategoryCount> categories = new ArrayList<>(raw.size());
        for (Object[] row : raw) {
            String category = row[0] == null ? "desconhecida" : row[0].toString();
            long count = ((Number) row[1]).longValue();
            double share = totalInteractions == 0 ? 0.0 : round2((double) count / totalInteractions);
            categories.add(new CategoryCount(category, count, share));
        }

        Map<String, Object> highlights = new LinkedHashMap<>();
        highlights.put("topCategory", categories.isEmpty() ? null : categories.get(0).category());
        highlights.put("hasFeedbackData", totalFeedback > 0);
        highlights.put("averageLatencyMsRounded", Math.round(avgMs));

        return new MetricsSummary(
                totalInteractions,
                totalFeedback,
                positive,
                negative,
                approvalRate,
                avgMs,
                categories,
                highlights,
                Instant.now().toString()
        );
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
