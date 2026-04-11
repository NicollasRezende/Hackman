package br.gov.df.guiacidadao.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_log")
public class ChatLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", length = 50)
    private String sessionId;

    @Column(length = 500)
    private String message;

    @Column(name = "response_id", length = 50)
    private String responseId;

    @Column(length = 30)
    private String category;

    @Column(name = "processing_ms")
    private Long processingMs;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ChatLog() {}

    public ChatLog(String sessionId, String message, String responseId, String category, Long processingMs) {
        this.sessionId = sessionId;
        this.message = message;
        this.responseId = responseId;
        this.category = category;
        this.processingMs = processingMs;
    }

    public Long getId() { return id; }
    public String getSessionId() { return sessionId; }
    public String getMessage() { return message; }
    public String getResponseId() { return responseId; }
    public String getCategory() { return category; }
    public Long getProcessingMs() { return processingMs; }
    public Instant getCreatedAt() { return createdAt; }
}
