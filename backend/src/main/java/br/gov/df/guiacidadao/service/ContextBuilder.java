package br.gov.df.guiacidadao.service;

import br.gov.df.guiacidadao.model.dto.*;
import br.gov.df.guiacidadao.model.dto.TcuLicitanteInidoneDTO;
import br.gov.df.guiacidadao.model.dto.TcuCertidaoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class ContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(ContextBuilder.class);

    private final String baseContext;

    private static final String FORMAT_INSTRUCTIONS = """

        ---

        ## INSTRUCOES DE FORMATO — Guia Cidadao IA

        Responda SEMPRE em JSON valido com exatamente estes campos:
        {
          "tag": { "cls": "tag-health|tag-work|tag-social|tag-transit", "icon": "NomeLucideIcon", "txt": "Categoria" },
          "intro": "Paragrafo introdutorio (pode usar <strong> e <a>)",
          "blocks": [
            { "icon": "NomeLucideIcon", "title": "Titulo do bloco", "body": "Texto (ou omita e use docs)", "docs": ["Doc1", "Doc2"] }
          ],
          "steps": ["Passo 1 (pode usar <strong> e <a>)", "Passo 2"],
          "tip": "Dica opcional",
          "contact": { "title": "Nome do orgao", "addr": "Endereco", "phone": "Telefone", "hours": "Horario" },
          "related": ["Pergunta relacionada 1", "Pergunta relacionada 2", "Pergunta relacionada 3"]
        }

        Regras:
        - Use SOMENTE os portais e URLs listados neste contexto. NUNCA invente URLs.
        - blocks: minimo 1, maximo 4. Cada block tem body OU docs, nunca ambos.
        - steps: minimo 2, maximo 6.
        - related: maximo 4 perguntas.
        - tag.cls deve ser um de: tag-health, tag-work, tag-social, tag-transit, tag-tcu.
        - tag.icon deve ser um nome de icone Lucide React valido (ex: HeartPulse, Briefcase, Users, Car, IdCard, ShieldCheck).
        - Responda em portugues brasileiro, tom informal e acolhedor.
        - Se a pergunta estiver fora do escopo de servicos publicos do GDF, retorne tag.cls="tag-social", tag.txt="Fora do escopo" e oriente ligar para 156.
        """;

    public ContextBuilder() {
        this.baseContext = loadBaseContext();
    }

    public String build(Map<String, Object> externalData) {
        StringBuilder ctx = new StringBuilder(baseContext);

        if (!externalData.isEmpty()) {
            ctx.append("\n\n## DADOS EM TEMPO REAL\n\n");
            injectExternalData(ctx, externalData);
        }

        ctx.append(FORMAT_INSTRUCTIONS);
        return ctx.toString();
    }

    @SuppressWarnings("unchecked")
    private void injectExternalData(StringBuilder ctx, Map<String, Object> data) {
        if (data.containsKey("cep")) {
            CepResponse cep = (CepResponse) data.get("cep");
            ctx.append("CEP informado pelo cidadao: ")
                    .append(cep.street() != null ? cep.street() + ", " : "")
                    .append(cep.neighborhood() != null ? cep.neighborhood() + ", " : "")
                    .append(cep.city() != null ? cep.city() : "")
                    .append(cep.state() != null ? "-" + cep.state() : "")
                    .append("\n\n");
        }

        if (data.containsKey("cnpj")) {
            CnpjResponse cnpj = (CnpjResponse) data.get("cnpj");
            ctx.append("Dados da empresa (CNPJ): ")
                    .append(cnpj.razaoSocial())
                    .append(" (").append(cnpj.nomeFantasia()).append(")")
                    .append(" — Situacao: ").append(cnpj.situacao())
                    .append(" — ").append(cnpj.municipio()).append("/").append(cnpj.uf())
                    .append("\n\n");
        }

        if (data.containsKey("ubs")) {
            List<CnesEstabelecimento> ubs = (List<CnesEstabelecimento>) data.get("ubs");
            ctx.append("Unidades Basicas de Saude (UBS) em Brasilia:\n");
            for (CnesEstabelecimento u : ubs) {
                ctx.append("- ").append(u.nomeFantasia());
                if (u.endereco() != null) ctx.append(", ").append(u.endereco());
                if (u.telefone() != null) ctx.append(", Tel: ").append(u.telefone());
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("upa")) {
            List<CnesEstabelecimento> upa = (List<CnesEstabelecimento>) data.get("upa");
            ctx.append("UPAs 24h em Brasilia:\n");
            for (CnesEstabelecimento u : upa) {
                ctx.append("- ").append(u.nomeFantasia());
                if (u.endereco() != null) ctx.append(", ").append(u.endereco());
                if (u.telefone() != null) ctx.append(", Tel: ").append(u.telefone());
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("farmacias")) {
            List<FarmaciaDTO> farmacias = (List<FarmaciaDTO>) data.get("farmacias");
            ctx.append("Farmacias Populares em Brasilia (medicamentos gratuitos):\n");
            for (FarmaciaDTO f : farmacias) {
                ctx.append("- ").append(f.nomeFantasia());
                if (f.endereco() != null) ctx.append(", ").append(f.endereco());
                if (f.bairro() != null) ctx.append(", ").append(f.bairro());
                if (f.telefone() != null) ctx.append(", Tel: ").append(f.telefone());
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("bolsa_familia")) {
            List<BolsaFamiliaDTO> bf = (List<BolsaFamiliaDTO>) data.get("bolsa_familia");
            ctx.append("Dados Bolsa Familia do cidadao:\n");
            for (BolsaFamiliaDTO b : bf) {
                ctx.append("- Mes: ").append(b.mesReferencia())
                        .append(", Valor: R$ ").append(b.valor())
                        .append(" (").append(b.municipio()).append("/").append(b.uf()).append(")")
                        .append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("tcu_inidoneo")) {
            List<TcuLicitanteInidoneDTO> inidoneos = (List<TcuLicitanteInidoneDTO>) data.get("tcu_inidoneo");
            ctx.append("Resultado TCU — Licitantes Inidoneos para o CNPJ consultado:\n");
            if (inidoneos.isEmpty()) {
                ctx.append("- CNPJ NAO consta na lista de licitantes inidoneos do TCU.\n");
            } else {
                for (TcuLicitanteInidoneDTO li : inidoneos) {
                    ctx.append("- ").append(li.nome())
                            .append(" (").append(li.cpfCnpj()).append(")")
                            .append(" — Deliberacao: ").append(li.deliberacao())
                            .append(", Processo: ").append(li.processo())
                            .append(", Periodo: ").append(li.dataInicio()).append(" a ").append(li.dataFinal())
                            .append("\n");
                }
            }
            ctx.append("\n");
        }

        if (data.containsKey("tcu_certidao")) {
            TcuCertidaoDTO certidao = (TcuCertidaoDTO) data.get("tcu_certidao");
            ctx.append("Resultado TCU — Certidao de Contas:\n")
                    .append("- CPF/CNPJ: ").append(certidao.cpfCnpj()).append("\n")
                    .append("- Situacao: ").append(certidao.situacao()).append("\n")
                    .append("- Possui contas julgadas: ").append(certidao.possuiContas() ? "Sim" : "Nao").append("\n")
                    .append("- Irregularidades: ").append(certidao.possuiIrregularidades() ? "Sim" : "Nao").append("\n");
            if (certidao.mensagem() != null) {
                ctx.append("- Mensagem: ").append(certidao.mensagem()).append("\n");
            }
            ctx.append("\n");
        }

        if (data.containsKey("tcu_inidoneos_lista")) {
            List<TcuLicitanteInidoneDTO> lista = (List<TcuLicitanteInidoneDTO>) data.get("tcu_inidoneos_lista");
            ctx.append("Lista de Licitantes Inidoneos do TCU (amostra recente):\n");
            int limit = Math.min(lista.size(), 10);
            for (int i = 0; i < limit; i++) {
                TcuLicitanteInidoneDTO li = lista.get(i);
                ctx.append("- ").append(li.nome())
                        .append(" (").append(li.cpfCnpj()).append(")")
                        .append(" — Processo: ").append(li.processo())
                        .append(", Periodo: ").append(li.dataInicio()).append(" a ").append(li.dataFinal())
                        .append("\n");
            }
            if (lista.size() > 10) {
                ctx.append("- ... e mais ").append(lista.size() - 10).append(" registros.\n");
            }
            ctx.append("\n");
        }
    }

    private String loadBaseContext() {
        try (InputStream is = getClass().getResourceAsStream("/ai-context.md")) {
            if (is != null) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            log.error("Erro ao carregar ai-context.md: {}", e.getMessage());
        }
        log.warn("ai-context.md nao encontrado, usando contexto minimo");
        return "Voce e o Guia Cidadao IA, assistente de servicos publicos do GDF (Governo do Distrito Federal). Oriente cidadaos sobre servicos publicos em Brasilia.";
    }
}
