"""
List Messages - Mensagens com listas interativas
"""

from typing import Dict, Any, List, Optional


def create_list_message(
    to: str,
    body: str,
    button_text: str,
    sections: List[Dict[str, Any]],
    header: Optional[str] = None,
    footer: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cria payload para lista interativa (até 10 opções)

    Args:
        to: Número do destinatário
        body: Texto principal da mensagem
        button_text: Texto do botão (ex: "Ver opções", max 20 caracteres)
        sections: Lista de seções, cada uma com 'title' e 'rows'
                  Exemplo: [
                      {
                          "title": "Serviços Básicos",
                          "rows": [
                              {"id": "lavagem_simples", "title": "Lavagem Simples", "description": "R$ 30"},
                              {"id": "lavagem_completa", "title": "Lavagem Completa", "description": "R$ 50"}
                          ]
                      }
                  ]
        header: Texto do cabeçalho (opcional, max 60 caracteres)
        footer: Texto do rodapé (opcional, max 60 caracteres)

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> sections = [
        ...     {
        ...         "title": "Serviços",
        ...         "rows": [
        ...             {"id": "service1", "title": "Lavagem", "description": "R$ 30"},
        ...             {"id": "service2", "title": "Polimento", "description": "R$ 150"}
        ...         ]
        ...     }
        ... ]
        >>> payload = create_list_message(
        ...     "5511999999999",
        ...     "Escolha um serviço:",
        ...     "Ver serviços",
        ...     sections,
        ...     header="LavaJato Rápido"
        ... )
    """
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {"text": body},
            "action": {
                "button": button_text[:20],
                "sections": sections
            }
        }
    }

    if header:
        payload["interactive"]["header"] = {"type": "text", "text": header[:60]}

    if footer:
        payload["interactive"]["footer"] = {"text": footer[:60]}

    return payload
