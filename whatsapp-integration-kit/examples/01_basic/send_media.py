"""
Exemplo 3: Enviar mídia (imagem, documento, vídeo, áudio)

Demonstra como enviar diferentes tipos de mídia via WhatsApp.
"""

import asyncio
from whatsapp_kit import WhatsAppService


async def main():
    """Exemplos de envio de mídia"""
    
    service = WhatsAppService()
    phone_number = "5511999999999"
    
    print("=== Exemplo 1: Enviar Imagem ===\n")
    
    try:
        response = await service.send_media(
            to=phone_number,
            media_type="image",
            media_url="https://example.com/image.jpg",  # URL pública da imagem
            caption="Confira esta imagem! 📸"
        )
        
        print(f"✅ Imagem enviada: {service.extract_message_id(response)}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    print("=== Exemplo 2: Enviar Documento PDF ===\n")
    
    try:
        response = await service.send_media(
            to=phone_number,
            media_type="document",
            media_url="https://example.com/invoice.pdf",
            filename="fatura_janeiro_2024.pdf"
        )
        
        print(f"✅ Documento enviado: {service.extract_message_id(response)}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    print("=== Exemplo 3: Enviar Vídeo ===\n")
    
    try:
        response = await service.send_media(
            to=phone_number,
            media_type="video",
            media_url="https://example.com/video.mp4",
            caption="Tutorial em vídeo 🎥"
        )
        
        print(f"✅ Vídeo enviado: {service.extract_message_id(response)}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    print("=== Exemplo 4: Enviar Áudio ===\n")
    
    try:
        response = await service.send_media(
            to=phone_number,
            media_type="audio",
            media_url="https://example.com/audio.mp3"
        )
        
        print(f"✅ Áudio enviado: {service.extract_message_id(response)}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    await service.close()


if __name__ == "__main__":
    asyncio.run(main())
