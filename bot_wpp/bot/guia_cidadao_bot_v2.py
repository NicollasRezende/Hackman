"""
Bot Guia Cidadão IA - VERSÃO PROFISSIONAL MOCKADA
Sistema simplificado com base de conhecimento local
SEM backend, SEM emojis, gestão de estado correta
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from loguru import logger

from knowledge_base import KnowledgeBase
from location_service import LocationService


class SessionManager:
    """Gerencia sessões de usuários"""

    def __init__(self, storage_dir: str = "storage/sessions"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Session storage: {self.storage_dir}")

    def _get_file(self, phone: str) -> Path:
        return self.storage_dir / f"{phone}.json"

    def get_session(self, phone: str) -> Dict[str, Any]:
        """Recupera ou cria sessão"""
        file_path = self._get_file(phone)

        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)

        # Nova sessão
        session = {
            "phone": phone,
            "active": False,
            "last_interaction": datetime.now().isoformat()
        }
        self.save_session(session)
        return session

    def save_session(self, session: Dict[str, Any]):
        """Salva sessão"""
        session["last_interaction"] = datetime.now().isoformat()
        file_path = self._get_file(session["phone"])

        with open(file_path, 'w') as f:
            json.dump(session, f, indent=2)

    def reset_session(self, phone: str):
        """Reseta sessão (limpa estado)"""
        session = {
            "phone": phone,
            "active": False,
            "last_interaction": datetime.now().isoformat()
        }
        self.save_session(session)
        logger.info(f"Sessão resetada: {phone}")


class GuiaCidadaoBotV2:
    """Bot profissional com base de conhecimento mockada"""

    def __init__(self, whatsapp_client):
        self.whatsapp = whatsapp_client
        self.session_manager = SessionManager()
        self.kb = KnowledgeBase()
        self.location = LocationService()
        logger.info("Guia Cidadão Bot V2 inicializado (com APIs reais)")

    async def send_text(self, phone: str, text: str):
        """Envia mensagem de texto"""
        try:
            response = await self.whatsapp.send_text(phone, text)
            logger.success(f"Mensagem enviada para {phone}")
            return response
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem: {e}")
            raise

    async def send_welcome(self, phone: str):
        """Envia boas-vindas com lista de categorias - UX profissional"""
        welcome = """*GUIA CIDADÃO IA*
_Governo do Distrito Federal_

Assistente digital oficial para orientação sobre serviços públicos do GDF.

*Como usar:*
• Selecione uma categoria no menu abaixo
• Ou digite sua dúvida diretamente

