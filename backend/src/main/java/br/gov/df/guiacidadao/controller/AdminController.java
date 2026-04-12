package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO;
import br.gov.df.guiacidadao.model.dto.AdminMetricsDTO.*;
import br.gov.df.guiacidadao.repository.ChatFeedbackRepository;
import br.gov.df.guiacidadao.repository.ChatLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ChatLogRepository chatLogRepo;
    private final ChatFeedbackRepository feedbackRepo;

    public AdminController(ChatLogRepository chatLogRepo, ChatFeedbackRepository feedbackRepo) {
        this.chatLogRepo = chatLogRepo;
        this.feedbackRepo = feedbackRepo;
    }

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> metrics() {
        long totalMessages = chatLogRepo.count();
        long uniqueSessions = chatLogRepo.countUniqueSessions();
        long avgMs = Math.round(chatLogRepo.avgProcessingMs());

        long positive = feedbackRepo.countByVote("positive");
        long negative = feedbackRepo.countByVote("negative");
        long feedbackTotal = positive + negative;

        List<CategoryCount> categoryCounts = chatLogRepo.countByCategory().stream()
                .map(row -> new CategoryCount((String) row[0], (Long) row[1]))
                .toList();

        List<TimelineCount> timelineCounts = chatLogRepo.countByHour().stream()
                .map(row -> new TimelineCount((String) row[0], (Long) row[1]))
                .toList();

        List<TopMessage> topMessages = chatLogRepo.topMessages().stream()
                .limit(10)
                .map(row -> new TopMessage((String) row[0], (Long) row[1]))
                .toList();

        return ResponseEntity.ok(new AdminMetricsDTO(
                totalMessages, uniqueSessions, avgMs,
                feedbackTotal, positive, negative,
                categoryCounts, timelineCounts, topMessages
        ));
    }
}
