"""
Exemplo: Mensagens Interativas com Botões

Demonstra como criar mensagens com botões de resposta rápida.
Máximo: 3 botões por mensagem.
"""

import asyncio
from whatsapp_kit import WhatsAppService


async def main():
    service = WhatsAppService()
    phone_number = "5511999999999"
    
    print("=== Enviando mensagem com botões interativos ===\n")
    
    try:
        response = await service.send_interactive_buttons(
            to=phone_number,
            header_text="🔔 Nova Notificação",
            body_text="Você recebeu uma nova cobrança de R$ 150,00.\nDeseja confirmar o pagamento?",
            buttons=[
                {"id": "confirm_payment", "title": "✅ Confirmar"},
                {"id": "view_details", "title": "📄 Ver Detalhes"},
                {"id": "cancel", "title": "❌ Cancelar"}
            ],
            footer_text="Responda em até 24 horas"
        )
        
        message_id = service.extract_message_id(response)
        print(f"✅ Mensagem com botões enviada!")
        print(f"Message ID: {message_id}\n")
        
        print("💡 Dica: Quando o usuário clicar em um botão, você")
        print("   receberá um webhook com o 'id' do botão clicado.\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
    
    await service.close()


if __name__ == "__main__":
    asyncio.run(main())