Atendimento disponível 24 horas."""

        sections = [
            {
                "title": "Serviços Essenciais",
                "rows": [
                    {
                        "id": "saude",
                        "title": "Saúde",
                        "description": "SUS, UPA, consultas, exames"
                    },
                    {
                        "id": "trabalho",
                        "title": "Trabalho e Emprego",
                        "description": "Seguro-desemprego, SINE, vagas"
                    },
                    {
                        "id": "documentos",
                        "title": "Documentos",
                        "description": "RG, CPF, certidões, CNH"
                    }
                ]
            },
            {
                "title": "Assistência e Direitos",
                "rows": [
                    {
                        "id": "assistencia",
                        "title": "Assistência Social",
                        "description": "Bolsa Família, CRAS, CadÚnico"
                    },
                    {
                        "id": "previdencia",
                        "title": "Previdência",
                        "description": "INSS, aposentadoria, benefícios"
                    },
                    {
                        "id": "direitos_mulher",
                        "title": "Direitos da Mulher",
                        "description": "Lei Maria da Penha, DEAM"
                    }
                ]
            },
            {
                "title": "Atendimento Geral",
                "rows": [
                    {
                        "id": "central_156",
                        "title": "Central 156",
                        "description": "Atendimento geral GDF"
                    }
                ]
            }
        ]

        await self.whatsapp.send_list(
            to=phone,
            body=welcome,
            button_text="Acessar Serviços",
            sections=sections,
            footer="Central de Atendimento GDF: 156 (24h)"
        )

    async def format_and_send_response(self, phone: str, data: Dict[str, Any]):
        """Formata e envia resposta estruturada - layout profissional gov"""
        parts = []

        # Cabeçalho com título e categoria
        if data.get("title"):
            parts.append(f"*{data['title'].upper()}*")
            if data.get("category"):
                parts.append(f"_{data['category']}_")
            parts.append("")

        # Conteúdo principal
        if data.get("content"):
            parts.append(data["content"])
            parts.append("")

        # Seção de contato - destaque visual
        if data.get("contact"):
            contact = data["contact"]
            parts.append("─" * 30)
            parts.append("*ATENDIMENTO*")
            parts.append("")
            if contact.get("org"):
                parts.append(f"*Órgão:* {contact['org']}")
            if contact.get("phone"):
                parts.append(f"*Telefone:* {contact['phone']}")
            if contact.get("hours"):
                parts.append(f"*Horário:* {contact['hours']}")
            parts.append("─" * 30)
            parts.append("")

        # Locais de atendimento - formatação limpa
        if data.get("locations"):
            parts.append("*LOCAIS DE ATENDIMENTO*")
            parts.append("")
            if isinstance(data["locations"], list):
                for i, loc in enumerate(data["locations"], 1):
                    parts.append(f"{i}. {loc}")
            else:
                parts.append(f"• {data['locations']}")
            parts.append("")

        # Links oficiais - seção separada
        if data.get("links"):
            parts.append("*ACESSO DIGITAL*")
            parts.append("")
            for link in data["links"]:
                parts.append(f"*{link['label']}*")
                parts.append(f"{link['url']}")
                parts.append("")

        # Rodapé com instruções claras
        parts.append("─" * 30)
        parts.append("*Precisa de mais ajuda?*")
        parts.append("• Digite outra pergunta")
        parts.append("• Digite /menu para voltar ao início")
        parts.append("• Ligue 156 para atendimento personalizado")

        message = "\n".join(parts)
        await self.send_text(phone, message)

    async def handle_message(self, phone: str, message: str, message_type: str = "text"):
        """Processa mensagem - FLUXO SIMPLIFICADO"""

        session = self.session_manager.get_session(phone)
        logger.info(f"[{phone}] {message_type}: {message}")

        # Comandos de controle
        message_lower = message.lower().strip()

        if message_lower in ["/menu", "/start", "menu", "oi", "olá", "ola", "inicio"]:
            self.session_manager.reset_session(phone)
            await self.send_welcome(phone)
            return

        # Verificar se está aguardando CEP para UPA
        if session.get("waiting_for") == "cep_upa":
            await self.handle_cep_upa(phone, message)
            return

        # Buscar resposta na base de conhecimento
        response_data = self.kb.get_response(message)

        if response_data:
            await self.format_and_send_response(phone, response_data)

            # Marcar sessão como ativa
            session["active"] = True
            self.session_manager.save_session(session)
        else:
            # Fallback profissional
            fallback = """*NÃO COMPREENDI SUA SOLICITAÇÃO*

Desculpe, não consegui identificar o serviço solicitado.

*Temas que atendo:*

*Serviços Essenciais*
• Saúde (SUS, UPA, consultas)
• Trabalho e Emprego (SINE, seguro-desemprego)
• Documentos (RG, CPF, CNH)

*Assistência e Direitos*
• Assistência Social (Bolsa Família, CRAS)
• Previdência (INSS, aposentadoria)
• Direitos da Mulher (Lei Maria da Penha)

*Como usar:*
• Reformule sua pergunta de forma mais clara
• Digite */menu* para ver as categorias
• Ligue *156* para falar com atendente

*Exemplos de perguntas:*
• "Como tirar RG?"
• "Seguro-desemprego"
• "UPA próxima"
• "Bolsa Família"

─────────────────────────
_Governo do Distrito Federal_"""

            await self.send_text(phone, fallback)

    async def handle_cep_upa(self, phone: str, cep: str):
        """Processa CEP e mostra UPAs próximas - layout profissional"""
        # Limpar CEP
        cep_clean = ''.join(filter(str.isdigit, cep))

        if len(cep_clean) != 8:
            await self.send_text(phone, """*CEP INVÁLIDO*

O CEP informado não possui 8 dígitos.

