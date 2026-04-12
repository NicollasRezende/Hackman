package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.entity.ChatLog;
import br.gov.df.guiacidadao.model.ChatResponse;
import br.gov.df.guiacidadao.model.DetectedIntent;
import br.gov.df.guiacidadao.repository.ChatLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import br.gov.df.guiacidadao.model.ChatResponse.Provenance;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final IntentDetector intentDetector;
    private final ExternalDataAggregator aggregator;
    private final ContextBuilder contextBuilder;
    private final OpenRouterService openRouter;
    private final ResponseParser responseParser;
    private final ChatLogRepository chatLogRepository;
    private final OfficialLinkResolver officialLinkResolver;

    public ChatService(
            IntentDetector intentDetector,
            ExternalDataAggregator aggregator,
            ContextBuilder contextBuilder,
            OpenRouterService openRouter,
            ResponseParser responseParser,
            ChatLogRepository chatLogRepository,
            OfficialLinkResolver officialLinkResolver
    ) {
        this.intentDetector = intentDetector;
        this.aggregator = aggregator;
        this.contextBuilder = contextBuilder;
        this.openRouter = openRouter;
        this.responseParser = responseParser;
        this.chatLogRepository = chatLogRepository;
        this.officialLinkResolver = officialLinkResolver;
    }

    public ChatResponse processMessage(String message, String sessionId) {
        long start = System.currentTimeMillis();
        String model = openRouter.getModel();

        if (!openRouter.isConfigured()) {
            log.error("OpenRouter nao configurado — retornando fallback");
            return ChatResponse.fallback(sessionId, model, "OPENROUTER_API_KEY ausente no backend");
        }

        try {
            DetectedIntent intent = intentDetector.detect(message);
            log.debug("Intent detectado: categoria={}, cep={}, cnpj={}, nis={}",
                    intent.category(), intent.cep(), intent.cnpj(), intent.nis());

            Map<String, Object> externalData = new HashMap<>(aggregator.aggregate(intent));
            externalData.put("intent_category", intent.category());
            log.debug("Dados externos coletados: {} fontes", externalData.size());

            String systemPrompt = contextBuilder.build(externalData);

            String llmJson = callWithRetry(systemPrompt, message);

            long processingMs = System.currentTimeMillis() - start;
            ChatResponse response = responseParser.parse(llmJson, sessionId, model, processingMs, intent.category())
                    .withOfficial(officialLinkResolver.resolve(intent.category(), message))
                    .withProvenance(buildProvenance(intent.category()));

            saveLog(sessionId, message, response.meta().responseId(), intent.category(), processingMs);

            return response;

        } catch (Exception e) {
            long processingMs = System.currentTimeMillis() - start;
            log.error("Erro no processamento da mensagem: {}", e.getMessage(), e);
            saveLog(sessionId, message, "resp_error", "error", processingMs);
            String detail = e.getMessage();
            if (e.getCause() != null && detail != null && !detail.contains(e.getCause().getClass().getSimpleName())) {
                detail = detail + " | causa: " + e.getCause().getMessage();
            }
            return ChatResponse.fallback(sessionId, model, detail);
        }
    }

    private String callWithRetry(String systemPrompt, String userMessage) {
        try {
            return openRouter.complete(systemPrompt, userMessage);
        } catch (Exception e) {
            log.warn("Primeira tentativa LLM falhou, retentando em 2s: {}", e.getMessage());
            try {
                Thread.sleep(2000);
                return openRouter.complete(systemPrompt, userMessage);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.error("Thread interrompida durante retry LLM");
                throw new RuntimeException("Thread interrompida durante retry LLM", ie);
            } catch (Exception e2) {
                log.error("Segunda tentativa LLM falhou: {}", e2.getMessage());
                throw e2;
            }
        }
    }

    private Provenance buildProvenance(String category) {
        String today = LocalDate.now().toString();
        if (category == null) {
            return new Provenance("Portal GDF", today, "https://www.df.gov.br");
        }
        return switch (category) {
            case "saude" -> new Provenance(
                    "CNES / SES-DF",
                    today,
                    "https://cnes.datasus.gov.br"
            );
            case "trabalho" -> new Provenance(
                    "SINE-DF / SEDET-DF",
                    today,
                    "https://www.trabalho.df.gov.br"
            );
            case "previdencia" -> new Provenance(
                    "INSS / Meu INSS",
                    today,
                    "https://meu.inss.gov.br"
            );
            case "transito" -> new Provenance(
                    "DETRAN-DF",
                    today,
                    "https://www.detran.df.gov.br"
            );
            case "documentos" -> new Provenance(
                    "Rede Na Hora / GDF",
                    today,
                    "https://www.nahora.df.gov.br"
            );
            case "social", "bolsa_familia" -> new Provenance(
                    "MDS / Portal da Transparência",
                    today,
                    "https://www.gov.br/mds"
            );
            case "mulher" -> new Provenance(
                    "SEMulher-DF",
                    today,
                    "https://www.mulher.df.gov.br"
            );
            case "tcu" -> new Provenance(
                    "TCU",
                    today,
                    "https://portal.tcu.gov.br"
            );
            case "transparencia" -> new Provenance(
                    "Portal da Transparência do DF",
                    today,
                    "https://www.transparencia.df.gov.br"
            );
            default -> new Provenance("Portal GDF", today, "https://www.df.gov.br");
        };
    }

    private void saveLog(String sessionId, String message, String responseId, String category, long processingMs) {
        try {
            chatLogRepository.save(new ChatLog(sessionId, message, responseId, category, processingMs));
        } catch (Exception e) {
            log.warn("Falha ao salvar log: {}", e.getMessage());
        }
    }
}
