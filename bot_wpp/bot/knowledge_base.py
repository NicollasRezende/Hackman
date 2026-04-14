"""
Base de conhecimento mockada do Guia Cidadão IA
Baseada no ai-context.md - respostas profissionais e completas
"""
from typing import Dict, Any, Optional, List


class KnowledgeBase:
    """Base de conhecimento estruturada por categorias"""

    @staticmethod
    def get_response(query: str) -> Optional[Dict[str, Any]]:
        """
        Retorna resposta estruturada baseada na query
        Simula o comportamento do backend com respostas profissionais
        """
        query_lower = query.lower()

        # TRABALHO E EMPREGO
        if any(word in query_lower for word in ["emprego", "trabalho", "desemprego", "demiti", "sine", "vaga", "ctps"]):
            if "seguro" in query_lower or "desemprego" in query_lower:
                return KnowledgeBase._seguro_desemprego()
            elif "vaga" in query_lower or "emprego" in query_lower:
                return KnowledgeBase._vagas_emprego()
            else:
                return KnowledgeBase._trabalho_geral()

        # SAÚDE
        elif any(word in query_lower for word in ["saude", "medico", "hospital", "upa", "ubs", "sus", "consulta"]):
            if "upa" in query_lower or "hospital" in query_lower or "emergencia" in query_lower:
                return KnowledgeBase._upa_hospital()
            elif "consulta" in query_lower or "agendar" in query_lower:
                return KnowledgeBase._agendar_consulta()
            elif "remedio" in query_lower or "farmacia" in query_lower:
                return KnowledgeBase._farmacia()
            else:
                return KnowledgeBase._saude_geral()

        # DOCUMENTOS
        elif any(word in query_lower for word in ["rg", "identidade", "cpf", "documento", "certidao", "segunda via"]):
            if "rg" in query_lower or "identidade" in query_lower:
                return KnowledgeBase._rg()
            elif "cpf" in query_lower:
                return KnowledgeBase._cpf()
            elif "certidao" in query_lower:
                return KnowledgeBase._certidao()
            else:
                return KnowledgeBase._documentos_geral()

        # ASSISTÊNCIA SOCIAL
        elif any(word in query_lower for word in ["bolsa familia", "cadunico", "cras", "bpc", "assistencia"]):
            return KnowledgeBase._bolsa_familia()

        # TRÂNSITO
        elif any(word in query_lower for word in ["cnh", "habilitacao", "carteira motorista", "detran", "multa"]):
            return KnowledgeBase._cnh()

        # PREVIDÊNCIA
        elif any(word in query_lower for word in ["aposentadoria", "aposentar", "inss", "previdencia"]):
            return KnowledgeBase._aposentadoria()

        # VIOLÊNCIA CONTRA MULHER
        elif any(word in query_lower for word in ["violencia", "maria da penha", "deam", "apanho", "agred", "bate"]):
            return KnowledgeBase._violencia_mulher()

        # FALLBACK
        else:
            return KnowledgeBase._orientacao_geral()

    # ========================================================================
    # TRABALHO E EMPREGO
    # ========================================================================

    @staticmethod
    def _seguro_desemprego() -> Dict[str, Any]:
        return {
            "title": "Seguro-Desemprego",
            "category": "Trabalho e Emprego",
            "content": """Você tem direito ao seguro-desemprego se foi dispensado sem justa causa e trabalhou com carteira assinada pelo período mínimo exigido.

**Como solicitar:**
1. Acesse o portal Emprega Brasil (gov.br) ou use o app Carteira de Trabalho Digital
2. Tenha em mãos: número do PIS, documentos pessoais e Termo de Rescisão
3. O prazo para solicitar é de 7 a 120 dias após a demissão

**Documentos necessários:**
- RG e CPF
- Carteira de Trabalho (física ou digital)
- Termo de Rescisão do Contrato de Trabalho
- Extrato do FGTS (se houver)

**Agendamento presencial:**
Se preferir atendimento presencial, agende no SINE através do portal Agenda DF.""",
            "contact": {
                "org": "SEDET-DF / SINE",
                "phone": "158",
                "hours": "Segunda a sexta, 7h às 17h"
            },
            "links": [
                {"label": "Emprega Brasil", "url": "https://www.gov.br/empregabrasil"},
                {"label": "Agendamento SINE", "url": "https://agenda.df.gov.br/posto.html?servico=67348"},
                {"label": "Portal SEDET", "url": "https://www.sedet.df.gov.br/seguro-desemprego-2"}
            ],
            "locations": ["SINE Venâncio 2000", "SINE Taguatinga", "SINE Ceilândia", "Postos Na Hora"]
        }

    @staticmethod
    def _vagas_emprego() -> Dict[str, Any]:
        return {
            "title": "Vagas de Emprego - SINE/DF",
            "category": "Trabalho e Emprego",
            "content": """O SINE (Sistema Nacional de Emprego) oferece intermediação gratuita entre trabalhadores e empresas.

**Como se cadastrar:**
1. Compareça a uma Agência do Trabalhador (SINE) com RG, CPF e Carteira de Trabalho
2. Cadastre seu currículo no sistema
3. Consulte vagas disponíveis pelo telefone 158 ou presencialmente

**Agências do Trabalhador:**
- SINE Venâncio 2000 (Brasília)
- SINE Taguatinga
- SINE Ceilândia

Horário: Segunda a sexta, 7h às 17h

**Qualificação profissional:**
O SINE também oferece cursos gratuitos em parceria com SENAI, SENAC e PRONATEC.""",
            "contact": {
                "org": "SEDET-DF / SINE",
                "phone": "158",
                "hours": "Segunda a sexta, 7h às 17h"
            },
            "links": [
                {"label": "Portal SEDET", "url": "https://www.sedet.df.gov.br"},
                {"label": "Agendamento", "url": "https://agenda.df.gov.br"}
            ],
            "locations": ["SINE Venâncio 2000", "SINE Taguatinga", "SINE Ceilândia"]
        }

    @staticmethod
    def _trabalho_geral() -> Dict[str, Any]:
        return {
            "title": "Trabalho e Emprego",
            "category": "Trabalho e Emprego",
            "content": """A Secretaria de Desenvolvimento Econômico, Trabalho e Renda (SEDET-DF) oferece diversos serviços relacionados a trabalho e emprego.

**Principais serviços:**
- Cadastro de currículo e busca de vagas (SINE)
- Seguro-desemprego
- Carteira de Trabalho Digital (CTPS)
- Cursos de qualificação profissional gratuitos

**Carteira de Trabalho Digital:**
A CTPS física não é mais emitida. Use o app "CTPS Digital" (Android/iOS) ou acesse o portal gov.br.""",
            "contact": {
                "org": "SEDET-DF",
                "phone": "158",
                "hours": "Segunda a sexta, 7h às 17h"
            },
            "links": [
                {"label": "Portal SEDET", "url": "https://www.sedet.df.gov.br"},
                {"label": "Carteira de Trabalho Digital", "url": "https://sedet.df.gov.br/carteira-de-trabalho"}
            ]
        }

    # ========================================================================
    # SAÚDE
    # ========================================================================

    @staticmethod
    def _upa_hospital() -> Dict[str, Any]:
        return {
            "title": "UPA e Hospitais - Atendimento de Urgência",
            "category": "Saúde",
            "content": """As UPAs (Unidades de Pronto Atendimento) funcionam 24 horas e atendem casos de urgência e emergência sem necessidade de agendamento.

**Emergências graves:**
- SAMU: ligue 192 para ambulância
- Corpo de Bombeiros: 193

**UPAs no DF:**
As UPAs estão espalhadas por todas as regiões administrativas do DF e funcionam 24 horas, incluindo fins de semana e feriados.

**O que levar:**
- RG ou CNH
- Cartão SUS (se tiver)
- Não é necessário agendamento

**Para consultas programadas:**
Procure a Unidade Básica de Saúde (UBS) mais próxima da sua residência.""",
            "contact": {
                "org": "SES-DF / SAMU",
                "phone": "192",
                "hours": "24 horas"
            },
            "links": [
                {"label": "Portal Saúde DF", "url": "https://www.saude.df.gov.br"},
                {"label": "Atendimento", "url": "https://www.saude.df.gov.br/atendimento-2"}
            ],
            "locations": ["UPAs 24h em todas as regiões do DF"]
        }

    @staticmethod
    def _agendar_consulta() -> Dict[str, Any]:
        return {
            "title": "Agendamento de Consultas no SUS",
            "category": "Saúde",
            "content": """Para agendar consultas médicas pelo SUS, o processo acontece através da Unidade Básica de Saúde (UBS) mais próxima da sua residência.

**Como funciona:**
1. Procure a UBS do seu bairro com RG, CPF e Cartão SUS
2. Solicite o agendamento de consulta
3. Para consultas com especialistas, é necessário encaminhamento médico
4. A Central de Regulação (SISREG) da SES-DF faz o agendamento do especialista

**Documentos necessários:**
- RG ou CNH
- CPF
- Cartão SUS (solicite na própria UBS se não tiver)
- Comprovante de residência

**Acompanhamento:**
Você pode acompanhar sua solicitação de consulta no portal InfoSaúde DF.""",
            "contact": {
                "org": "SES-DF",
                "phone": "160",
                "hours": "Segunda a sexta, 8h às 18h"
            },
            "links": [
                {"label": "Portal Saúde DF", "url": "https://www.saude.df.gov.br"},
                {"label": "Agenda Saúde", "url": "https://agenda.df.gov.br/organizacao.html?organizacao=39643613"},
                {"label": "InfoSaúde DF", "url": "https://info.saude.df.gov.br"}
            ],
            "locations": ["UBS da sua região"]
        }

    @staticmethod
    def _farmacia() -> Dict[str, Any]:
        return {
            "title": "Medicamentos e Farmácia de Alto Custo",
            "category": "Saúde",
            "content": """O SUS fornece medicamentos gratuitamente através das UBS e da Farmácia de Alto Custo.

**Medicamentos básicos:**
Retire na farmácia da UBS com receita médica do SUS.

**Medicamentos de alto custo:**
Medicamentos especiais são fornecidos gratuitamente mediante:
- Receita médica do SUS
- Laudo médico
- Cadastro na Farmácia de Alto Custo

**Como solicitar:**
1. Consulte com médico do SUS
2. Com receita e laudo, procure a Farmácia de Alto Custo
3. Faça o cadastro (documentos: RG, CPF, comprovante residência, receita e laudo)
4. Após aprovação, retire mensalmente

Documentos necessários: RG, CPF, Cartão SUS, comprovante de residência, receita médica e laudo.""",
            "contact": {
                "org": "SES-DF / Farmácia Alto Custo",
                "phone": "160",
                "hours": "Consultar horário no portal"
            },
            "links": [
                {"label": "Farmácia Alto Custo", "url": "https://www.saude.df.gov.br/farmacia-de-alto-custo"}
            ]
        }

    @staticmethod
    def _saude_geral() -> Dict[str, Any]:
        return {
            "title": "Saúde - SUS/DF",
            "category": "Saúde",
            "content": """A Secretaria de Saúde do DF (SES-DF) oferece atendimento gratuito pelo Sistema Único de Saúde (SUS).

**Principais serviços:**
- Consultas médicas (UBS)
- Atendimento de urgência (UPA 24h)
- Medicamentos gratuitos
- Exames laboratoriais
- Vacinação
- Atendimento especializado (com encaminhamento)

**Para emergências:**
- SAMU: 192
- UPA 24h: sem agendamento

**Para consultas:**
Procure a Unidade Básica de Saúde (UBS) mais próxima da sua residência.""",
            "contact": {
                "org": "SES-DF",
                "phone": "160",
                "hours": "Segunda a sexta, 8h às 18h"
            },
            "links": [
                {"label": "Portal Saúde DF", "url": "https://www.saude.df.gov.br"}
            ]
        }

    # ========================================================================
    # DOCUMENTOS
    # ========================================================================

    @staticmethod
    def _rg() -> Dict[str, Any]:
        return {
            "title": "RG / Carteira de Identidade Nacional (CIN)",
            "category": "Documentos",
            "content": """A Carteira de Identidade (RG) pode ser emitida nos postos Na Hora ou no Instituto de Identificação da Polícia Civil.

**Primeira via ou segunda via:**
1. Agende pelo portal Agenda DF ou compareça a um posto Na Hora
2. Leve: certidão de nascimento ou casamento (original) e CPF
3. O documento fica pronto em cerca de 10 dias úteis

**Postos de atendimento:**
- Rede Na Hora (9 postos no DF)
- Instituto de Identificação Central (SDS, Brasília)

Horário postos Na Hora: Segunda a sexta, 7h30 às 19h | Sábado, 7h30 às 13h

Documentos necessários: Certidão de nascimento ou casamento (original), CPF.""",
            "contact": {
                "org": "SSP-DF / Na Hora",
                "phone": "(61) 2244-1146",
                "hours": "Seg–Sex 7h30–19h | Sáb 7h30–13h"
            },
            "links": [
                {"label": "Agendamento", "url": "https://agenda.df.gov.br"},
                {"label": "Na Hora", "url": "https://www.nahora.df.gov.br"}
            ],
            "locations": ["Postos Na Hora", "Instituto de Identificação"]
        }

    @staticmethod
    def _cpf() -> Dict[str, Any]:
        return {
            "title": "CPF - Cadastro de Pessoa Física",
            "category": "Documentos",
            "content": """O CPF pode ser emitido gratuitamente online ou em bancos conveniados.

**Emissão online (gratuito):**
Acesse o portal da Receita Federal: servicos.receita.fazenda.gov.br

**Presencialmente:**
- Bancos conveniados (Banco do Brasil, Caixa, Bradesco, Correios)
- Postos Na Hora

Documentos necessários: RG ou certidão de nascimento.

**Regularização de CPF:**
Se o CPF estiver com pendências, regularize pelo portal da Receita Federal ou compareça a um posto de atendimento.""",
            "contact": {
                "org": "Receita Federal / Na Hora",
                "phone": "(61) 2244-1146",
                "hours": "Serviço online 24h"
            },
            "links": [
                {"label": "Portal Receita Federal", "url": "https://www.gov.br/receitafederal"},
                {"label": "Emissão CPF", "url": "https://servicos.receita.fazenda.gov.br"}
            ]
        }

    @staticmethod
    def _certidao() -> Dict[str, Any]:
        return {
            "title": "Certidões (Nascimento, Casamento, Óbito)",
            "category": "Documentos",
            "content": """Certidões de nascimento, casamento e óbito podem ser solicitadas online gratuitamente.

**Segunda via online (gratuito):**
Acesse: www.registrocivil.org.br

A certidão digital tem a mesma validade da certidão física.

**App Gov.br:**
Baixe o app Gov.br (Android/iOS) para acessar certidões digitais.

**Presencialmente:**
Compareça ao Cartório de Registro Civil onde o registro foi feito.

Não é necessário apresentar documentos para solicitar online.""",
            "contact": {
                "org": "Cartório de Registro Civil",
                "phone": "Consultar cartório específico",
                "hours": "Serviço online 24h"
            },
            "links": [
                {"label": "Registro Civil", "url": "https://www.registrocivil.org.br"},
                {"label": "App Gov.br", "url": "https://www.gov.br/governodigital/pt-br/aplicativos/app-govbr"}
            ]
        }

    @staticmethod
    def _documentos_geral() -> Dict[str, Any]:
        return {
            "title": "Documentos e Identificação",
            "category": "Documentos",
            "content": """A Rede Na Hora oferece diversos serviços de emissão de documentos em 9 postos no DF.

**Documentos disponíveis:**
- RG / Carteira de Identidade
- CPF
- Carteira de Trabalho Digital (orientação)
- Título de Eleitor (Justiça Eleitoral)

**Certidões:**
Certidões de nascimento, casamento e óbito podem ser solicitadas online gratuitamente em www.registrocivil.org.br

Horário Na Hora: Segunda a sexta, 7h30 às 19h | Sábado, 7h30 às 13h""",
            "contact": {
                "org": "Na Hora",
                "phone": "(61) 2244-1146",
                "hours": "Seg–Sex 7h30–19h | Sáb 7h30–13h"
            },
            "links": [
                {"label": "Portal Na Hora", "url": "https://www.nahora.df.gov.br"},
                {"label": "Agendamento", "url": "https://agenda.df.gov.br"}
            ],
            "locations": ["Postos Na Hora"]
        }

    # ========================================================================
    # ASSISTÊNCIA SOCIAL
    # ========================================================================

    @staticmethod
    def _bolsa_familia() -> Dict[str, Any]:
        return {
            "title": "Bolsa Família e CadÚnico",
            "category": "Assistência Social",
            "content": """O Bolsa Família é um programa federal de transferência de renda para famílias em situação de pobreza. O cadastro é feito através do CadÚnico no CRAS.

**Como se cadastrar:**
1. Procure o CRAS (Centro de Referência de Assistência Social) mais próximo
2. Leve os documentos de todos os membros da família
3. Faça o cadastro no CadÚnico
4. Aguarde análise do governo federal

**Documentos necessários:**
- CPF de todos os membros da família
- RG ou certidão de nascimento
- Título de eleitor (opcional)
- Comprovante de residência
- Comprovante de renda (se houver)

**Recadastramento:**
Famílias já cadastradas devem atualizar os dados a cada 2 anos no CRAS.""",
            "contact": {
                "org": "SEDES-DF / CRAS",
                "phone": "156",
                "hours": "Segunda a sexta, 8h às 17h"
            },
            "links": [
                {"label": "Portal SEDES", "url": "https://www.sedes.df.gov.br"},
                {"label": "Como se cadastrar", "url": "https://www.sedes.df.gov.br/como-se-cadastrar-recadastrar"},
                {"label": "Agendamento CRAS", "url": "https://www.sedes.df.gov.br/agendaratendimento"}
            ],
            "locations": ["CRAS da sua região"]
        }

    # ========================================================================
    # TRÂNSITO
    # ========================================================================

    @staticmethod
    def _cnh() -> Dict[str, Any]:
        return {
            "title": "CNH - Carteira Nacional de Habilitação",
            "category": "Trânsito",
            "content": """A Carteira Nacional de Habilitação (CNH) é emitida pelo DETRAN-DF.

**Primeira habilitação:**
Procure uma autoescola credenciada pelo DETRAN-DF para fazer o processo completo.

**Renovação de CNH:**
1. Acesse o portal digital do DETRAN-DF
2. Faça o agendamento do exame médico
3. Realize o exame médico
4. Pague a taxa
5. A CNH renovada chega pelo correio em até 30 dias

**CNH Digital:**
Baixe o app "CNH Digital" (gov.br) e tenha sua habilitação no celular com a mesma validade da CNH física.

**Segunda via:**
Portal DETRAN-DF ou presencialmente com RG, CPF e comprovante de residência.""",
            "contact": {
                "org": "DETRAN-DF",
                "phone": "154",
                "hours": "Segunda a sexta, 7h às 17h"
            },
            "links": [
                {"label": "Portal DETRAN-DF", "url": "https://www.detran.df.gov.br"},
                {"label": "CNH Digital", "url": "https://cnh-df.detran.df.gov.br"},
                {"label": "Agendamento", "url": "https://portal.maestro.detran.df.gov.br/agendamento/"}
            ],
            "locations": ["DETRAN Central", "Postos Na Hora"]
        }

    # ========================================================================
    # PREVIDÊNCIA
    # ========================================================================

    @staticmethod
    def _aposentadoria() -> Dict[str, Any]:
        return {
            "title": "Aposentadoria - INSS",
            "category": "Previdência Social",
            "content": """A aposentadoria é concedida pelo INSS (Instituto Nacional do Seguro Social).

**Tipos de aposentadoria:**
- Por idade (65 anos homem / 62 anos mulher + 15 anos de contribuição)
- Por tempo de contribuição
- Especial (para trabalho em condições prejudiciais à saúde)

**Como solicitar:**
1. Acesse o portal Meu INSS ou baixe o app "Meu INSS"
2. Faça login com CPF e senha gov.br
3. Solicite a aposentadoria online
4. Acompanhe o processo pelo aplicativo

**Simulação:**
No portal Meu INSS você pode simular quando terá direito à aposentadoria.

**Agendamento presencial:**
Ligue 135 ou agende pelo portal Meu INSS.""",
            "contact": {
                "org": "INSS",
                "phone": "135",
                "hours": "Segunda a sábado, 7h às 22h"
            },
            "links": [
                {"label": "Portal Meu INSS", "url": "https://meu.inss.gov.br"},
                {"label": "App Meu INSS", "url": "https://www.gov.br/inss"}
            ]
        }

    # ========================================================================
    # VIOLÊNCIA CONTRA MULHER
    # ========================================================================

    @staticmethod
    def _violencia_mulher() -> Dict[str, Any]:
        return {
            "title": "Lei Maria da Penha - Proteção à Mulher",
            "category": "Direitos da Mulher",
            "content": """Se você está sofrendo violência doméstica, existem canais de ajuda disponíveis 24 horas.

**EM EMERGÊNCIA, LIGUE AGORA:**
- Central de Atendimento à Mulher: 180 (24h, gratuito, sigiloso)
- Polícia Militar: 190 (risco imediato)
- SAMU: 192 (atendimento médico)

**Medida Protetiva de Urgência:**
Você pode solicitar medida protetiva que afasta o agressor:
1. Vá a qualquer delegacia ou à DEAM e registre Boletim de Ocorrência
2. Solicite a medida protetiva no momento do registro
3. O juiz tem 48 horas para decidir
4. Não é necessário advogado

**DEAM - Delegacia Especial de Atendimento à Mulher:**
Endereço: EQS 204/205, Bloco B, Asa Sul, Brasília
Telefone: (61) 3207-6172
Horário: 24 horas

**Casa da Mulher Brasileira:**
Atendimento integrado com DEAM, Defensoria, Juizado e apoio psicossocial.
Endereço: SGAS 601, Lote 2, Asa Sul, Brasília
Telefone: (61) 3223-3690
Horário: 24 horas

**Delegacia Eletrônica:**
Registre Boletim de Ocorrência online 24h: www.pcdf.df.gov.br/servicos/delegacia-eletronica""",
            "contact": {
                "org": "Central 180 / DEAM",
                "phone": "180",
                "hours": "24 horas"
            },
            "links": [
                {"label": "Lei Maria da Penha", "url": "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm"},
                {"label": "Delegacia Eletrônica", "url": "https://www.pcdf.df.gov.br/servicos/delegacia-eletronica"}
            ],
            "locations": ["DEAM Asa Sul", "Casa da Mulher Brasileira"]
        }

    # ========================================================================
    # ORIENTAÇÃO GERAL
    # ========================================================================

    @staticmethod
    def _orientacao_geral() -> Dict[str, Any]:
        return {
            "title": "Central de Atendimento - GDF",
            "category": "Orientação Geral",
            "content": """Bem-vindo ao Guia Cidadão IA do Governo do Distrito Federal.

Posso te orientar sobre diversos serviços públicos:

**Trabalho:**
Seguro-desemprego, vagas de emprego, SINE, qualificação profissional

**Saúde:**
Agendamento de consultas, UPA, medicamentos, SUS

**Documentos:**
RG, CPF, certidões, CNH

**Assistência Social:**
Bolsa Família, CadÚnico, CRAS, BPC

**Outros serviços:**
Aposentadoria, habitação, educação, direitos da mulher

Para atendimento geral sobre qualquer serviço do GDF, ligue 156 (24 horas, gratuito).

Por favor, me diga o que você precisa e vou te orientar.""",
            "contact": {
                "org": "Central do Cidadão GDF",
                "phone": "156",
                "hours": "24 horas"
            },
            "links": [
                {"label": "Portal GDF", "url": "https://www.df.gov.br"},
                {"label": "Portal Cidadão", "url": "https://portalcidadao.df.gov.br"},
                {"label": "Serviços DF", "url": "https://servicos.df.gov.br"}
            ]
        }