*Formato correto:*
• 70040020 (só números)
• 70040-020 (com hífen)

Por favor, digite novamente.""")
            return

        # Limpar estado de espera
        session = self.session_manager.get_session(phone)
        session.pop("waiting_for", None)
        self.session_manager.save_session(session)

        # Buscar endereço via BrasilAPI
        await self.send_text(phone, "Buscando UPAs próximas ao seu CEP...")

        endereco = await self.location.buscar_endereco_por_cep(cep_clean)

        if not endereco:
            await self.send_text(phone, f"""*CEP NÃO ENCONTRADO*

O CEP *{cep_clean[:5]}-{cep_clean[5:]}* não foi localizado na base de dados.

*Verifique:*
• Se digitou corretamente
• Se é um CEP válido de Brasília/DF

*Precisa de ajuda?*
Ligue 156 para atendimento""")
            return

        # Buscar UPAs por região
        bairro = endereco.get("neighborhood", "")
        upas = await self.location.buscar_upas_por_regiao(bairro)

        # Formatar resposta profissional
        parts = [
            "*UPAS 24 HORAS PRÓXIMAS*",
            f"_Secretaria de Saúde do DF_",
            "",
            "*Seu endereço:*",
            f"{endereco.get('street')}",
            f"{bairro} - Brasília/DF",
            f"CEP: {cep_clean[:5]}-{cep_clean[5:]}",
            "",
            "─" * 30,
            "*UNIDADES PRÓXIMAS*",
            ""
        ]

        if upas:
            for i, upa in enumerate(upas[:3], 1):
                parts.append(f"*{i}. {upa['nome']}*")
                parts.append(f"Endereço: {upa['endereco']}")
                parts.append(f"Telefone: {upa['telefone']}")
                if upa.get("distancia"):
                    parts.append(f"_{upa['distancia']}_")
                parts.append("")
        else:
            parts.append("Nenhuma UPA cadastrada próxima.")
            parts.append("")
            parts.append("*Ligue 192 (SAMU) para orientação*")
            parts.append("")

        parts.extend([
            "─" * 30,
            "*EMERGÊNCIAS*",
            "",
            "• *SAMU:* 192",
            "• *Bombeiros:* 193",
            "• *Polícia:* 190",
            "",
            "─" * 30,
            "*INFORMAÇÕES IMPORTANTES*",
            "",
            "• UPAs funcionam 24 horas",
            "• Não precisa agendamento",
            "• Leve RG e Cartão SUS",
            "",
            "*Portal da Saúde:*",
            "https://www.saude.df.gov.br"
        ])

        await self.send_text(phone, "\n".join(parts))

        # Botões de ação
        buttons = [
            {"id": "nova_pergunta", "title": "Outra pergunta"},
            {"id": "voltar", "title": "← Menu"}
        ]

        await self.whatsapp.send_buttons(
            to=phone,
            body="O que deseja fazer?",
            buttons=buttons,
            footer="Central GDF: 156"
        )

    async def send_category_menu(self, phone: str, category: str):
        """Envia submenu de categoria - UX profissional com hierarquia clara"""
        menus = {
            "trabalho": {
                "body": "*TRABALHO E EMPREGO*\n_Secretaria de Trabalho - SEDET_\n\nServiços disponíveis:",
                "sections": [
                    {
                        "title": "Serviços Principais",
                        "rows": [
                            {"id": "seguro_desemprego", "title": "Seguro-Desemprego", "description": "Requisitos, documentos, agendamento"},
                            {"id": "vagas_emprego", "title": "Vagas de Emprego", "description": "SINE, cadastro, oportunidades"},
                            {"id": "qualificacao", "title": "Qualificação Profissional", "description": "Cursos gratuitos, capacitação"}
                        ]
                    }
                ],
                "button_text": "Escolher Serviço",
                "footer": "SINE: 158 | Central: 156"
            },
            "saude": {
                "body": "*SAÚDE*\n_Secretaria de Saúde - SES-DF_\n\nServiços disponíveis:",
                "sections": [
                    {
                        "title": "Atendimento",
                        "rows": [
                            {"id": "upa_urgencia", "title": "UPA / Urgência", "description": "Encontrar UPA 24h próxima"},
                            {"id": "agendar_consulta", "title": "Consultas e Exames", "description": "Agendamento SUS, especialidades"},
                            {"id": "cartao_sus", "title": "Cartão SUS", "description": "Emissão, segunda via"}
                        ]
                    }
                ],
                "button_text": "Escolher Serviço",
                "footer": "SAMU: 192 | SES: 160"
            },
            "documentos": {
                "body": "*DOCUMENTOS*\n_Serviços de Identificação_\n\nDocumentos disponíveis:",
                "sections": [
                    {
                        "title": "Documentos Principais",
                        "rows": [
                            {"id": "rg_identidade", "title": "RG / Identidade", "description": "Primeira via, segunda via, renovação"},
                            {"id": "cpf_doc", "title": "CPF", "description": "Emissão, regularização"},
                            {"id": "cnh_doc", "title": "CNH", "description": "Primeira habilitação, renovação"}
                        ]
                    }
                ],
                "button_text": "Escolher Documento",
                "footer": "Na Hora: (61) 2244-1146"
            },
            "assistencia": {
                "body": "*ASSISTÊNCIA SOCIAL*\n_SEDES - Desenvolvimento Social_\n\nServiços disponíveis:",
                "sections": [
                    {
                        "title": "Programas e Benefícios",
                        "rows": [
                            {"id": "bolsa_familia", "title": "Bolsa Família", "description": "Cadastro, atualização, benefícios"},
                            {"id": "cras", "title": "CRAS", "description": "Localização, serviços oferecidos"},
                            {"id": "cadunico", "title": "CadÚnico", "description": "Cadastro Único, atualização"}
                        ]
                    }
                ],
                "button_text": "Escolher Serviço",
                "footer": "CRAS: 156"
            },
            "previdencia": {
                "body": "*PREVIDÊNCIA SOCIAL*\n_INSS - Instituto Nacional do Seguro Social_\n\nServiços disponíveis:",
                "sections": [
                    {
                        "title": "Benefícios",
                        "rows": [
                            {"id": "aposentadoria", "title": "Aposentadoria", "description": "Tipos, requisitos, agendamento"},
                            {"id": "beneficios_inss", "title": "Outros Benefícios", "description": "Pensão, auxílios, BPC"}
                        ]
                    }
                ],
                "button_text": "Escolher Serviço",
                "footer": "INSS: 135"
            },
            "direitos_mulher": {
                "body": "*DIREITOS DA MULHER*\n_Proteção e Amparo_\n\nCanais de ajuda:",
                "sections": [
                    {
                        "title": "Atendimento e Proteção",
                        "rows": [
                            {"id": "lei_maria_penha", "title": "Lei Maria da Penha", "description": "Denúncia, medida protetiva"},
                            {"id": "deam", "title": "DEAM", "description": "Delegacia Especializada"},
                            {"id": "central_180", "title": "Central 180", "description": "Atendimento 24h"}
                        ]
                    }
                ],
                "button_text": "Escolher Atendimento",
                "footer": "Emergência: 190 | Central: 180"
            },
            "central_156": {
                "body": "*CENTRAL 156*\n_Atendimento Geral GDF_\n\nA Central 156 atende dúvidas sobre todos os serviços do GDF.\n\n*Canais de atendimento:*\n• Telefone: 156\n• WhatsApp: (61) 99999-0156\n• Site: www.df.gov.br\n\n*Horário:*\n24 horas, 7 dias por semana",
                "sections": None,  # Sem lista, só informação
                "button_text": None,
                "footer": "GDF: 156 (24h)"
            }
        }

        menu = menus.get(category)
        if not menu:
            await self.send_welcome(phone)
            return

        # Se tem seções (lista interativa)
        if menu.get("sections"):
            await self.whatsapp.send_list(
                to=phone,
                body=menu["body"],
                button_text=menu["button_text"],
                sections=menu["sections"],
                footer=menu["footer"]
            )
        else:
            # Se não tem seções, só envia texto com botão voltar
            await self.send_text(phone, menu["body"])

            buttons = [
                {"id": "voltar", "title": "Voltar ao Menu"}
            ]

            await self.whatsapp.send_buttons(
                to=phone,
                body="Outras opções:",
                buttons=buttons,
                footer=menu["footer"]
            )

    async def send_response_with_back_button(self, phone: str, data: Dict[str, Any]):
        """Envia resposta com botões de ação - navegação consistente"""
        # Primeiro envia a resposta completa
        await self.format_and_send_response(phone, data)

        # Botões de navegação padronizados (máx 3)
        buttons = [
            {"id": "nova_pergunta", "title": "Nova Consulta"},
            {"id": "falar_atendente", "title": "Falar com 156"},
            {"id": "voltar", "title": "Menu Inicial"}
        ]

        await self.whatsapp.send_buttons(
            to=phone,
            body="*Próximos passos:*",
            buttons=buttons,
            footer="Governo do Distrito Federal"
        )

    async def handle_button_reply(self, phone: str, button_id: str, button_text: str):
        """Processa clique em botão com navegação profissional"""
        logger.info(f"[{phone}] Botão: {button_id} ({button_text})")

        session = self.session_manager.get_session(phone)

        # Navegação - Voltar ao menu principal
        if button_id == "voltar":
            self.session_manager.reset_session(phone)
            await self.send_welcome(phone)
            return

        # Navegação - Nova consulta
        if button_id == "nova_pergunta":
            self.session_manager.reset_session(phone)
            await self.send_welcome(phone)
            return

        # Navegação - Falar com atendente
        if button_id == "falar_atendente":
            await self.send_text(phone, """*CENTRAL DE ATENDIMENTO GDF*

