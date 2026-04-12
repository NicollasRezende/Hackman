package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse.Official;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;

@Service
public class OfficialLinkResolver {

    private static final Official DEFAULT = new Official(
            "Portal do GDF",
            "https://www.df.gov.br",
            "GDF"
    );

    private record Rule(List<String> keywords, Official target) {}

    private static final Map<String, Official> BY_CATEGORY = Map.ofEntries(
            Map.entry("saude", new Official(
                    "Agendar pelo SES-DF",
                    "https://www.saude.df.gov.br/agendamento-de-consultas-e-exames",
                    "SES-DF"
            )),
            Map.entry("trabalho", new Official(
                    "SINE-DF / Trabalhador",
                    "https://www.trabalho.df.gov.br/sine-df",
                    "SEDET-DF"
            )),
            Map.entry("social", new Official(
                    "CadÚnico e Assistência Social",
                    "https://www.desenvolvimentosocial.df.gov.br/cadastro-unico",
                    "SEDES-DF"
            )),
            Map.entry("bolsa_familia", new Official(
                    "Bolsa Família — Consulta e Regras",
                    "https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia",
                    "MDS"
            )),
            Map.entry("previdencia", new Official(
                    "Meu INSS — Serviços",
                    "https://meu.inss.gov.br/central/#/",
                    "INSS"
            )),
            Map.entry("transito", new Official(
                    "DETRAN-DF — Serviços",
                    "https://www.detran.df.gov.br/servicos",
                    "DETRAN-DF"
            )),
            Map.entry("documentos", new Official(
                    "Na Hora — Agendamento Online",
                    "https://www.nahora.df.gov.br/agendamento",
                    "Na Hora / GDF"
            )),
            Map.entry("mulher", new Official(
                    "Secretaria da Mulher do DF",
                    "https://www.mulher.df.gov.br/servicos",
                    "SEMulher-DF"
            )),
            Map.entry("tcu", new Official(
                    "Portal do TCU — Cidadão",
                    "https://portal.tcu.gov.br/inicio",
                    "TCU"
            )),
            Map.entry("transparencia", new Official(
                    "Portal da Transparência do DF",
                    "https://www.transparencia.df.gov.br",
                    "GDF"
            ))
    );

    /** Sub-rotas específicas por palavra-chave, avaliadas ANTES do fallback da categoria. */
    private static final Map<String, List<Rule>> SUBROUTES = Map.of(
            "saude", List.of(
                    new Rule(List.of("ubs", "posto de saude", "unidade basica", "consulta", "agendar consulta", "agendamento"),
                            new Official("Agendar consulta SES-DF", "https://www.saude.df.gov.br/agendamento-de-consultas-e-exames", "SES-DF")),
                    new Rule(List.of("vacina", "vacinacao", "imunizacao"),
                            new Official("Vacinação SES-DF", "https://www.saude.df.gov.br/vacinacao", "SES-DF")),
                    new Rule(List.of("medicamento", "remedio", "farmacia popular"),
                            new Official("Farmácia de Alto Custo SES-DF", "https://www.saude.df.gov.br/farmacia-de-alto-custo", "SES-DF"))
            ),
            "trabalho", List.of(
                    new Rule(List.of("seguro desemprego", "seguro-desemprego", "fui demitido", "demitido"),
                            new Official("Seguro-Desemprego — gov.br", "https://www.gov.br/pt-br/servicos/solicitar-o-seguro-desemprego", "Min. Trabalho")),
                    new Rule(List.of("vaga", "emprego", "trabalho", "cv", "curriculo"),
                            new Official("Vagas SINE-DF", "https://www.trabalho.df.gov.br/sine-df", "SEDET-DF")),
                    new Rule(List.of("qualificacao", "curso", "capacitacao"),
                            new Official("Qualificação Profissional SEDET", "https://www.trabalho.df.gov.br/qualificacao-profissional", "SEDET-DF"))
            ),
            "documentos", List.of(
                    new Rule(List.of("rg", "cin", "carteira de identidade", "identidade"),
                            new Official("Agendar RG/CIN — Na Hora", "https://www.nahora.df.gov.br/agendamento/rg", "Na Hora / GDF")),
                    new Rule(List.of("cpf"),
                            new Official("CPF — Receita Federal", "https://www.gov.br/receitafederal/pt-br/servicos/cadastro/cpf", "Receita Federal")),
                    new Rule(List.of("passaporte"),
                            new Official("Passaporte — Polícia Federal", "https://www.gov.br/pf/pt-br/servicos/passaporte", "Polícia Federal")),
                    new Rule(List.of("titulo de eleitor", "eleitor"),
                            new Official("Título de Eleitor — TSE", "https://www.tse.jus.br/eleitor/titulo-eleitoral", "TSE"))
            ),
            "transito", List.of(
                    new Rule(List.of("cnh", "habilitacao", "carteira de motorista"),
                            new Official("CNH — DETRAN-DF", "https://www.detran.df.gov.br/habilitacao", "DETRAN-DF")),
                    new Rule(List.of("multa", "infracao", "recurso"),
                            new Official("Multas e Recursos — DETRAN-DF", "https://www.detran.df.gov.br/multas-e-infracoes", "DETRAN-DF")),
                    new Rule(List.of("licenciamento", "ipva", "veiculo"),
                            new Official("Veículos — DETRAN-DF", "https://www.detran.df.gov.br/veiculos", "DETRAN-DF"))
            ),
            "previdencia", List.of(
                    new Rule(List.of("aposentadoria", "aposentar"),
                            new Official("Pedir aposentadoria — Meu INSS", "https://www.gov.br/pt-br/servicos/pedir-aposentadoria", "INSS")),
                    new Rule(List.of("beneficio", "auxilio", "bpc", "loas"),
                            new Official("BPC / LOAS — gov.br", "https://www.gov.br/pt-br/servicos/pedir-beneficio-assistencial-a-pessoa-com-deficiencia-bpc", "INSS / MDS")),
                    new Rule(List.of("extrato", "cnis", "contribuicao"),
                            new Official("Extrato CNIS — Meu INSS", "https://meu.inss.gov.br/central/#/extrato", "INSS"))
            ),
            "social", List.of(
                    new Rule(List.of("cadunico", "cadastro unico"),
                            new Official("CadÚnico — SEDES-DF", "https://www.desenvolvimentosocial.df.gov.br/cadastro-unico", "SEDES-DF")),
                    new Rule(List.of("bolsa familia"),
                            new Official("Bolsa Família — MDS", "https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia", "MDS"))
            ),
            "mulher", List.of(
                    new Rule(List.of("maria da penha", "violencia", "denuncia"),
                            new Official("Denunciar — Ligue 180", "https://www.gov.br/mdh/pt-br/ligue180", "MDH")),
                    new Rule(List.of("abrigo", "acolhimento"),
                            new Official("Casa da Mulher Brasileira — DF", "https://www.mulher.df.gov.br/casa-da-mulher-brasileira", "SEMulher-DF"))
            )
    );

    public Official resolve(String category) {
        return resolve(category, null);
    }

    public Official resolve(String category, String message) {
        if (category == null) return DEFAULT;
        if (message != null && !message.isBlank()) {
            String normalized = normalize(message);
            List<Rule> rules = SUBROUTES.get(category);
            if (rules != null) {
                for (Rule r : rules) {
                    for (String kw : r.keywords()) {
                        if (normalized.contains(kw)) {
                            return r.target();
                        }
                    }
                }
            }
        }
        return BY_CATEGORY.getOrDefault(category, DEFAULT);
    }

    private static String normalize(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return n.toLowerCase();
    }
}
