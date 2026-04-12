"""
Text Messages - Mensagens de texto simples
"""

from typing import Dict, Any


def create_text_message(to: str, text: str) -> Dict[str, Any]:
    """
    Cria payload para mensagem de texto

    Args:
        to: Número do destinatário (ex: 5511999999999)
        text: Texto da mensagem

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> payload = create_text_message("5511999999999", "Olá!")
        >>> # Enviar com: client.post(url, json=payload)
    """
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"body": text}
    }
