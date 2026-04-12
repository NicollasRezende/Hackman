"""
Exemplo 1: Enviar mensagem de texto simples

Este é o exemplo mais básico - enviar uma mensagem de texto para um número WhatsApp.
"""

import asyncio
from whatsapp_kit import WhatsAppService


async def main():
    """Exemplo básico de envio de mensagem"""
    
    # Inicializar serviço (carrega config do .env automaticamente)
    service = WhatsAppService()
    
    # Número do destinatário (formato: código país + DDD + número, sem +)
    phone_number = "5511999999999"  # Substitua pelo número real
    
    # Texto da mensagem
    message = "Olá! Esta é uma mensagem de teste do WhatsApp Integration Kit 🚀"
    
    try:
        # Enviar mensagem
        print(f"Enviando mensagem para {phone_number}...")
        response = await service.send_text_message(
            to=phone_number,
            text=message
        )
        
        # Extrair message_id da resposta
        message_id = service.extract_message_id(response)
        
        print(f"✅ Mensagem enviada com sucesso!")
        print(f"Message ID: {message_id}")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"❌ Erro ao enviar mensagem: {e}")
    
    finally:
        # Fechar conexões
        await service.close()


if __name__ == "__main__":
    asyncio.run(main())
