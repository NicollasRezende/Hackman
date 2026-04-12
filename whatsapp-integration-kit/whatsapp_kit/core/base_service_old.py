"""
Serviço base abstrato para WhatsApp Business API

Este módulo define a interface abstrata que todos os serviços
WhatsApp devem implementar, garantindo consistência.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from .types import PhoneNumber, MessageID, TemplateLanguage
from .exceptions import WhatsAppValidationError
import re


class BaseWhatsAppService(ABC):
    """
    Serviço base abstrato para WhatsApp Business API
    
    Define a interface mínima que implementações concretas devem fornecer.
    Inclui métodos utilitários comuns para validação e extração de dados.
    
    Todas as implementações concretas devem herdar desta classe e
    implementar os métodos abstratos.
    
    Example:
        class MyWhatsAppService(BaseWhatsAppService):
            async def send_text_message(self, to, text):
                # Implementação concreta
                ...
    """
    
    # Métodos abstratos que DEVEM ser implementados
    
    @abstractmethod
    async def send_text_message(
        self,
        to: PhoneNumber,
        text: str
    ) -> Dict[str, Any]:
        """
        Envia mensagem de texto simples
        
        Args:
            to: Número do destinatário (formato: 5511999999999)
            text: Texto da mensagem (máx 4096 caracteres)
        
        Returns:
            Resposta da API com message_id
        """
        pass
    
    @abstractmethod
    async def send_template(
        self,
        to: PhoneNumber,
        template_name: str,
        language_code: TemplateLanguage = "pt_BR",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem template pré-aprovada
        
        Args:
            to: Número do destinatário
            template_name: Nome do template aprovado
            language_code: Código do idioma (pt_BR, en_US, etc)
            components: Componentes do template (parâmetros, headers, etc)
        
        Returns:
            Resposta da API com message_id
        """
        pass
    
    @abstractmethod
    async def send_media(
        self,
        to: PhoneNumber,
        media_type: str,
        media_id: Optional[str] = None,
        media_url: Optional[str] = None,
        caption: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envia mídia (imagem, vídeo, documento, áudio)
        
        Args:
            to: Número do destinatário
            media_type: Tipo (image, video, document, audio)
            media_id: ID da mídia já uploadada (OU media_url)
            media_url: URL pública da mídia (OU media_id)
            caption: Legenda para imagem/vídeo
        
        Returns:
            Resposta da API com message_id
        """
        pass
    
    @abstractmethod
    async def get_media_url(self, media_id: str) -> str:
        """
        Obtém URL de download de uma mídia
        
        Args:
            media_id: ID da mídia no WhatsApp
        
        Returns:
            URL para download da mídia
        """
        pass
    
    @abstractmethod
    async def download_media(
        self,
        media_url: str,
        save_path: str
    ) -> int:
        """
        Faz download de mídia e salva localmente
        
        Args:
            media_url: URL de download
            save_path: Caminho onde salvar o arquivo
        
        Returns:
            Tamanho do arquivo em bytes
        """
        pass
    
    # Métodos utilitários (implementação concreta fornecida)
    
    def validate_phone_number(self, phone: str) -> bool:
        """
        Valida formato de número de telefone
        
        Formato esperado: código do país + DDD + número
        Exemplo: 5511999999999 (Brasil)
        
        Args:
            phone: Número de telefone
        
        Returns:
            True se válido
        
        Raises:
            WhatsAppValidationError: Se inválido
        """
        # Remove espaços e caracteres especiais
        phone_clean = re.sub(r'[^\d]', '', phone)
        
        # Deve ter entre 10 e 15 dígitos
        if not 10 <= len(phone_clean) <= 15:
            raise WhatsAppValidationError(
                f"Número de telefone inválido: {phone}. "
                f"Deve ter entre 10 e 15 dígitos."
            )
        
        # Não pode começar com +
        if phone.startswith('+'):
            raise WhatsAppValidationError(
                f"Número não pode começar com '+'. Use apenas dígitos: {phone}"
            )
        
        return True
    
    def extract_message_id(
        self,
        response: Dict[str, Any]
    ) -> Optional[MessageID]:
        """
        Extrai message_id da resposta da API
        
        Args:
            response: Resposta da API do WhatsApp
        
        Returns:
            message_id ou None se não encontrado
        """
        try:
            messages = response.get("messages", [])
            if messages and len(messages) > 0:
                return messages[0].get("id")
        except (KeyError, IndexError, TypeError):
            pass
        
        return None
    
    def format_phone_number(self, phone: str) -> str:
        """
        Formata número de telefone para padrão WhatsApp
        
        Remove caracteres especiais e espaços, mantém apenas dígitos.
        
        Args:
            phone: Número com ou sem formatação
        
        Returns:
            Número formatado (apenas dígitos)
        
        Example:
            >>> format_phone_number("+55 11 99999-9999")
            "5511999999999"
        """
        return re.sub(r'[^\d]', '', phone).lstrip('+')
    
    def validate_text_length(
        self,
        text: str,
        max_length: int = 4096
    ) -> bool:
        """
        Valida tamanho do texto da mensagem
        
        Args:
            text: Texto da mensagem
            max_length: Tamanho máximo permitido (default: 4096)
        
        Returns:
            True se válido
        
        Raises:
            WhatsAppValidationError: Se texto muito longo
        """
        if len(text) > max_length:
            raise WhatsAppValidationError(
                f"Texto muito longo: {len(text)} caracteres. "
                f"Máximo: {max_length} caracteres."
            )
        
        return True
    
    async def close(self):
        """
        Fecha recursos do serviço (conexões, clients, etc)
        
        Implementações concretas podem sobrescrever para cleanup.
        """
        pass
    
    async def __aenter__(self):
        """Context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.close()
