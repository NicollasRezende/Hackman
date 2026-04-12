"""
Button Messages - Mensagens com botões interativos
"""

from typing import Dict, Any, List, Optional


def create_button_message(
    to: str,
    body: str,
    buttons: List[Dict[str, str]],
    footer: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cria payload para mensagem com botões interativos

    Args:
        to: Número do destinatário
        body: Texto principal da mensagem
        buttons: Lista de botões (max 3), cada um com 'id' e 'title'
                 Exemplo: [{"id": "btn1", "title": "Opção 1"}]
        footer: Texto do rodapé (opcional, max 60 caracteres)

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> buttons = [
        ...     {"id": "view_services", "title": "Ver serviços"},
        ...     {"id": "get_quote", "title": "Orçamento"},
        ...     {"id": "contact", "title": "Falar com humano"}
        ... ]
        >>> payload = create_button_message(
        ...     "5511999999999",
        ...     "Como posso ajudar?",
        ...     buttons,
        ...     footer="Responda em até 24h"
        ... )
    """
    # Formatar botões (max 3)
    formatted_buttons = []
    for btn in buttons[:3]:
        formatted_buttons.append({
            "type": "reply",
            "reply": {
                "id": btn["id"],
                "title": btn["title"][:20]  # Max 20 caracteres
            }
        })

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {"text": body},
            "action": {"buttons": formatted_buttons}
        }
    }

    if footer:
        payload["interactive"]["footer"] = {"text": footer[:60]}

    return payload
