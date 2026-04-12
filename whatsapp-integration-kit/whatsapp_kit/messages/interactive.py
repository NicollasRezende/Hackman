"""
Interactive Messages - Mensagens interativas especiais (localização, etc)
"""

from typing import Dict, Any


def create_location_request(
    to: str,
    body: str
) -> Dict[str, Any]:
    """
    Cria payload para solicitar localização do usuário

    Args:
        to: Número do destinatário
        body: Texto da mensagem solicitando localização

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> payload = create_location_request(
        ...     "5511999999999",
        ...     "Por favor, compartilhe sua localização para agendamento"
        ... )
    """
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "location_request_message",
            "body": {"text": body},
            "action": {"name": "send_location"}
        }
    }
