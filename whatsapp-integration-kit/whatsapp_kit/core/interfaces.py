"""
Interfaces abstratas para inversão de dependência

Este módulo define todas as interfaces (abstrações) do sistema,
permitindo desacoplamento entre componentes.
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any


class IValidator(ABC):
    """Interface abstrata para validadores"""

    @abstractmethod
    def validate_phone_number(self, phone: str, strict: bool = True) -> str:
        """Valida e formata número de telefone"""
        pass

    @abstractmethod
    def validate_message_text(self, text: str, max_length: int = 4096) -> bool:
        """Valida texto de mensagem"""
        pass

    @abstractmethod
    def validate_template_name(self, name: str) -> bool:
        """Valida nome de template"""
        pass

    @abstractmethod
    def validate_media_url(self, url: str) -> bool:
        """Valida URL de mídia"""
        pass

    @abstractmethod
    def validate_button_id(self, button_id: str) -> bool:
        """Valida ID de botão"""
        pass

    @abstractmethod
    def validate_button_title(self, title: str) -> bool:
        """Valida título de botão"""
        pass

    @abstractmethod
    def validate_buttons_count(self, count: int, max_buttons: int = 3) -> bool:
        """Valida número de botões"""
        pass

    @abstractmethod
    def validate_list_sections(self, sections: List, max_sections: int = 10) -> bool:
        """Valida seções de lista"""
        pass

    @abstractmethod
    def validate_language_code(self, code: str) -> bool:
        """Valida código de idioma"""
        pass


class IFormatter(ABC):
    """Interface abstrata para formatadores"""

    @abstractmethod
    def format_phone_number(self, phone: str) -> str:
        """Formata número de telefone"""
        pass

    @abstractmethod
    def format_currency(self, amount: float, currency: str = "BRL") -> str:
        """Formata valor monetário"""
        pass

    @abstractmethod
    def format_datetime(self, dt: Any, format_str: str = "%d/%m/%Y %H:%M") -> str:
        """Formata data/hora"""
        pass


class IHTTPClient(ABC):
    """Interface abstrata para cliente HTTP"""

    @abstractmethod
    async def get(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Requisição GET"""
        pass

    @abstractmethod
    async def post(
        self,
        url: str,
        json: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Requisição POST"""
        pass

    @abstractmethod
    async def close(self):
        """Fecha conexões"""
        pass


class IMessageSender(ABC):
    """Interface para envio de mensagens básicas"""

    @abstractmethod
    async def send_text_message(
        self,
        to: str,
        text: str,
        preview_url: bool = True
    ) -> Dict[str, Any]:
        """Envia mensagem de texto"""
        pass

    @abstractmethod
    async def send_template(
        self,
        to: str,
        template_name: str,
        language_code: str = "pt_BR",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Envia template"""
        pass


class IMediaHandler(ABC):
    """Interface para manipulação de mídia"""

    @abstractmethod
    async def send_media(
        self,
        to: str,
        media_type: str,
        media_id: Optional[str] = None,
        media_url: Optional[str] = None,
        caption: Optional[str] = None,
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """Envia mídia"""
        pass

    @abstractmethod
    async def get_media_url(self, media_id: str) -> str:
        """Obtém URL de mídia"""
        pass

    @abstractmethod
    async def download_media(self, media_url: str, save_path: str) -> int:
        """Baixa mídia"""
        pass


class IInteractiveMessages(ABC):
    """Interface para mensagens interativas"""

    @abstractmethod
    async def send_interactive_buttons(
        self,
        to: str,
        body_text: str,
        buttons: List[Dict[str, str]],
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """Envia botões interativos"""
        pass

    @abstractmethod
    async def send_cta_url(
        self,
        to: str,
        body_text: str,
        button_text: str,
        url: str
    ) -> Dict[str, Any]:
        """Envia CTA com URL"""
        pass
