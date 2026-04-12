package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.ChatResponse.Official;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OfficialLinkResolver {

    private static final Official DEFAULT = new Official(
            "Portal do GDF",
            "https://www.df.gov.br",
            "GDF"
    );

    private static final Map<String, Official> BY_CATEGORY = Map.ofEntries(
            Map.entry("saude", new Official(
                    "Agendar pelo SES-DF",
                    "https://www.saude.df.gov.br",
                    "SES-DF"
            )),
            Map.entry("trabalho", new Official(
                    "SINE-DF / Trabalhador",
                    "https://www.trabalho.df.gov.br",
                    "SEDET-DF"
            )),
            Map.entry("social", new Official(
                    "CadÚnico e Assistência Social",
                    "https://www.desenvolvimentosocial.df.gov.br",
                    "SEDES-DF"
            )),
            Map.entry("bolsa_familia", new Official(
                    "Bolsa Família — Consulta e Regras",
                    "https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia",
                    "MDS"
            )),
            Map.entry("previdencia", new Official(
                    "Meu INSS",
                    "https://meu.inss.gov.br",
                    "INSS"
            )),
            Map.entry("transito", new Official(
                    "DETRAN-DF",
                    "https://www.detran.df.gov.br",
                    "DETRAN-DF"
            )),
            Map.entry("documentos", new Official(
                    "Na Hora — Agendamento",
                    "https://www.nahora.df.gov.br",
                    "Na Hora / GDF"
            )),
            Map.entry("mulher", new Official(
                    "Secretaria da Mulher do DF",
                    "https://www.mulher.df.gov.br",
                    "SEMulher-DF"
            )),
            Map.entry("tcu", new Official(
                    "Portal do TCU",
                    "https://portal.tcu.gov.br",
                    "TCU"
            )),
            Map.entry("transparencia", new Official(
                    "Portal da Transparência do DF",
                    "https://www.transparencia.df.gov.br",
                    "GDF"
            ))
    );

    public Official resolve(String category) {
        if (category == null) return DEFAULT;
        return BY_CATEGORY.getOrDefault(category, DEFAULT);
    }
}
