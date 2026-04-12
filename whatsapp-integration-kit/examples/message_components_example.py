"""
Exemplo de uso dos Message Components

Demonstra como usar os componentes reutilizáveis de mensagens.
"""

import asyncio
import httpx
from whatsapp_kit import (
    create_text_message,
    create_button_message,
    create_list_message,
    create_location_request,
    create_image_message,
    create_document_message,
    create_audio_message,
    create_video_message,
)


# Configuração (ajustar com suas credenciais)
WHATSAPP_TOKEN = "seu_token_aqui"
WHATSAPP_PHONE_ID = "seu_phone_id_aqui"
BASE_URL = "https://graph.facebook.com/v22.0"


async def send_payload(payload: dict):
    """Envia payload via API do WhatsApp"""
    url = f"{BASE_URL}/{WHATSAPP_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        return response.json()


async def example_text():
    """Exemplo: Mensagem de texto simples"""
    payload = create_text_message(
        to="5511999999999",
        text="Olá! Bem-vindo ao nosso serviço."
    )

    result = await send_payload(payload)
    print(f"✅ Texto enviado: {result}")


async def example_buttons():
    """Exemplo: Mensagem com botões"""
    buttons = [
        {"id": "view_services", "title": "Ver serviços"},
        {"id": "get_quote", "title": "Orçamento"},
        {"id": "contact", "title": "Falar com humano"}
    ]

    payload = create_button_message(
        to="5511999999999",
        body="Como posso ajudar você hoje?",
        buttons=buttons,
        footer="Responda em até 24h"
    )

    result = await send_payload(payload)
    print(f"✅ Botões enviados: {result}")


async def example_list():
    """Exemplo: Lista interativa"""
    sections = [
        {
            "title": "Serviços Básicos",
            "rows": [
                {"id": "lavagem_simples", "title": "Lavagem Simples", "description": "R$ 30"},
                {"id": "lavagem_completa", "title": "Lavagem Completa", "description": "R$ 50"}
            ]
        },
        {
            "title": "Serviços Premium",
            "rows": [
                {"id": "polimento", "title": "Polimento", "description": "R$ 150"},
                {"id": "cristalizacao", "title": "Cristalização", "description": "R$ 200"}
            ]
        }
    ]

    payload = create_list_message(
        to="5511999999999",
        body="Escolha um de nossos serviços:",
        button_text="Ver opções",
        sections=sections,
        header="LavaJato Rápido",
        footer="Melhor preço da região"
    )

    result = await send_payload(payload)
    print(f"✅ Lista enviada: {result}")


async def example_location_request():
    """Exemplo: Solicitar localização"""
    payload = create_location_request(
        to="5511999999999",
        body="Por favor, compartilhe sua localização para agendamento"
    )

    result = await send_payload(payload)
    print(f"✅ Solicitação de localização enviada: {result}")


async def example_image():
    """Exemplo: Enviar imagem"""
    payload = create_image_message(
        to="5511999999999",
        image_url="https://example.com/promo.jpg",
        caption="Confira nossa promoção de verão!"
    )

    result = await send_payload(payload)
    print(f"✅ Imagem enviada: {result}")


async def example_document():
    """Exemplo: Enviar documento"""
    payload = create_document_message(
        to="5511999999999",
        document_url="https://example.com/catalogo.pdf",
        filename="Catalogo_Servicos.pdf",
        caption="Catálogo completo de serviços"
    )

    result = await send_payload(payload)
    print(f"✅ Documento enviado: {result}")


async def example_audio():
    """Exemplo: Enviar áudio"""
    payload = create_audio_message(
        to="5511999999999",
        audio_url="https://example.com/audio.mp3"
    )

    result = await send_payload(payload)
    print(f"✅ Áudio enviado: {result}")


async def example_video():
    """Exemplo: Enviar vídeo"""
    payload = create_video_message(
        to="5511999999999",
        video_url="https://example.com/tutorial.mp4",
        caption="Tutorial: Como agendar seu serviço"
    )

    result = await send_payload(payload)
    print(f"✅ Vídeo enviado: {result}")


async def main():
    """Executa todos os exemplos"""
    print("\n=== EXEMPLOS DE MESSAGE COMPONENTS ===\n")

    # Descomentar o exemplo que quiser testar:

    # await example_text()
    # await example_buttons()
    # await example_list()
    # await example_location_request()
    # await example_image()
    # await example_document()
    # await example_audio()
    # await example_video()

    print("\n✅ Componentes prontos para uso!")
    print("\nDescomente os exemplos em main() para testar.")


if __name__ == "__main__":
    asyncio.run(main())
