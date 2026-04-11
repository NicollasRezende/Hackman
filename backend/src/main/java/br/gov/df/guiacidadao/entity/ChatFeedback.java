package br.gov.df.guiacidadao.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_feedback")
public class ChatFeedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "response_id", length = 50)
    private String responseId;

    @Column(name = "session_id", length = 50)
    private String sessionId;

    @Column(length = 10)
    private String vote;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ChatFeedback() {}

    public ChatFeedback(String responseId, String sessionId, String vote) {
        this.responseId = responseId;
        this.sessionId = sessionId;
        this.vote = vote;
    }

    public Long getId() { return id; }
    public String getResponseId() { return responseId; }
    public String getSessionId() { return sessionId; }
    public String getVote() { return vote; }
    public Instant getCreatedAt() { return createdAt; }
}
