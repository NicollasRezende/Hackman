"""
Sistema de Rastreamento de Pedidos

Envia atualizações automáticas de rastreamento via WhatsApp.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
from whatsapp_kit import WhatsAppService
from whatsapp_kit.utils import format_date_br


class TrackingEvent:
    """Evento de rastreamento"""
    
    def __init__(
        self,
        status: str,
        location: str,
        description: str,
        timestamp: datetime = None
    ):
        self.status = status
        self.location = location
        self.description = description
        self.timestamp = timestamp or datetime.now()


class TrackingSystem:
    """Sistema de rastreamento e notificações"""
    
    def __init__(self):
        self.service = WhatsAppService()
    
    async def send_tracking_update(
        self,
        phone: str,
        order_id: str,
        tracking_code: str,
        event: TrackingEvent
    ):
        """Envia atualização de rastreamento"""
        
        # Emoji por tipo de evento
        emoji_map = {
            "postado": "📮",
            "transito": "🚛",
            "centro_distribuicao": "🏢",
            "saiu_entrega": "🏃",
            "entregue": "✅",
            "tentativa_falha": "⚠️",
            "aguardando_retirada": "📦"
        }
        
        emoji = emoji_map.get(event.status, "📍")
        
        message = f"""
{emoji} *Atualização de Rastreamento*

🛒 Pedido: #{order_id}
📦 Código: `{tracking_code}`

*{event.description}*

📍 Local: {event.location}
🕐 Data/Hora: {format_date_br(event.timestamp, include_time=True)}
"""
        
        await self.service.send_text_message(
            to=phone,
            text=message
        )
        
        print(f"✅ Update enviado: {event.status} - {event.location}")
    
    async def send_full_tracking_history(
        self,
        phone: str,
        order_id: str,
        tracking_code: str,
        events: List[TrackingEvent]
    ):
        """Envia histórico completo de rastreamento"""
        
        # Ordenar eventos por data
        sorted_events = sorted(events, key=lambda e: e.timestamp, reverse=True)
        
        # Formatar timeline
        timeline = []
        for event in sorted_events:
            date_str = format_date_br(event.timestamp, include_time=True)
            timeline.append(f"📍 {date_str}")
            timeline.append(f"   {event.location}")
            timeline.append(f"   _{event.description}_\n")
        
        timeline_text = "\n".join(timeline)
        
        message = f"""
📊 *Histórico Completo*

🛒 Pedido: #{order_id}
📦 Rastreio: `{tracking_code}`

━━━━━━━━━━━━━━━━
{timeline_text}
━━━━━━━━━━━━━━━━

_Última atualização: {format_date_br(sorted_events[0].timestamp, include_time=True)}_
"""
        
        # Adicionar botão para rastrear online
        tracking_url = f"https://rastreamento.correios.com.br/app/index.php?codigo={tracking_code}"
        
        await self.service.send_text_message(
            to=phone,
            text=message
        )
        
        await asyncio.sleep(1)
        
        await self.service.send_cta_url(
            to=phone,
            body_text="Acompanhe em tempo real:",
            button_text="📍 Rastrear Online",
            url=tracking_url
        )
        
        print(f"✅ Histórico completo enviado")
    
    async def send_delivery_attempt_failed(
        self,
        phone: str,
        customer_name: str,
        order_id: str,
        reason: str,
        next_attempt: datetime
    ):
        """Notifica tentativa de entrega falhada"""
        
        message = f"""
⚠️ *Tentativa de Entrega não Realizada*

Olá, {customer_name}!

Tentamos entregar seu pedido *#{order_id}*, mas não conseguimos.

❌ *Motivo:* {reason}

🔄 *Nova Tentativa:*
📅 {format_date_br(next_attempt, include_time=True)}

💡 *O que fazer:*
• Esteja no endereço no horário
• Tenha documento em mãos
• Deixe portão/portaria informados

_Ou você pode retirar no centro de distribuição._
"""
        
        await self.service.send_interactive_buttons(
            to=phone,
            body_text=message,
            buttons=[
                {"id": "schedule_delivery", "title": "📅 Agendar"},
                {"id": "pickup_location", "title": "📍 Retirar"},
                {"id": "contact_support", "title": "💬 Suporte"}
            ]
        )
        
        print(f"✅ Notificação de falha enviada")
    
    async def send_available_for_pickup(
        self,
        phone: str,
        customer_name: str,
        order_id: str,
        location: str,
        deadline: datetime
    ):
        """Notifica que pedido está disponível para retirada"""
        
        message = f"""
📦 *Pedido Disponível para Retirada*

Olá, {customer_name}!

Seu pedido *#{order_id}* está aguardando retirada!

📍 *Local:*
{location}

⏰ *Horário de Atendimento:*
Seg-Sex: 8h às 18h
Sábado: 8h às 12h

⚠️ *Prazo para Retirada:*
Até {format_date_br(deadline)}

📋 *Documentos Necessários:*
• RG ou CNH
• CPF

_Após o prazo, o pedido retorna ao remetente._
"""
        
        await self.service.send_text_message(
            to=phone,
            text=message
        )
        
        print(f"✅ Notificação de retirada enviada")


async def simulate_tracking_updates():
    """Simula sequência de atualizações de rastreamento"""
    
    system = TrackingSystem()
    phone = "5511999999999"
    order_id = "ORD-2024-001"
    tracking_code = "BR123456789BR"
    
    print("📦 Simulando atualizações de rastreamento\n")
    
    # Criar eventos de rastreamento
    events = [
        TrackingEvent(
            "postado",
            "São Paulo/SP - Centro de Distribuição",
            "Objeto postado",
            datetime.now() - timedelta(days=3)
        ),
        TrackingEvent(
            "transito",
            "São Paulo/SP → Campinas/SP",
            "Objeto em trânsito - por favor aguarde",
            datetime.now() - timedelta(days=2)
        ),
        TrackingEvent(
            "centro_distribuicao",
            "Campinas/SP - Centro de Distribuição",
            "Objeto chegou à unidade de distribuição",
            datetime.now() - timedelta(days=1)
        ),
        TrackingEvent(
            "saiu_entrega",
            "Campinas/SP",
            "Objeto saiu para entrega ao destinatário",
            datetime.now()
        )
    ]
    
    # Enviar último update
    print("📍 Enviando última atualização...")
    await system.send_tracking_update(
        phone,
        order_id,
        tracking_code,
        events[-1]  # Último evento
    )
    
    await asyncio.sleep(3)
    
    # Enviar histórico completo
    print("\n📊 Enviando histórico completo...")
    await system.send_full_tracking_history(
        phone,
        order_id,
        tracking_code,
        events
    )
    
    await system.service.close()
    
    print("\n✅ Simulação concluída!")


async def main():
    await simulate_tracking_updates()


if __name__ == "__main__":
    asyncio.run(main())
