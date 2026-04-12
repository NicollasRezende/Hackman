"""
Sistema de Confirmação de Pedidos

Fluxo completo de notificações de pedido via WhatsApp:
- Confirmação de pedido
- Pagamento aprovado
- Em separação
- Enviado (com rastreio)
- Entregue
- Avaliação
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
from enum import Enum
from whatsapp_kit import WhatsAppService
from whatsapp_kit.utils import format_currency, format_date_br


class OrderStatus(str, Enum):
    CREATED = "created"
    PAYMENT_APPROVED = "payment_approved"
    SEPARATING = "separating"
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItem:
    """Item do pedido"""
    
    def __init__(self, name: str, quantity: int, price: float):
        self.name = name
        self.quantity = quantity
        self.price = price
    
    @property
    def total(self) -> float:
        return self.quantity * self.price


class Order:
    """Pedido completo"""
    
    def __init__(
        self,
        order_id: str,
        customer_name: str,
        customer_phone: str,
        items: List[OrderItem],
        shipping_address: str
    ):
        self.id = order_id
        self.customer_name = customer_name
        self.customer_phone = customer_phone
        self.items = items
        self.shipping_address = shipping_address
        self.status = OrderStatus.CREATED
        self.created_at = datetime.now()
        self.tracking_code: str = None
        self.estimated_delivery: datetime = None
    
    @property
    def subtotal(self) -> float:
        return sum(item.total for item in self.items)
    
    @property
    def shipping_fee(self) -> float:
        # Simulação: frete grátis acima de R$ 100
        return 0 if self.subtotal >= 100 else 15.0
    
    @property
    def total(self) -> float:
        return self.subtotal + self.shipping_fee


class OrderNotificationSystem:
    """Sistema de notificações de pedido"""
    
    def __init__(self):
        self.service = WhatsAppService()
    
    async def send_order_confirmation(self, order: Order):
        """Envia confirmação de pedido criado"""
        
        # Formatar lista de produtos
        items_text = "\n".join([
            f"• {item.quantity}x {item.name} - {format_currency(item.total)}"
            for item in order.items
        ])
        
        shipping_text = "🎉 Frete GRÁTIS" if order.shipping_fee == 0 else f"📦 Frete: {format_currency(order.shipping_fee)}"
        
        message = f"""
✅ *Pedido Confirmado!*

Olá, {order.customer_name}! 😊

Seu pedido foi recebido com sucesso:

🛒 *Pedido #{order.id}*
📅 Data: {format_date_br(order.created_at, include_time=True)}

*Produtos:*
{items_text}

━━━━━━━━━━━━━━━━
💰 Subtotal: {format_currency(order.subtotal)}
{shipping_text}
━━━━━━━━━━━━━━━━
💳 *TOTAL: {format_currency(order.total)}*

📍 *Entrega em:*
{order.shipping_address}

⏱️ Você receberá atualizações em cada etapa!

_Obrigado por comprar conosco!_ 🎉
"""
        
        await self.service.send_text_message(
            to=order.customer_phone,
            text=message
        )
        
        print(f"✅ Confirmação enviada para pedido {order.id}")
    
    async def send_payment_approved(self, order: Order):
        """Notifica pagamento aprovado"""
        
        order.status = OrderStatus.PAYMENT_APPROVED
        
        message = f"""
💳 *Pagamento Aprovado!*

Olá, {order.customer_name}!

O pagamento do pedido *#{order.id}* foi aprovado! 🎉

💰 Valor: {format_currency(order.total)}
✅ Status: Pagamento confirmado

Agora vamos preparar seu pedido para envio.

_Você receberá uma nova notificação quando o pedido for despachado._
"""
        
        await self.service.send_text_message(
            to=order.customer_phone,
            text=message
        )
        
        print(f"✅ Pagamento aprovado: pedido {order.id}")
    
    async def send_separating_notification(self, order: Order):
        """Notifica que pedido está sendo separado"""
        
        order.status = OrderStatus.SEPARATING
        
        message = f"""
📦 *Pedido em Preparação*

Olá, {order.customer_name}!

Seu pedido *#{order.id}* está sendo preparado! 📦✨

Estamos separando os produtos com muito cuidado.

⏱️ Previsão de despacho: *até 24 horas*

_Logo seu pedido estará a caminho!_
"""
        
        await self.service.send_text_message(
            to=order.customer_phone,
            text=message
        )
        
        print(f"✅ Em separação: pedido {order.id}")
    
    async def send_shipped_notification(self, order: Order, tracking_code: str):
        """Notifica que pedido foi enviado com código de rastreio"""
        
        order.status = OrderStatus.SHIPPED
        order.tracking_code = tracking_code
        order.estimated_delivery = datetime.now() + timedelta(days=5)
        
        tracking_url = f"https://rastreamento.correios.com.br/app/index.php?codigo={tracking_code}"
        
        message = f"""
🚚 *Pedido Enviado!*

Olá, {order.customer_name}!

Seu pedido *#{order.id}* foi enviado! 📦🚚

📍 *Código de Rastreamento:*
`{tracking_code}`

📅 *Previsão de Entrega:*
{format_date_br(order.estimated_delivery)}

_Clique no botão abaixo para rastrear:_
"""
        
        # Enviar mensagem com botão de rastreamento
        await self.service.send_cta_url(
            to=order.customer_phone,
            body_text=message,
            button_text="📍 Rastrear Pedido",
            url=tracking_url
        )
        
        print(f"✅ Enviado: pedido {order.id} - Rastreio: {tracking_code}")
    
    async def send_in_transit_update(self, order: Order, location: str):
        """Atualização de pedido em trânsito"""
        
        order.status = OrderStatus.IN_TRANSIT
        
        message = f"""
