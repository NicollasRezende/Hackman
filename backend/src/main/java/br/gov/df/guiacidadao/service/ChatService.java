package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.entity.ChatLog;
import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.DetectedIntent;
import br.gov.df.guiacidadao.repository.ChatLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final IntentDetector intentDetector;
    private final ExternalDataAggregator aggregator;
    private final ContextBuilder contextBuilder;
    private final GroqService groq;
    private final OpenRouterService openRouter;
    private final ResponseParser responseParser;
    private final ChatLogRepository chatLogRepository;
    private final OfficialLinkResolver officialLinkResolver;

    public ChatService(
            IntentDetector intentDetector,
            ExternalDataAggregator aggregator,
            ContextBuilder contextBuilder,
            GroqService groq,
            OpenRouterService openRouter,
            ResponseParser responseParser,
            ChatLogRepository chatLogRepository,
            OfficialLinkResolver officialLinkResolver
    ) {
        this.intentDetector = intentDetector;
        this.aggregator = aggregator;
        this.contextBuilder = contextBuilder;
        this.groq = groq;
        this.openRouter = openRouter;
        this.responseParser = responseParser;
        this.chatLogRepository = chatLogRepository;
        this.officialLinkResolver = officialLinkResolver;
    }

    public ChatResponse processMessage(String message, String sessionId) {
        long start = System.currentTimeMillis();

        boolean groqAvailable = groq.isConfigured();
        boolean routerAvailable = openRouter.isConfigured();

        if (!groqAvailable && !routerAvailable) {
            log.error("Nenhum provider LLM configurado — retornando fallback");
            return ChatResponse.fallback(sessionId, "none", "Nenhum provider LLM configurado (GROQ_API_KEY e OPENROUTER_API_KEY ausentes)");
        }

        try {
            DetectedIntent intent = intentDetector.detect(message);
            log.debug("Intent detectado: categoria={}, cep={}, cnpj={}, nis={}",
                    intent.category(), intent.cep(), intent.cnpj(), intent.nis());

            Map<String, Object> externalData = new HashMap<>(aggregator.aggregate(intent));
            externalData.put("intent_category", intent.category());
            log.debug("Dados externos coletados: {} fontes", externalData.size());

            String systemPrompt = contextBuilder.build(externalData);

            LlmResult result = callWithFallback(systemPrompt, message, groqAvailable, routerAvailable);

            long processingMs = System.currentTimeMillis() - start;
            ChatResponse response = responseParser.parse(result.content(), sessionId, result.model(), processingMs)
                    .withOfficial(officialLinkResolver.resolve(intent.category()));

            saveLog(sessionId, message, response.meta().responseId(), intent.category(), processingMs);

            return response;

        } catch (Exception e) {
            long processingMs = System.currentTimeMillis() - start;
            log.error("Erro no processamento da mensagem: {}", e.getMessage(), e);
            saveLog(sessionId, message, "resp_error", "error", processingMs);
            String model = groqAvailable ? groq.getModel() : openRouter.getModel();
            String detail = e.getMessage();
            if (e.getCause() != null && detail != null && !detail.contains(e.getCause().getClass().getSimpleName())) {
                detail = detail + " | causa: " + e.getCause().getMessage();
            }
            return ChatResponse.fallback(sessionId, model, detail);
        }
    }

    private record LlmResult(String content, String model) {}

    private LlmResult callWithFallback(String systemPrompt, String userMessage,
                                        boolean groqAvailable, boolean routerAvailable) {
        // 1. Groq (principal — com web search via compound)
        if (groqAvailable) {
            try {
                log.info("Chamando Groq (principal) modelo={}", groq.getModel());
                String result = groq.complete(systemPrompt, userMessage);
                return new LlmResult(result, groq.getModel());
            } catch (Exception e) {
                log.warn("Groq falhou: {}. Tentando fallback OpenRouter...", e.getMessage());
            }
        }

        // 2. Fallback: OpenRouter
        if (routerAvailable) {
            try {
                log.info("Chamando OpenRouter (fallback) modelo={}", openRouter.getModel());
                String result = openRouter.complete(systemPrompt, userMessage);
                return new LlmResult(result, openRouter.getModel());
            } catch (Exception e) {
                log.error("OpenRouter (fallback) tambem falhou: {}", e.getMessage());
                throw e;
            }
        }

        throw new RuntimeException("Todos os providers LLM falharam");
    }

    private void saveLog(String sessionId, String message, String responseId, String category, long processingMs) {
        try {
            chatLogRepository.save(new ChatLog(sessionId, message, responseId, category, processingMs));
        } catch (Exception e) {
            log.warn("Falha ao salvar log: {}", e.getMessage());
        }
    }
}
