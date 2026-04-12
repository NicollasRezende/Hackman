"""
Validadores de dados para WhatsApp

Este módulo fornece funções de validação para garantir que os dados
enviados para a API do WhatsApp estão no formato correto.
"""

import re
from typing import Optional, List
from ..core.exceptions import WhatsAppValidationError
from ..core.interfaces import IValidator


def validate_phone_number(phone: str, strict: bool = True) -> str:
    """
    Valida e formata número de telefone para WhatsApp
    
    Formato esperado: código país + DDD + número (sem +)
    Exemplo: 5511999999999 para Brasil
    
    Args:
        phone: Número de telefone
        strict: Se True, aplica validação rigorosa (default: True)
    
    Returns:
        Número formatado (apenas dígitos)
    
    Raises:
        WhatsAppValidationError: Se número inválido
    
    Example:
        >>> validate_phone_number("+55 11 99999-9999")
        "5511999999999"
        >>> validate_phone_number("5511999999999")
        "5511999999999"
    """
    if not phone:
        raise WhatsAppValidationError("Número de telefone não pode ser vazio")
    
    # Remove espaços, hífens, parênteses
    clean = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Remove + se houver
    if clean.startswith('+'):
        clean = clean[1:]
    
    # Deve conter apenas dígitos
    if not clean.isdigit():
        raise WhatsAppValidationError(
            f"Número contém caracteres inválidos: {phone}"
        )
    
    # Validação de comprimento
    if strict:
        if not (10 <= len(clean) <= 15):
            raise WhatsAppValidationError(
                f"Número com comprimento inválido: {len(clean)} dígitos. "
                f"Esperado: 10-15 dígitos. Número: {phone}"
            )
    
    return clean


def validate_message_text(text: str, max_length: int = 4096) -> bool:
    """
    Valida texto de mensagem
    
    Args:
        text: Texto da mensagem
        max_length: Comprimento máximo (default: 4096 para mensagens de texto)
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se texto inválido
    """
    if not text:
        raise WhatsAppValidationError("Texto da mensagem não pode ser vazio")
    
    if not isinstance(text, str):
        raise WhatsAppValidationError(
            f"Texto deve ser string, recebido: {type(text)}"
        )
    
    if len(text) > max_length:
        raise WhatsAppValidationError(
            f"Texto muito longo: {len(text)} caracteres. "
            f"Máximo: {max_length} caracteres."
        )
    
    return True


def validate_template_name(name: str) -> bool:
    """
    Valida nome de template WhatsApp
    
    Templates devem seguir padrão: letras minúsculas, números e underscore
    Exemplo: "payment_reminder", "welcome_message"
    
    Args:
        name: Nome do template
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se nome inválido
    """
    if not name:
        raise WhatsAppValidationError("Nome do template não pode ser vazio")
    
    # Padrão: apenas letras minúsculas, números e underscore
    pattern = r'^[a-z0-9_]+$'
    
    if not re.match(pattern, name):
        raise WhatsAppValidationError(
            f"Nome de template inválido: '{name}'. "
            f"Use apenas letras minúsculas, números e underscore. "
            f"Exemplo: 'payment_reminder'"
        )
    
    if len(name) > 512:
        raise WhatsAppValidationError(
            f"Nome de template muito longo: {len(name)} caracteres"
        )
    
    return True


def validate_media_url(url: str) -> bool:
    """
    Valida URL de mídia
    
    Args:
        url: URL da mídia
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se URL inválida
    """
    if not url:
        raise WhatsAppValidationError("URL da mídia não pode ser vazia")
    
    # Deve começar com http:// ou https://
    if not url.startswith(('http://', 'https://')):
        raise WhatsAppValidationError(
            f"URL deve começar com http:// ou https://: {url}"
        )
    
    # Validação básica de URL
    url_pattern = r'^https?://[\w\-\.]+(:\d+)?(/[\w\-\./?%&=]*)?$'
    if not re.match(url_pattern, url, re.IGNORECASE):
        raise WhatsAppValidationError(f"URL inválida: {url}")
    
    return True


def validate_button_id(button_id: str) -> bool:
    """
    Valida ID de botão interativo
    
    Args:
        button_id: ID único do botão
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se ID inválido
    """
    if not button_id:
        raise WhatsAppValidationError("ID do botão não pode ser vazio")
    
    if len(button_id) > 256:
        raise WhatsAppValidationError(
            f"ID do botão muito longo: {len(button_id)} caracteres. "
            f"Máximo: 256 caracteres."
        )
    
    return True


