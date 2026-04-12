"""
Exemplo 2: Enviar mensagem template

Templates são mensagens pré-aprovadas pelo WhatsApp que você pode usar
para iniciar conversas com clientes.
"""

import asyncio
from whatsapp_kit import WhatsAppService


async def main():
    """Exemplo de envio de template"""
    
    service = WhatsAppService()
    phone_number = "5511999999999"
    
    print("=== Exemplo 1: Template simples sem parâmetros ===\n")
    
    try:
        # Template "hello_world" (disponível por padrão para testes)
        response = await service.send_template(
            to=phone_number,
            template_name="hello_world",
            language_code="en_US"
        )
        
        message_id = service.extract_message_id(response)
        print(f"✅ Template enviado! Message ID: {message_id}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    print("=== Exemplo 2: Template com parâmetros ===\n")
    
    try:
        # Template customizado com parâmetros
        # Este template deve estar criado e aprovado no Meta Business Manager
        response = await service.send_template(
            to=phone_number,
            template_name="payment_reminder",  # Nome do seu template
            language_code="pt_BR",
            components=[
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": "João Silva"},
                        {"type": "text", "text": "R$ 150,00"},
                        {"type": "text", "text": "15/02/2024"}
                    ]
                }
            ]
        )
        
        message_id = service.extract_message_id(response)
        print(f"✅ Template com parâmetros enviado! Message ID: {message_id}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    await service.close()


if __name__ == "__main__":
    asyncio.run(main())
