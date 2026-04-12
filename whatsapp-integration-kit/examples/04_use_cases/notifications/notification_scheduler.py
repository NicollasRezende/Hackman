"""
Sistema de Agendamento de Notificações

Permite agendar notificações para serem enviadas em data/hora específica.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from enum import Enum
import json
from whatsapp_kit import WhatsAppService


class NotificationStatus(str, Enum):
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Notification:
    """Representa uma notificação agendada"""
    
    def __init__(
        self,
        id: str,
        phone: str,
        message: str,
        scheduled_time: datetime,
        metadata: Optional[Dict] = None
    ):
        self.id = id
        self.phone = phone
        self.message = message
        self.scheduled_time = scheduled_time
        self.status = NotificationStatus.SCHEDULED
        self.metadata = metadata or {}
        self.created_at = datetime.now()
        self.sent_at: Optional[datetime] = None
        self.message_id: Optional[str] = None
        self.error: Optional[str] = None


class NotificationScheduler:
    """Sistema de agendamento de notificações"""
    
    def __init__(self):
        self.service = WhatsAppService()
        self.notifications: Dict[str, Notification] = {}
        self.is_running = False
    
    def schedule(
        self,
        phone: str,
        message: str,
        scheduled_time: datetime,
        notification_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Notification:
        """Agenda uma notificação"""
        
        if notification_id is None:
            notification_id = f"NOTIF-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        notification = Notification(
            id=notification_id,
            phone=phone,
            message=message,
            scheduled_time=scheduled_time,
            metadata=metadata
        )
        
        self.notifications[notification_id] = notification
        
        print(f"📅 Notificação agendada:")
        print(f"   ID: {notification_id}")
        print(f"   Para: {phone}")
        print(f"   Quando: {scheduled_time.strftime('%d/%m/%Y às %H:%M')}")
        
        return notification
    
    def cancel(self, notification_id: str) -> bool:
        """Cancela uma notificação agendada"""
        
        notification = self.notifications.get(notification_id)
        
        if not notification:
            return False
        
        if notification.status not in [NotificationStatus.SCHEDULED]:
            print(f"⚠️ Notificação {notification_id} não pode ser cancelada (status: {notification.status})")
            return False
        
        notification.status = NotificationStatus.CANCELLED
        print(f"❌ Notificação {notification_id} cancelada")
        
        return True
    
    async def send_notification(self, notification: Notification):
        """Envia uma notificação"""
        
        try:
            notification.status = NotificationStatus.SENDING
            
            print(f"📤 Enviando notificação {notification.id}...")
            
            response = await self.service.send_text_message(
                to=notification.phone,
                text=notification.message
            )
            
            notification.message_id = self.service.extract_message_id(response)
            notification.status = NotificationStatus.SENT
            notification.sent_at = datetime.now()
            
            print(f"✅ Notificação {notification.id} enviada")
            
        except Exception as e:
            notification.status = NotificationStatus.FAILED
            notification.error = str(e)
            print(f"❌ Erro ao enviar {notification.id}: {e}")
    
    async def process_scheduled_notifications(self):
        """Processa notificações agendadas (loop contínuo)"""
        
        self.is_running = True
        
        print("🔄 Iniciando processamento de notificações agendadas...\n")
        
        while self.is_running:
            now = datetime.now()
            
            # Buscar notificações que devem ser enviadas
            pending = [
                n for n in self.notifications.values()
                if n.status == NotificationStatus.SCHEDULED
                and n.scheduled_time <= now
            ]
            
            # Enviar cada uma
            for notification in pending:
                await self.send_notification(notification)
                await asyncio.sleep(0.5)  # Delay entre envios
            
            # Aguardar antes de verificar novamente
            await asyncio.sleep(10)  # Verifica a cada 10 segundos
    
    def stop(self):
        """Para o processamento"""
        self.is_running = False
        print("🛑 Processamento parado")
    
    def get_stats(self) -> Dict:
        """Retorna estatísticas das notificações"""
        
        total = len(self.notifications)
        by_status = {}
        
        for notification in self.notifications.values():
            status = notification.status.value
            by_status[status] = by_status.get(status, 0) + 1
        
        return {
            "total": total,
            "by_status": by_status,
            "scheduled_count": by_status.get(NotificationStatus.SCHEDULED.value, 0),
            "sent_count": by_status.get(NotificationStatus.SENT.value, 0),
            "failed_count": by_status.get(NotificationStatus.FAILED.value, 0)
        }
    
    def export_notifications(self, filename: str):
        """Exporta notificações para arquivo JSON"""
        
        data = []
        for notification in self.notifications.values():
            data.append({
                "id": notification.id,
                "phone": notification.phone,
                "message": notification.message[:50] + "...",
                "scheduled_time": notification.scheduled_time.isoformat(),
                "status": notification.status.value,
                "sent_at": notification.sent_at.isoformat() if notification.sent_at else None,
                "message_id": notification.message_id,
                "error": notification.error
            })
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Notificações exportadas para {filename}")


async def example_schedule_notifications():
    """Exemplo de agendamento de notificações"""
    
    scheduler = NotificationScheduler()
    phone = "5511999999999"
    
    print("📅 Sistema de Agendamento de Notificações\n")
    
    # 1. Agendar notificação para 10 segundos no futuro
    print("1️⃣ Agendando notificação para 10 segundos...")
    notif1 = scheduler.schedule(
        phone=phone,
        message="🔔 Esta é uma notificação agendada para 10 segundos!",
        scheduled_time=datetime.now() + timedelta(seconds=10),
        metadata={"type": "teste", "urgency": "low"}
    )
    
    # 2. Agendar para 20 segundos
    print("\n2️⃣ Agendando notificação para 20 segundos...")
    notif2 = scheduler.schedule(
        phone=phone,
        message="🎉 Segunda notificação agendada!",
        scheduled_time=datetime.now() + timedelta(seconds=20)
    )
    
    # 3. Agendar para 30 segundos e depois cancelar
    print("\n3️⃣ Agendando notificação para 30 segundos (será cancelada)...")
    notif3 = scheduler.schedule(
        phone=phone,
        message="Esta mensagem não será enviada",
        scheduled_time=datetime.now() + timedelta(seconds=30)
    )
    
    # 4. Agendar várias para o futuro
    print("\n4️⃣ Agendando campanha para 1 hora...")
    for i in range(3):
        scheduler.schedule(
            phone=phone,
            message=f"📢 Campanha promocional - Mensagem {i+1}",
            scheduled_time=datetime.now() + timedelta(hours=1, minutes=i*5),
            metadata={"campaign": "promo_2024"}
        )
    
    print(f"\n📊 Total agendado: {len(scheduler.notifications)} notificações\n")
    
    # Cancelar a terceira
    await asyncio.sleep(5)
    print("❌ Cancelando notificação 3...")
    scheduler.cancel(notif3.id)
    
    # Iniciar processamento em background
    process_task = asyncio.create_task(
        scheduler.process_scheduled_notifications()
    )
    
    # Aguardar envios
    print("\n⏳ Aguardando envios...\n")
    await asyncio.sleep(25)
    
    # Parar processamento
    scheduler.stop()
    
    # Aguardar task finalizar
    await asyncio.sleep(2)
    
    # Estatísticas
    print("\n📊 Estatísticas Finais:")
    stats = scheduler.get_stats()
    print(json.dumps(stats, indent=2))
    
    # Exportar
    scheduler.export_notifications("notifications_export.json")
    
    await scheduler.service.close()
    
    print("\n✅ Exemplo concluído!")


async def example_reminder_campaign():
    """Exemplo: Campanha de lembretes"""
    
    scheduler = NotificationScheduler()
    
    print("📣 Campanha de Lembretes\n")
    
    # Lista de clientes para lembrar
    customers = [
        {"name": "João Silva", "phone": "5511999999999", "event": "consulta"},
        {"name": "Maria Santos", "phone": "5511888888888", "event": "reunião"},
        {"name": "Pedro Costa", "phone": "5511777777777", "event": "pagamento"}
    ]
    
    # Agendar lembrete para 24h antes
    tomorrow = datetime.now() + timedelta(days=1)
    
    for customer in customers:
        message = f"""
