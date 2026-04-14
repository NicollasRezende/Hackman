"""
Bot Guia Cidadão IA - Atendimento WhatsApp GDF
Orienta cidadãos do DF sobre serviços públicos
INTEGRADO COM BACKEND SPRING BOOT
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from loguru import logger

# Adicionar whatsapp-integration-kit ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "whatsapp-integration-kit"))

# Importar message components
from whatsapp_kit import (
    create_button_message,
    create_list_message,
    create_text_message
)

# Importar backend client
from backend_client import BackendClient
from response_formatter import ResponseFormatter


# ============================================================================
# ENUMS E ESTADOS
# ============================================================================

class ConversationState(Enum):
    """Estados da conversa"""
    INITIAL = "initial"
    MENU = "menu"
    WAITING_QUESTION = "waiting_question"
    CATEGORY_SAUDE = "category_saude"
    CATEGORY_TRABALHO = "category_trabalho"
    CATEGORY_DOCUMENTOS = "category_documentos"
    CATEGORY_BENEFICIOS = "category_beneficios"
    CATEGORY_OUTROS = "category_outros"


# ============================================================================
# MODELOS DE DADOS
# ============================================================================

@dataclass
class UserSession:
    """Sessão do usuário"""
    phone: str
    state: str
    data: Dict[str, Any]
    last_interaction: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ============================================================================
# GERENCIADOR DE SESSÕES
# ============================================================================

class SessionManager:
    """Gerencia sessões de usuários"""

    def __init__(self, storage_dir: str = "storage/sessions"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"📁 Session storage: {self.storage_dir}")

    def _get_session_file(self, phone: str) -> Path:
        """Retorna caminho do arquivo de sessão"""
        return self.storage_dir / f"{phone}.json"

    def get_session(self, phone: str) -> UserSession:
        """Recupera ou cria nova sessão"""
        file_path = self._get_session_file(phone)

        if file_path.exists():
            with open(file_path, 'r') as f:
                data = json.load(f)
                logger.info(f"📂 Sessão recuperada: {phone} (estado: {data['state']})")
                return UserSession(**data)

        # Nova sessão
        session = UserSession(
            phone=phone,
            state=ConversationState.INITIAL.value,
            data={},
            last_interaction=datetime.now().isoformat()
        )

        logger.info(f"🆕 Nova sessão: {phone}")
        self.save_session(session)
        return session

    def save_session(self, session: UserSession):
        """Salva sessão"""
        session.last_interaction = datetime.now().isoformat()
        file_path = self._get_session_file(session.phone)

        with open(file_path, 'w') as f:
            json.dump(session.to_dict(), f, indent=2)

        logger.debug(f"💾 Sessão salva: {session.phone}")

    def clear_session(self, phone: str):
        """Limpa sessão"""
        file_path = self._get_session_file(phone)
        if file_path.exists():
            file_path.unlink()
            logger.info(f"🗑️ Sessão limpa: {phone}")


# ============================================================================
# MATCHER DE RESPOSTAS (SIMPLIFICADO)
# ============================================================================

def match_service_keywords(text: str) -> Optional[Dict[str, Any]]:
    """
    Identifica serviço baseado em palavras-chave
    Retorna informações estruturadas para resposta
    """
    text_lower = text.lower()

    # SAÚDE
    if any(keyword in text_lower for keyword in ["médico", "saúde", "hospital", "upa", "sus", "consulta", "remédio", "vacina"]):
        return {
            "category": "Saúde",
            "icon": "🏥",
            "intro": "Você tem direito ao atendimento gratuito pelo *SUS*. Veja como acessar os serviços de saúde.",
            "steps": [
                "Para emergências: ligue *192 (SAMU)* ou vá à UPA 24h mais próxima",
                "Para consultas: procure a UBS do seu bairro com RG e cartão SUS",
                "A UBS vai encaminhar para especialistas via regulação (SISREG)",
                "Acompanhe sua solicitação em info.saude.df.gov.br"
            ],
            "contact": {
                "title": "Secretaria de Saúde do DF (SES-DF)",
                "phone": "160",
                "hours": "Seg–Sex, 8h–18h"
            },
            "link": "https://www.saude.df.gov.br"
        }

    # TRABALHO / EMPREGO
    elif any(keyword in text_lower for keyword in ["emprego", "trabalho", "seguro desemprego", "ctps", "sine", "vaga", "demiti"]):
        return {
            "category": "Trabalho e Emprego",
            "icon": "💼",
            "intro": "Acesse serviços de emprego, qualificação profissional e seguro-desemprego através do *SINE-DF*.",
            "steps": [
                "Acesse o portal do SINE: www.sedet.df.gov.br",
                "Faça seu cadastro com RG e CPF",
                "Para seguro-desemprego: use o app Emprega Brasil ou vá ao SINE",
                "Consulte vagas disponíveis pelo telefone *158*"
            ],
            "contact": {
                "title": "SINE-DF (Secretaria de Trabalho)",
                "phone": "158",
                "hours": "Seg–Sex, 7h–17h"
            },
            "link": "https://www.sedet.df.gov.br"
        }

    # TRÂNSITO / CNH
    elif any(keyword in text_lower for keyword in ["cnh", "carteira", "habilitação", "detran", "multa", "vistoria", "licenciamento"]):
        return {
            "category": "Trânsito e CNH",
            "icon": "🚗",
            "intro": "Serviços do *DETRAN-DF* disponíveis online e nos postos Na Hora.",
            "steps": [
                "Acesse portal.detran.df.gov.br para serviços online",
                "Para renovação de CNH: faça agendamento no portal",
                "Multas e licenciamento: use o app DETRAN Digital",
                "CNH Digital disponível no app oficial do gov.br"
            ],
            "contact": {
                "title": "DETRAN-DF",
                "phone": "154",
                "hours": "Seg–Sex, 7h–17h"
            },
            "link": "https://www.detran.df.gov.br"
        }

    # DOCUMENTOS (RG, CPF)
    elif any(keyword in text_lower for keyword in ["rg", "identidade", "cpf", "documento", "segunda via", "certidão"]):
        return {
            "category": "Documentos",
            "icon": "🪪",
            "intro": "Emita seus documentos nos postos *Na Hora* ou online.",
            "steps": [
                "RG/Identidade: agende em agenda.df.gov.br ou vá ao Na Hora",
                "CPF: emita online em servicos.receita.fazenda.gov.br",
                "Certidões: acesse www.registrocivil.org.br (gratuito)",
                "Título de Eleitor: use o app e-Título"
            ],
            "contact": {
                "title": "Rede Na Hora",
                "phone": "(61) 2244-1146",
                "hours": "Seg–Sex 7h30–19h | Sáb 7h30–13h"
            },
            "link": "https://www.nahora.df.gov.br"
        }

    # BOLSA FAMÍLIA / ASSISTÊNCIA SOCIAL
    elif any(keyword in text_lower for keyword in ["bolsa família", "bolsa", "cras", "bpc", "cadastro único", "cadunico", "assistência"]):
        return {
            "category": "Assistência Social",
            "icon": "🤝",
            "intro": "Programas sociais do GDF disponíveis através dos *CRAS* (Centros de Referência).",
            "steps": [
                "Para Bolsa Família: procure o CRAS mais próximo",
                "Documentos necessários: CPF, RG, comprovante de residência",
                "Faça seu cadastro no CadÚnico",
                "Ligue 156 para agendar atendimento no CRAS"
            ],
            "contact": {
                "title": "SEDES-DF (Desenvolvimento Social)",
                "phone": "156",
                "hours": "Seg–Sex, 8h–17h"
            },
            "link": "https://www.sedes.df.gov.br"
        }

    # PREVIDÊNCIA / APOSENTADORIA
    elif any(keyword in text_lower for keyword in ["inss", "aposentadoria", "aposentar", "benefício", "previdência", "auxílio"]):
        return {
            "category": "Previdência Social",
            "icon": "🏦",
            "intro": "Serviços do *INSS* disponíveis online e por telefone.",
            "steps": [
                "Acesse meu.inss.gov.br ou baixe o app Meu INSS",
                "Consulte seus benefícios pelo CPF",
                "Para agendamento presencial: ligue *135*",
                "Simule sua aposentadoria no portal"
            ],
            "contact": {
                "title": "INSS",
                "phone": "135",
                "hours": "Seg–Sáb, 7h–22h"
            },
            "link": "https://meu.inss.gov.br"
        }

    # Default - não identificado
    else:
        return {
            "category": "Atendimento Geral",
            "icon": "ℹ️",
            "intro": "Não consegui identificar especificamente seu pedido, mas posso te ajudar!",
            "steps": [
                "Tente reformular sua pergunta de forma mais específica",
                "Diga qual documento ou serviço você precisa",
                "Ou ligue para a Central do Cidadão: *156*"
            ],
            "contact": {
                "title": "Central do Cidadão GDF",
                "phone": "156",
                "hours": "24 horas"
            },
            "link": "https://www.df.gov.br"
        }


# ============================================================================
# BOT PRINCIPAL
# ============================================================================

class GuiaCidadaoBot:
    """Bot de atendimento Guia Cidadão IA - Integrado com Backend Spring Boot"""

    def __init__(self, whatsapp_client):
        self.whatsapp = whatsapp_client
        self.session_manager = SessionManager()
        self.backend = BackendClient()
        self.formatter = ResponseFormatter()
        logger.info("🤖 Guia Cidadão Bot inicializado (com integração backend)")

    async def send_text(self, phone: str, text: str):
        """Envia mensagem de texto simples"""
        try:
            response = await self.whatsapp.send_text(phone, text)
            logger.success(f"✅ Mensagem enviada para {phone}")
            return response
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem: {e}")
            raise

    async def send_welcome(self, phone: str):
        """Envia mensagem de boas-vindas simples"""
        welcome_msg = """👋 *Olá! Sou o Guia Cidadão IA do DF*

