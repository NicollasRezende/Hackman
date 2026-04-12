"""
Classes auxiliares para operações comuns

Este módulo fornece helpers para operações que não são responsabilidade
direta das classes principais, seguindo Single Responsibility Principle.
"""

from typing import Dict, Any, Optional
import re


class MessageHelper:
    """Helper para operações com mensagens WhatsApp"""

    @staticmethod
    def extract_message_id(response: Dict[str, Any]) -> Optional[str]:
        """
        Extrai message_id da resposta da API

        Args:
            response: Resposta da API do WhatsApp

        Returns:
            message_id ou None se não encontrado

        Example:
            >>> response = {"messages": [{"id": "wamid.abc123"}]}
            >>> MessageHelper.extract_message_id(response)
            "wamid.abc123"
        """
        try:
            messages = response.get("messages", [])
            if messages and len(messages) > 0:
                return messages[0].get("id")
        except (KeyError, IndexError, TypeError):
            pass

        return None

    @staticmethod
    def truncate_text(text: str, max_length: int, suffix: str = "...") -> str:
        """
        Trunca texto se exceder comprimento máximo

        Args:
            text: Texto original
            max_length: Comprimento máximo
            suffix: Sufixo para indicar truncamento

        Returns:
            Texto truncado se necessário
        """
        if len(text) <= max_length:
            return text

        return text[:max_length - len(suffix)] + suffix

    @staticmethod
    def sanitize_text(text: str) -> str:
        """
        Remove caracteres problemáticos do texto

        Args:
            text: Texto original

        Returns:
            Texto sanitizado
        """
        # Remove caracteres de controle, mantém quebras de linha
        return re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)


class PhoneHelper:
    """Helper para operações com números de telefone"""

    @staticmethod
    def format_phone_number(phone: str) -> str:
        """
        Formata número de telefone para padrão WhatsApp

        Remove caracteres especiais e espaços, mantém apenas dígitos.

        Args:
            phone: Número com ou sem formatação

        Returns:
            Número formatado (apenas dígitos)

        Example:
            >>> PhoneHelper.format_phone_number("+55 11 99999-9999")
            "5511999999999"
        """
        # Remove tudo exceto dígitos
        clean = re.sub(r'[^\d]', '', phone)

        # Remove + se houver no início da string original
        if phone.strip().startswith('+'):
            return clean

        return clean

    @staticmethod
    def mask_phone_number(phone: str, visible_digits: int = 4) -> str:
        """
        Mascara número de telefone para logs/exibição

        Args:
            phone: Número completo
            visible_digits: Quantos dígitos finais manter visíveis

        Returns:
            Número mascarado

        Example:
            >>> PhoneHelper.mask_phone_number("5511999999999")
            "55119999*****"
        """
        if len(phone) <= visible_digits:
            return phone

        mask_length = len(phone) - visible_digits
        return phone[:4] + "*" * mask_length + phone[-visible_digits:]


class ResponseHelper:
    """Helper para manipulação de respostas da API"""

    @staticmethod
    def is_success(response: Dict[str, Any]) -> bool:
        """
        Verifica se resposta indica sucesso

        Args:
            response: Resposta da API

        Returns:
            True se bem-sucedido
        """
        # Se tem messages, é sucesso
        if "messages" in response:
            return True

        # Se tem error, é falha
        if "error" in response:
            return False

        # Se tem success field
        if "success" in response:
            return response["success"]

        # Default: considera sucesso se não tem error
        return True

    @staticmethod
    def extract_error_message(response: Dict[str, Any]) -> Optional[str]:
        """
        Extrai mensagem de erro da resposta

        Args:
            response: Resposta da API

        Returns:
            Mensagem de erro ou None
        """
        try:
            error_obj = response.get("error", {})
            return error_obj.get("message")
        except (KeyError, TypeError):
            return None

    @staticmethod
    def extract_error_code(response: Dict[str, Any]) -> Optional[int]:
        """
        Extrai código de erro da resposta

        Args:
            response: Resposta da API

        Returns:
            Código de erro ou None
        """
        try:
            error_obj = response.get("error", {})
            return error_obj.get("code")
        except (KeyError, TypeError):
            return None
