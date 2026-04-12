"""
Formatadores de dados para WhatsApp

Funções utilitárias para formatar dados antes de enviar para a API.
"""

import re
from datetime import datetime
from typing import Optional


def format_phone_number(phone: str) -> str:
    """
    Formata número de telefone removendo caracteres especiais
    
    Args:
        phone: Número com ou sem formatação
    
    Returns:
        Número apenas com dígitos
    
    Example:
        >>> format_phone_number("+55 (11) 99999-9999")
        "5511999999999"
    """
    # Remove tudo exceto dígitos
    clean = re.sub(r'\D', '', phone)
    
    # Remove + se tiver
    return clean.lstrip('+')


def format_currency(value: float, currency: str = "R$") -> str:
    """
    Formata valor monetário
    
    Args:
        value: Valor numérico
        currency: Símbolo da moeda (default: R$)
    
    Returns:
        String formatada
    
    Example:
        >>> format_currency(1234.56)
        "R$ 1.234,56"
    """
    formatted = f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{currency} {formatted}"


def format_date_br(date: datetime, include_time: bool = False) -> str:
    """
    Formata data para padrão brasileiro
    
    Args:
        date: Data a formatar
        include_time: Se True, inclui horário (default: False)
    
    Returns:
        Data formatada
    
    Example:
        >>> format_date_br(datetime(2024, 1, 15))
        "15/01/2024"
        >>> format_date_br(datetime(2024, 1, 15, 14, 30), include_time=True)
        "15/01/2024 às 14:30"
    """
    if include_time:
        return date.strftime("%d/%m/%Y às %H:%M")
    return date.strftime("%d/%m/%Y")


def truncate_text(text: str, max_length: int, suffix: str = "...") -> str:
    """
    Trunca texto se exceder comprimento máximo
    
    Args:
        text: Texto original
        max_length: Comprimento máximo
        suffix: Sufixo para textos truncados (default: "...")
    
    Returns:
        Texto truncado se necessário
    
    Example:
        >>> truncate_text("Texto muito longo aqui", 10)
        "Texto m..."
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def escape_markdown(text: str) -> str:
    """
    Escapa caracteres especiais do Markdown do WhatsApp
    
    WhatsApp suporta formatação Markdown em mensagens:
    - *bold*
    - _italic_
    - ~strikethrough~
    - ```monospace```
    
    Args:
        text: Texto original
    
    Returns:
        Texto com caracteres especiais escapados
    """
    special_chars = ['*', '_', '~', '`', '[', ']', '(', ')']
    
    for char in special_chars:
        text = text.replace(char, f"\\{char}")
    
    return text


def format_list_message(items: list, numbered: bool = True) -> str:
    """
    Formata lista de itens para mensagem
    
    Args:
        items: Lista de strings
        numbered: Se True, usa numeração. Se False, usa bullets (default: True)
    
    Returns:
        String formatada
    
    Example:
        >>> format_list_message(["Item 1", "Item 2", "Item 3"])
        "1. Item 1\n2. Item 2\n3. Item 3"
    """
    if numbered:
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    else:
        return "\n".join(f"• {item}" for item in items)
