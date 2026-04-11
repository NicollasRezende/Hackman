package br.gov.df.guiacidadao.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatResponse(
        Tag tag,
        String intro,
        List<Block> blocks,
        List<String> steps,
        String tip,
        Contact contact,
        List<String> related,
        Meta meta
) {
    public record Tag(String cls, String icon, String txt) {}

    public record Block(String icon, String title, String body, List<String> docs) {}

    public record Contact(String title, String addr, String phone, String hours) {}

    public record Meta(
            String sessionId,
            String responseId,
            String model,
            long processingMs,
            String timestamp
    ) {}

    public static ChatResponse fromParsed(
            Tag tag, String intro, List<Block> blocks, List<String> steps,
            String tip, Contact contact, List<String> related,
            String sessionId, String model, long processingMs
    ) {
        Meta meta = new Meta(
                sessionId,
                "resp_" + UUID.randomUUID().toString().substring(0, 8),
                model,
                processingMs,
                Instant.now().toString()
        );
        return new ChatResponse(tag, intro, blocks, steps, tip, contact, related, meta);
    }

    public static ChatResponse fallback(String sessionId, String model) {
        return new ChatResponse(
                new Tag("tag-social", "HelpCircle", "Assistente indisponivel"),
                "Desculpe, nosso assistente esta temporariamente indisponivel. Por favor, tente novamente em alguns instantes.",
                List.of(new Block("Phone", "Precisa de ajuda agora?",
                        "Ligue para a Central do Cidadao: <strong>156</strong> (gratuito, 24 horas).", null)),
                List.of(
                        "Ligue <strong>156</strong> para orientacao sobre qualquer servico do GDF",
                        "Acesse <a href=\"https://www.df.gov.br\" class=\"text-verde font-semibold\">df.gov.br</a> para servicos online"
                ),
                null, null,
                List.of("Como agendar consulta pelo SUS?", "Como solicitar seguro-desemprego?", "Como emitir segunda via do RG?"),
                new Meta(sessionId, "resp_fallback", model, 0, Instant.now().toString())
        );
    }
}