Para falar com um atendente humano:

*Telefone:* 156
*WhatsApp:* (61) 99999-0156
*Horário:* 24 horas

*Emergências:*
• SAMU: 192
• Bombeiros: 193
• Polícia: 190

Ou continue digitando suas dúvidas aqui que eu respondo automaticamente.""")
            return

        # Categorias principais - mostra submenu
        if button_id in ["trabalho", "saude", "documentos", "assistencia", "previdencia", "direitos_mulher", "central_156"]:
            session["current_category"] = button_id
            self.session_manager.save_session(session)
            await self.send_category_menu(phone, button_id)
            return

        # Serviço: UPA próxima - pede CEP
        if button_id == "upa_urgencia":
            session["waiting_for"] = "cep_upa"
            self.session_manager.save_session(session)

            await self.send_text(phone, """*LOCALIZAR UPA 24H*
_Unidade de Pronto Atendimento_

Para encontrar a UPA mais próxima, informe seu CEP.

*Digite o CEP:*
Apenas números ou com hífen

*Exemplos:*
• 70040020
• 70040-020

*Emergências graves:*
Ligue 192 (SAMU) ou 193 (Bombeiros)""")
            return

        # Mapeamento de botões para consultas na knowledge base
        button_to_query = {
            # Trabalho
            "seguro_desemprego": "seguro desemprego",
            "vagas_emprego": "vagas emprego",
            "qualificacao": "qualificação profissional cursos",
            # Saúde
            "agendar_consulta": "agendar consulta sus",
            "cartao_sus": "cartão sus emitir",
            # Documentos
            "rg_identidade": "tirar rg identidade",
            "cpf_doc": "emitir cpf",
            "cnh_doc": "cnh carteira habilitação",
            # Assistência
            "bolsa_familia": "bolsa familia",
            "cras": "cras assistencia social",
            "cadunico": "cadastro unico cadunico",
            # Previdência
            "aposentadoria": "aposentadoria inss",
            "beneficios_inss": "beneficios inss pensao",
            # Direitos da Mulher
            "lei_maria_penha": "lei maria da penha violencia",
            "deam": "deam delegacia mulher",
            "central_180": "central 180 mulher"
        }

        query = button_to_query.get(button_id, button_text)

        # Buscar resposta na base de conhecimento
        response_data = self.kb.get_response(query)

        if response_data:
            await self.send_response_with_back_button(phone, response_data)
            session["active"] = True
            self.session_manager.save_session(session)
        else:
            # Fallback: tratar como mensagem de texto
            await self.handle_message(phone, button_text, "button")