🔔 *Lembrete*

Olá, {customer['name']}!

Você tem um(a) {customer['event']} agendado(a) para amanhã.

📅 Data: {tomorrow.strftime('%d/%m/%Y')}
⏰ Não esqueça!

_Qualquer dúvida, responda esta mensagem._
"""
        
        scheduler.schedule(
            phone=customer["phone"],
            message=message,
            scheduled_time=tomorrow - timedelta(hours=24),
            metadata={"campaign": "reminder", "event_type": customer["event"]}
        )
    
    print(f"✅ {len(customers)} lembretes agendados para 24h antes do evento")
    print("\n📊 Estatísticas:")
    print(json.dumps(scheduler.get_stats(), indent=2))
    
    await scheduler.service.close()


async def main():
    """Menu de exemplos"""
    
    print("=" * 60)
    print("  Sistema de Agendamento de Notificações WhatsApp")
    print("=" * 60)
    print()
    print("Escolha um exemplo:")
    print()
    print("1. Agendamento básico (10, 20, 30 segundos)")
    print("2. Campanha de lembretes")
    print()
    
    # Para este exemplo, vamos executar o primeiro
    await example_schedule_notifications()
    
    # Descomentar para testar o segundo:
    # await example_reminder_campaign()


if __name__ == "__main__":
    asyncio.run(main())