def validate_button_title(title: str) -> bool:
    """
    Valida título de botão
    
    Args:
        title: Título exibido no botão
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se título inválido
    """
    if not title:
        raise WhatsAppValidationError("Título do botão não pode ser vazio")
    
    if len(title) > 20:
        raise WhatsAppValidationError(
            f"Título do botão muito longo: {len(title)} caracteres. "
            f"Máximo: 20 caracteres."
        )
    
    return True


def validate_buttons_count(count: int, max_buttons: int = 3) -> bool:
    """
    Valida número de botões em mensagem interativa
    
    Args:
        count: Número de botões
        max_buttons: Máximo permitido (default: 3)
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se exceder limite
    """
    if count < 1:
        raise WhatsAppValidationError("Deve haver pelo menos 1 botão")
    
    if count > max_buttons:
        raise WhatsAppValidationError(
            f"Número de botões excede o limite: {count} > {max_buttons}"
        )
    
    return True


def validate_list_sections(sections: List, max_sections: int = 10) -> bool:
    """
    Valida seções de lista interativa
    
    Args:
        sections: Lista de seções
        max_sections: Máximo de seções (default: 10)
    
    Returns:
        True se válido
    
    Raises:
        WhatsAppValidationError: Se inválido
    """
    if not sections:
        raise WhatsAppValidationError("Lista deve ter pelo menos 1 seção")
    
    if len(sections) > max_sections:
        raise WhatsAppValidationError(
            f"Número de seções excede o limite: {len(sections)} > {max_sections}"
        )
    
    # Validar cada seção
    for i, section in enumerate(sections):
        if not isinstance(section, dict):
            raise WhatsAppValidationError(
                f"Seção {i} deve ser um dicionário"
            )
        
        if "rows" not in section:
            raise WhatsAppValidationError(
                f"Seção {i} deve conter 'rows'"
            )
        
        rows = section["rows"]
        if not rows or len(rows) > 10:
            raise WhatsAppValidationError(
                f"Seção {i}: número de rows inválido (min: 1, max: 10)"
            )
    
    return True


def validate_language_code(code: str) -> bool:
    """
    Valida código de idioma

    Args:
        code: Código do idioma (ex: pt_BR, en_US)

    Returns:
        True se válido

    Raises:
        WhatsAppValidationError: Se código inválido
    """
    if not code:
        raise WhatsAppValidationError("Código de idioma não pode ser vazio")

    # Formato esperado: xx_YY (ex: pt_BR, en_US)
    pattern = r'^[a-z]{2}_[A-Z]{2}$'

    if not re.match(pattern, code):
        raise WhatsAppValidationError(
            f"Código de idioma inválido: '{code}'. "
            f"Formato esperado: xx_YY (ex: pt_BR, en_US, es_ES)"
        )

    return True


class WhatsAppValidator(IValidator):
    """
    Implementação concreta de IValidator

    Esta classe implementa todas as validações necessárias para
    operações WhatsApp, seguindo Dependency Inversion Principle.

    Example:
        validator = WhatsAppValidator()
        phone = validator.validate_phone_number("+55 11 99999-9999")
    """

    def validate_phone_number(self, phone: str, strict: bool = True) -> str:
        """Valida e formata número de telefone"""
        return validate_phone_number(phone, strict)

    def validate_message_text(self, text: str, max_length: int = 4096) -> bool:
        """Valida texto de mensagem"""
        return validate_message_text(text, max_length)

    def validate_template_name(self, name: str) -> bool:
        """Valida nome de template"""
        return validate_template_name(name)

    def validate_media_url(self, url: str) -> bool:
        """Valida URL de mídia"""
        return validate_media_url(url)

    def validate_button_id(self, button_id: str) -> bool:
        """Valida ID de botão"""
        return validate_button_id(button_id)

    def validate_button_title(self, title: str) -> bool:
        """Valida título de botão"""
        return validate_button_title(title)

    def validate_buttons_count(self, count: int, max_buttons: int = 3) -> bool:
        """Valida número de botões"""
        return validate_buttons_count(count, max_buttons)

    def validate_list_sections(self, sections: List, max_sections: int = 10) -> bool:
        """Valida seções de lista"""
        return validate_list_sections(sections, max_sections)

    def validate_language_code(self, code: str) -> bool:
        """Valida código de idioma"""
        return validate_language_code(code)