Estou aqui para te ajudar com serviços públicos do Distrito Federal.

💬 *Digite sua dúvida ou o que você precisa*

Exemplos:
• "preciso marcar consulta no SUS"
• "perdi meu emprego"
• "como tirar segunda via do RG"
• "onde fica a UPA mais próxima"

_Pode escrever à vontade, vou te orientar!_"""

        await self.send_text(phone, welcome_msg)

    async def process_question_with_backend(self, phone: str, message: str) -> bool:
        """
        Processa pergunta usando backend Spring Boot
        FLUXO SIMPLIFICADO: só repassa pro backend e formata resposta

        Returns:
            True se conseguiu processar, False caso contrário
        """
        try:
            # Chamar backend
            response_data = await self.backend.chat(message, phone)

            if response_data:
                # Formatar e enviar resposta
                formatted_message = self.formatter.format_chat_response(response_data)
                await self.send_text(phone, formatted_message)
                return True
            else:
                logger.warning("Backend retornou resposta vazia")
                return False

        except Exception as e:
            logger.error(f"Erro ao processar com backend: {e}")
            return False

    async def send_fallback(self, phone: str):
        """Envia mensagem de fallback quando backend falha"""
        fallback_message = self.formatter.format_fallback()
        await self.send_text(phone, fallback_message)

    async def handle_message(self, phone: str, message: str, message_type: str = "text"):
        """Processa mensagem recebida - FLUXO SIMPLIFICADO"""

        # Recuperar sessão
        session = self.session_manager.get_session(phone)

        logger.info(f"💬 [{phone}] {message_type}: {message}")

        # Comandos especiais
        if message.lower() in ["/start", "/menu", "menu", "oi", "olá", "ola"]:
            await self.send_welcome(phone)
            return

        # FLUXO SIMPLES: qualquer mensagem vai pro backend
        success = await self.process_question_with_backend(phone, message)

        if not success:
            # Fallback se backend falhar
            logger.warning("Backend falhou, usando fallback...")
            await self.send_fallback(phone)

    async def send_local_service_info(self, phone: str, service_data: Dict[str, Any]):
        """Fallback: envia informações locais quando backend não está disponível"""
        category = service_data.get("category", "Serviço")
        icon = service_data.get("icon", "ℹ️")
        intro = service_data.get("intro", "")
        steps = service_data.get("steps", [])
        contact = service_data.get("contact", {})
        link = service_data.get("link", "")

        message = f"*{icon} {category}*\n\n{intro}\n\n"

        if steps:
            message += "*📋 Como proceder:*\n\n"
            for i, step in enumerate(steps, 1):
                message += f"{i}. {step}\n"
            message += "\n"

        if contact:
            message += f"*📞 Atendimento:*\n• {contact.get('title', '')}\n"
            if contact.get('phone'):
                message += f"• Telefone: {contact['phone']}\n"
            if contact.get('hours'):
                message += f"• Horário: {contact['hours']}\n"
            message += "\n"

        if link:
            message += f"🔗 *Link oficial:* {link}\n\n"

        message += "_⚠️ Modo offline - Digite /menu para voltar_"
        await self.send_text(phone, message)

    async def send_category_menu(self, phone: str, category: str):
        """Envia menu específico de uma categoria"""
        menus = {
            "saude": {
                "body": "🏥 *Saúde - SUS/DF*\n\nServiços de saúde pública do Distrito Federal.\n\n👇 Escolha:",
                "buttons": [
                    {"id": "upa_hospital", "title": "🏥 UPA/Hospital"},
                    {"id": "agendar_sus", "title": "📅 Agendar consulta"},
                    {"id": "farmacia_remedios", "title": "💊 Remédios/Farmácia"}
                ]
            },
            "trabalho": {
                "body": "💼 *Trabalho - SINE/DF*\n\nEmprego, qualificação e benefícios trabalhistas.\n\n👇 Escolha:",
                "buttons": [
                    {"id": "vagas_emprego", "title": "💼 Vagas SINE"},
                    {"id": "seguro_desemp", "title": "💰 Seguro-desemprego"},
                    {"id": "qualificacao", "title": "📚 Qualificação"}
                ]
            },
            "documentos": {
                "body": "📄 *Documentos - Na Hora/DF*\n\nEmissão de documentos pessoais.\n\n👇 Escolha:",
                "buttons": [
                    {"id": "rg_identidade", "title": "🪪 RG"},
                    {"id": "cpf_doc", "title": "📑 CPF"},
                    {"id": "certidoes", "title": "📄 Certidões"}
                ]
            }
        }

        menu = menus.get(category)
        if menu:
            await self.whatsapp.send_buttons(
                to=phone,
                body=menu["body"],
                buttons=menu["buttons"],
                footer="Ou escreva o que você precisa"
            )
        else:
            await self.send_welcome(phone)

    async def handle_button_reply(self, phone: str, button_id: str, button_text: str):
        """Processa resposta de botão - SIMPLIFICADO"""
        logger.info(f"🔘 [{phone}] Botão: {button_id} ({button_text})")

        # Qualquer botão = tratar como texto e repassar pro backend
        await self.handle_message(phone, button_text, "button")
