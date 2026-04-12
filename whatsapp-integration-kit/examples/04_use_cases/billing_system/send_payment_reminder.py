"""
Sistema de Cobrança - Enviar Lembrete de Pagamento

Este script envia um lembrete de cobrança amigável para o cliente,
incluindo detalhes da fatura e link para pagamento.
"""

import asyncio
from datetime import datetime, timedelta
from whatsapp_kit import WhatsAppService
from whatsapp_kit.utils import format_currency, format_date_br


async def send_payment_reminder(
    phone: str,
    customer_name: str,
    amount: float,
    due_date: datetime,
    invoice_number: str,
    payment_link: str
):
    """
    Envia lembrete de pagamento completo
    
    Args:
        phone: Telefone do cliente
        customer_name: Nome do cliente
        amount: Valor da fatura
        due_date: Data de vencimento
        invoice_number: Número da fatura
        payment_link: Link para pagamento
    """
    service = WhatsAppService()
    
    # Calcular dias até vencimento
    days_until_due = (due_date - datetime.now()).days
    
    # Montar mensagem personalizada
    if days_until_due > 0:
        urgency = f"Vence em {days_until_due} dias"
        emoji = "📅"
    elif days_until_due == 0:
        urgency = "Vence HOJE"
        emoji = "⚠️"
    else:
        urgency = f"Venceu há {abs(days_until_due)} dias"
        emoji = "🚨"
    
    message = f"""Olá, {customer_name}! 😊

{emoji} *Lembrete de Pagamento*

Você possui uma fatura pendente:

📄 Fatura: #{invoice_number}
💰 Valor: {format_currency(amount)}
📅 Vencimento: {format_date_br(due_date)}
⏰ Status: {urgency}

_Para sua comodidade, você pode pagar de duas formas:_

1️⃣ *Via Link* - Clique no botão abaixo
2️⃣ *Via PIX/Transferência* - Envie o comprovante aqui mesmo no WhatsApp

📸 *Importante:* Após o pagamento, envie o comprovante neste chat para confirmarmos rapidamente.

_Caso já tenha pago, desconsidere esta mensagem._

Obrigado! 🙏"""
    
    try:
        print(f"\n📤 Enviando cobrança para {customer_name} ({phone})...")
        print(f"💰 Valor: {format_currency(amount)}")
        print(f"📅 Vencimento: {format_date_br(due_date)}\n")
        
        # Enviar mensagem com botão de pagamento
        response = await service.send_cta_url(
            to=phone,
            body_text=message,
            button_text="💳 Pagar Agora",
            url=payment_link
        )
        
        message_id = service.extract_message_id(response)
        
        print(f"✅ Cobrança enviada com sucesso!")
        print(f"📨 Message ID: {message_id}\n")
        
        return {
            "success": True,
            "message_id": message_id,
            "phone": phone,
            "amount": amount
        }
        
    except Exception as e:
        print(f"❌ Erro ao enviar cobrança: {e}\n")
        return {
            "success": False,
            "error": str(e)
        }
    
    finally:
        await service.close()


async def main():
    """Exemplo de uso"""
    
    # Dados da cobrança
    cobrancas = [
        {
            "phone": "5511999999999",
            "customer_name": "João Silva",
            "amount": 150.00,
            "due_date": datetime.now() + timedelta(days=3),
            "invoice_number": "2024-001",
            "payment_link": "https://payments.example.com/invoice/2024-001"
        },
        {
            "phone": "5511888888888",
            "customer_name": "Maria Santos",
            "amount": 250.50,
            "due_date": datetime.now() + timedelta(days=1),
            "invoice_number": "2024-002",
            "payment_link": "https://payments.example.com/invoice/2024-002"
        }
    ]
    
    print("🚀 Iniciando envio de cobranças...\n")
    print("=" * 50)
    
    results = []
    for cobranca in cobrancas:
        result = await send_payment_reminder(**cobranca)
        results.append(result)
        
        # Aguardar um pouco entre envios para evitar rate limit
        await asyncio.sleep(1)
    
    # Relatório final
    print("=" * 50)
    print("\n📊 RELATÓRIO FINAL\n")
    
    success = sum(1 for r in results if r["success"])
    failed = len(results) - success
    
    print(f"✅ Enviados: {success}")
    print(f"❌ Falhas: {failed}")
    print(f"📨 Total: {len(results)}\n")


if __name__ == "__main__":
    asyncio.run(main())
