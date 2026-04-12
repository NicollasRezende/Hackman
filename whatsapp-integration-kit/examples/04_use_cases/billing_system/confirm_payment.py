"""
Sistema de Cobrança - Confirmar Pagamento

Após verificar o comprovante, envia confirmação de pagamento ao cliente.
"""

import asyncio
from datetime import datetime
from whatsapp_kit import WhatsAppService
from whatsapp_kit.utils import format_currency, format_date_br


async def confirm_payment(
    phone: str,
    customer_name: str,
    amount: float,
    invoice_number: str,
    payment_date: datetime = None
):
    """
    Envia confirmação de pagamento recebido
    
    Args:
        phone: Telefone do cliente
        customer_name: Nome do cliente
        amount: Valor pago
        invoice_number: Número da fatura
        payment_date: Data do pagamento (default: hoje)
    """
    service = WhatsAppService()
    
    if payment_date is None:
        payment_date = datetime.now()
    
    message = f"""Olá, {customer_name}! 😊

✅ *Pagamento Confirmado!*

Recebemos e confirmamos seu pagamento:

📄 Fatura: #{invoice_number}
💰 Valor: {format_currency(amount)}
📅 Data: {format_date_br(payment_date, include_time=True)}

Está tudo certo! Obrigado! 🎉

_Em caso de dúvidas, estamos à disposição._"""
    
    try:
        print(f"\n📤 Enviando confirmação para {customer_name} ({phone})...")
        
        response = await service.send_text_message(
            to=phone,
            text=message
        )
        
        message_id = service.extract_message_id(response)
        
        print(f"✅ Confirmação enviada!")
        print(f"📨 Message ID: {message_id}\n")
        
        return {"success": True, "message_id": message_id}
        
    except Exception as e:
        print(f"❌ Erro: {e}\n")
        return {"success": False, "error": str(e)}
    
    finally:
        await service.close()


async def main():
    """Exemplo de uso"""
    
    await confirm_payment(
        phone="5511999999999",
        customer_name="João Silva",
        amount=150.00,
        invoice_number="2024-001",
        payment_date=datetime.now()
    )


if __name__ == "__main__":
    asyncio.run(main())