🚛 *Pedido em Trânsito*

Olá, {order.customer_name}!

Seu pedido *#{order.id}* está a caminho!

📍 Localização atual: {location}
📅 Previsão: {format_date_br(order.estimated_delivery)}

_Fique de olho! Logo estará aí!_ 👀
"""
        
        await self.service.send_text_message(
            to=order.customer_phone,
            text=message
        )
        
        print(f"✅ Em trânsito: pedido {order.id} - {location}")
    
    async def send_out_for_delivery(self, order: Order):
        """Notifica que pedido saiu para entrega"""
        
        order.status = OrderStatus.OUT_FOR_DELIVERY
        
        message = f"""
🏃 *Saiu para Entrega!*

Olá, {order.customer_name}!

Seu pedido *#{order.id}* saiu para entrega! 🎉

📦 O entregador está a caminho!
📅 Entrega prevista: *HOJE*
📍 {order.shipping_address}

⚠️ *Importante:*
• Tenha documento em mãos
• Alguém precisa estar no endereço

_Fique atento! Chegando em breve!_ 🚀
"""
        
        await self.service.send_text_message(
            to=order.customer_phone,
            text=message
        )
        
        print(f"✅ Saiu para entrega: pedido {order.id}")
    
    async def send_delivered_confirmation(self, order: Order):
        """Confirma entrega e solicita avaliação"""
        
        order.status = OrderStatus.DELIVERED
        
        message = f"""
✅ *Pedido Entregue!*

Olá, {order.customer_name}!

Seu pedido *#{order.id}* foi entregue! 🎉📦

Esperamos que você goste dos produtos!

_Algum problema com o pedido?_
Responda esta mensagem que te ajudamos!
"""
        
        await self.service.send_text_message(
            to=order.customer_phone,
            text=message
        )
        
        # Aguardar um pouco e solicitar avaliação
        await asyncio.sleep(2)
        
        await self.service.send_interactive_buttons(
            to=order.customer_phone,
            header_text="⭐ Avalie sua Experiência",
            body_text="Como foi sua experiência com a compra?",
            buttons=[
                {"id": f"rate_good_{order.id}", "title": "😍 Excelente"},
                {"id": f"rate_ok_{order.id}", "title": "😊 Bom"},
                {"id": f"rate_bad_{order.id}", "title": "😞 Ruim"}
            ],
            footer_text="Sua opinião é muito importante!"
        )
        
        print(f"✅ Entregue: pedido {order.id}")
    
    async def send_reorder_offer(self, order: Order):
        """Oferece comprar novamente"""
        
        message = f"""
🛒 *Gostou dos Produtos?*

Que tal comprar novamente? 

Temos novidades esperando por você! 🎁

_Clique no botão para ver nosso catálogo:_
"""
        
        await self.service.send_cta_url(
            to=order.customer_phone,
            body_text=message,
            button_text="🛒 Ver Catálogo",
            url="https://example.com/catalog"
        )
        
        print(f"✅ Oferta de recompra enviada: {order.id}")


async def simulate_full_order_flow():
    """Simula fluxo completo de um pedido"""
    
    # Criar pedido
    items = [
        OrderItem("Camiseta Básica Branca", 2, 49.90),
        OrderItem("Calça Jeans Slim", 1, 129.90),
        OrderItem("Tênis Esportivo", 1, 199.90)
    ]
    
    order = Order(
        order_id="ORD-2024-001",
        customer_name="João Silva",
        customer_phone="5511999999999",
        items=items,
        shipping_address="Rua das Flores, 123 - São Paulo/SP"
    )
    
    system = OrderNotificationSystem()
    
    print("🛒 Iniciando fluxo de pedido completo\n")
    print(f"Pedido: {order.id}")
    print(f"Cliente: {order.customer_name}")
    print(f"Total: {format_currency(order.total)}\n")
    print("=" * 50)
    
    # 1. Confirmação de pedido
    print("\n📋 1. Enviando confirmação de pedido...")
    await system.send_order_confirmation(order)
    await asyncio.sleep(3)
    
    # 2. Pagamento aprovado
    print("\n💳 2. Pagamento aprovado...")
    await system.send_payment_approved(order)
    await asyncio.sleep(3)
    
    # 3. Em separação
    print("\n📦 3. Pedido em separação...")
    await system.send_separating_notification(order)
    await asyncio.sleep(3)
    
    # 4. Enviado com rastreio
    print("\n🚚 4. Pedido enviado...")
    await system.send_shipped_notification(order, "BR123456789BR")
    await asyncio.sleep(3)
    
    # 5. Em trânsito
    print("\n🚛 5. Atualização de trânsito...")
    await system.send_in_transit_update(order, "São Paulo/SP")
    await asyncio.sleep(3)
    
    # 6. Saiu para entrega
    print("\n🏃 6. Saiu para entrega...")
    await system.send_out_for_delivery(order)
    await asyncio.sleep(3)
    
    # 7. Entregue + Avaliação
    print("\n✅ 7. Pedido entregue...")
    await system.send_delivered_confirmation(order)
    await asyncio.sleep(3)
    
    # 8. Oferta de recompra
    print("\n🛒 8. Oferecendo nova compra...")
    await system.send_reorder_offer(order)
    
    await system.service.close()
    
    print("\n" + "=" * 50)
    print("✅ Fluxo completo executado com sucesso!")
    print("\n💡 Integre este fluxo com:")
    print("   • Seu e-commerce")
    print("   • Sistema de pagamento")
    print("   • API dos Correios")
    print("   • Banco de dados de pedidos")


async def main():
    await simulate_full_order_flow()


if __name__ == "__main__":
    asyncio.run(main())
