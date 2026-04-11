package br.gov.df.guiacidadao.controller;

import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.ChatResponse.*;
import br.gov.df.guiacidadao.repository.ChatFeedbackRepository;
import br.gov.df.guiacidadao.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatService chatService;

    @MockitoBean
    private ChatFeedbackRepository chatFeedbackRepository;

    @Test
    void postChat_returnsStructuredResponse() throws Exception {
        ChatResponse mockResponse = ChatResponse.fromParsed(
                new Tag("tag-health", "HeartPulse", "Saude"),
                "Voce pode ir a UBS.",
                List.of(new Block("MapPin", "Onde ir", "UBS mais proxima", null)),
                List.of("Passo 1", "Passo 2"),
                "Dica", null, List.of("Pergunta?"),
                "sess_1", "gemma", 500
        );
        when(chatService.processMessage(anyString(), anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"preciso de medico\", \"sessionId\": \"sess_1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tag.cls").value("tag-health"))
                .andExpect(jsonPath("$.intro").value("Voce pode ir a UBS."))
                .andExpect(jsonPath("$.blocks[0].title").value("Onde ir"))
                .andExpect(jsonPath("$.steps[0]").value("Passo 1"))
                .andExpect(jsonPath("$.meta.sessionId").value("sess_1"));
    }

    @Test
    void postChat_rejectsEmptyMessage() throws Exception {
        mockMvc.perform(post("/api/v1/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postFeedback_savesAndReturnsOk() throws Exception {
        mockMvc.perform(post("/api/v1/chat/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"responseId\": \"resp_123\", \"sessionId\": \"sess_1\", \"vote\": \"positive\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(true));
    }

    @Test
    void getFeatured_returnsArray() throws Exception {
        mockMvc.perform(get("/api/v1/services/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].icon").exists());
    }

    @Test
    void getHealth_returnsUp() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void getFaq_returnsArray() throws Exception {
        mockMvc.perform(get("/api/v1/faq"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").exists());
    }
}
