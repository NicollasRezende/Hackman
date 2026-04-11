package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.entity.ChatFeedback;
import br.gov.df.guiacidadao.model.ChatRequest;
import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.FeedbackRequest;
import br.gov.df.guiacidadao.repository.ChatFeedbackRepository;
import br.gov.df.guiacidadao.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatFeedbackRepository feedbackRepository;

    public ChatController(ChatService chatService, ChatFeedbackRepository feedbackRepository) {
        this.chatService = chatService;
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.processMessage(request.message(), request.sessionId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Boolean>> feedback(@Valid @RequestBody FeedbackRequest request) {
        feedbackRepository.save(new ChatFeedback(request.responseId(), request.sessionId(), request.vote()));
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
