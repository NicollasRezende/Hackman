"""
Type definitions e Protocols para o WhatsApp Integration Kit

Este módulo define todos os tipos customizados, TypedDicts e Protocols
usados no kit para garantir type safety e melhor autocomplete.
"""

from typing import TypedDict, Literal, Optional, List, Dict, Any, Protocol
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class MessageType(str, Enum):
    """Tipos de mensagens suportadas pela API do WhatsApp"""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    STICKER = "sticker"
    LOCATION = "location"
    CONTACTS = "contacts"
    TEMPLATE = "template"
    INTERACTIVE = "interactive"


class InteractiveType(str, Enum):
    """Tipos de mensagens interativas"""
    BUTTON = "button"
    LIST = "list"
    CTA_URL = "cta_url"


class MessageStatus(str, Enum):
    """Status de entrega de mensagem"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class MediaType(str, Enum):
    """Tipos de mídia suportados"""
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"


# ============================================================================
# TypedDicts para respostas da API
# ============================================================================

class WhatsAppMessage(TypedDict, total=False):
    """Estrutura de uma mensagem enviada/recebida do WhatsApp"""
    id: str
    from_: str  # Número do remetente
    timestamp: str
    type: str
    text: Optional[Dict[str, str]]
    image: Optional[Dict[str, Any]]
    video: Optional[Dict[str, Any]]
    audio: Optional[Dict[str, Any]]
    document: Optional[Dict[str, Any]]
    button: Optional[Dict[str, Any]]
    interactive: Optional[Dict[str, Any]]
    location: Optional[Dict[str, Any]]
    contacts: Optional[List[Dict[str, Any]]]


class WhatsAppContact(TypedDict, total=False):
    """Informações de contato do WhatsApp"""
    profile: Dict[str, str]
    wa_id: str


class WhatsAppError(TypedDict):
    """Estrutura de erro retornado pela API"""
    code: int
    title: str
    message: str
    error_data: Dict[str, Any]


class WhatsAppAPIResponse(TypedDict, total=False):
    """Resposta da API do WhatsApp"""
    messaging_product: str
    contacts: List[WhatsAppContact]
    messages: List[Dict[str, str]]
    error: Optional[WhatsAppError]


class WebhookEntry(TypedDict):
    """Entry do webhook do WhatsApp"""
    id: str
    changes: List[Dict[str, Any]]


class WebhookPayload(TypedDict):
    """Payload completo do webhook"""
    object: str
    entry: List[WebhookEntry]


# ============================================================================
# TypedDicts para construção de mensagens
# ============================================================================

class TextMessage(TypedDict):
    """Payload para mensagem de texto"""
    messaging_product: Literal["whatsapp"]
    recipient_type: Literal["individual"]
    to: str
    type: Literal["text"]
    text: Dict[str, str]


class InteractiveButton(TypedDict):
    """Definição de um botão interativo"""
    type: Literal["reply"]
    reply: Dict[str, str]  # id e title


class InteractiveButtonMessage(TypedDict):
    """Payload para mensagem com botões"""
    messaging_product: Literal["whatsapp"]
    recipient_type: Literal["individual"]
    to: str
    type: Literal["interactive"]
    interactive: Dict[str, Any]


class TemplateComponent(TypedDict, total=False):
    """Componente de um template"""
    type: str
    parameters: List[Dict[str, Any]]


class TemplateMessage(TypedDict):
    """Payload para mensagem template"""
    messaging_product: Literal["whatsapp"]
    to: str
    type: Literal["template"]
    template: Dict[str, Any]


class MediaMessage(TypedDict):
    """Payload para mensagem de mídia"""
    messaging_product: Literal["whatsapp"]
    recipient_type: Literal["individual"]
    to: str
    type: str
    image: Optional[Dict[str, Any]]
    video: Optional[Dict[str, Any]]
    audio: Optional[Dict[str, Any]]
    document: Optional[Dict[str, Any]]


# ============================================================================
# Protocols
# ============================================================================

class HTTPClientProtocol(Protocol):
    """
    Protocol para clientes HTTP
    
    Define a interface mínima que um cliente HTTP deve implementar
    para ser usado com o WhatsApp Service.
    """
    
    async def get(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[float] = None
    ) -> Dict[str, Any]:
        """Faz requisição GET"""
        ...
    
    async def post(
        self,
        url: str,
        json: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[float] = None
    ) -> Dict[str, Any]:
        """Faz requisição POST"""
        ...


class MessageBuilderProtocol(Protocol):
    """
    Protocol para builders de mensagem
    
    Define a interface que todos os message builders devem implementar.
    """
    
    def to(self, phone_number: str) -> 'MessageBuilderProtocol':
        """Define o destinatário"""
        ...
    
    def build(self) -> Dict[str, Any]:
        """Constrói o payload da mensagem"""
        ...


class WebhookHandlerProtocol(Protocol):
    """
    Protocol para handlers de webhook
    
    Define a interface que handlers de webhook devem implementar.
    """
    
    async def handle_message(self, message: WhatsAppMessage) -> None:
        """Processa mensagem recebida"""
        ...
    
    async def handle_status(self, status: Dict[str, Any]) -> None:
        """Processa atualização de status"""
        ...


# ============================================================================
# Type Aliases
# ============================================================================

PhoneNumber = str  # Formato: 5511999999999 (sem +)
MessageID = str
MediaID = str
TemplateLanguage = Literal["pt_BR", "en_US", "es_ES"]
