"""
Exemplo: CTA (Call-to-Action) com URL

Envia mensagem com botão que abre uma URL externa.
Ideal para links de pagamento, formulários, sites, etc.
"""

import asyncio
from whatsapp_kit import WhatsAppService


async def main():
    service = WhatsAppService()
    phone_number = "5511999999999"
    
    print("=== Enviando CTA com link de pagamento ===\n")
    
    try:
        response = await service.send_cta_url(
            to=phone_number,
            body_text=(
                "🔔 Sua fatura de R$ 150,00 vence amanhã!\n\n"
                "📅 Vencimento: 15/02/2024\n"
                "📄 Referência: Parcela 3/12\n\n"
                "Clique no botão abaixo para pagar com segurança."
            ),
            button_text="💳 Pagar Agora",
            url="https://payments.example.com/invoice/abc123"
        )
        
        message_id = service.extract_message_id(response)
        print(f"✅ CTA enviado com sucesso!")
        print(f"Message ID: {message_id}\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    await service.close()


if __name__ == "__main__":
    asyncio.run(main())
