"""
Sistema de Tickets de Atendimento

Gerencia tickets abertos pelos clientes via WhatsApp.
"""

import asyncio
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, List
from whatsapp_kit import WhatsAppService


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_CUSTOMER = "waiting_customer"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Ticket:
    """Representa um ticket de atendimento"""
    
    def __init__(
        self,
        ticket_id: str,
        phone: str,
        description: str,
        priority: TicketPriority = TicketPriority.MEDIUM
    ):
        self.id = ticket_id
        self.phone = phone
        self.description = description
        self.priority = priority
        self.status = TicketStatus.OPEN
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.assigned_to: Optional[str] = None
        self.messages: List[Dict] = []
    
    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "description": self.description,
            "priority": self.priority.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "assigned_to": self.assigned_to,
            "messages_count": len(self.messages)
        }


class TicketSystem:
    """Sistema de gerenciamento de tickets"""
    
    def __init__(self):
        self.service = WhatsAppService()
        self.tickets: Dict[str, Ticket] = {}
    
    def generate_ticket_id(self) -> str:
        """Gera ID único para ticket"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"TKT-{timestamp}"
    
    async def create_ticket(
        self,
        phone: str,
        description: str,
        priority: TicketPriority = TicketPriority.MEDIUM
    ) -> Ticket:
        """Cria novo ticket"""
        
        ticket_id = self.generate_ticket_id()
        ticket = Ticket(ticket_id, phone, description, priority)
        
        self.tickets[ticket_id] = ticket
        
        # Notificar cliente
        priority_emoji = {
            TicketPriority.LOW: "🔵",
            TicketPriority.MEDIUM: "🟡",
            TicketPriority.HIGH: "🟠",
            TicketPriority.URGENT: "🔴"
        }
        
        await self.service.send_text_message(
            to=phone,
            text=f"""
✅ *Ticket Criado com Sucesso!*

🎫 Número: *{ticket_id}*
{priority_emoji[priority]} Prioridade: {priority.value.title()}
📝 Descrição: {description}
📅 Aberto em: {ticket.created_at.strftime('%d/%m/%Y às %H:%M')}
📊 Status: Aguardando atendimento

⏱️ *Tempo Médio de Resposta:*
• Urgente: 30 minutos
• Alto: 2 horas
• Médio: 4 horas
• Baixo: 1 dia útil

_Você receberá atualizações por aqui._
"""
        )
        
        print(f"✅ Ticket {ticket_id} criado para {phone}")
        
        return ticket
    
    async def update_status(
        self,
        ticket_id: str,
        new_status: TicketStatus,
        message: Optional[str] = None
    ):
        """Atualiza status do ticket e notifica cliente"""
        
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {ticket_id} não encontrado")
        
        old_status = ticket.status
        ticket.status = new_status
        ticket.updated_at = datetime.now()
        
        # Emojis por status
        status_emoji = {
            TicketStatus.OPEN: "🆕",
            TicketStatus.IN_PROGRESS: "⚙️",
            TicketStatus.WAITING_CUSTOMER: "⏳",
            TicketStatus.RESOLVED: "✅",
            TicketStatus.CLOSED: "🔒"
        }
        
        # Mensagens por status
        status_messages = {
            TicketStatus.IN_PROGRESS: "Um atendente está trabalhando no seu ticket.",
            TicketStatus.WAITING_CUSTOMER: "Aguardamos seu retorno para continuar.",
            TicketStatus.RESOLVED: "Seu ticket foi resolvido! Se o problema persistir, responda esta mensagem.",
            TicketStatus.CLOSED: "Ticket encerrado. Obrigado pelo contato!"
        }
        
        text = f"""
{status_emoji[new_status]} *Atualização do Ticket*

🎫 Ticket: {ticket_id}
📊 Status: {old_status.value} → *{new_status.value}*
🕐 Atualizado: {ticket.updated_at.strftime('%d/%m/%Y às %H:%M')}

{status_messages.get(new_status, '')}
"""
        
        if message:
            text += f"\n\n💬 *Mensagem:*\n{message}"
        
        await self.service.send_text_message(
            to=ticket.phone,
            text=text
        )
        
        print(f"✅ Ticket {ticket_id}: {old_status.value} → {new_status.value}")
    
    async def add_message(
        self,
        ticket_id: str,
        sender: str,
        message: str,
        is_internal: bool = False
    ):
        """Adiciona mensagem ao histórico do ticket"""
        
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {ticket_id} não encontrado")
        
        msg = {
            "sender": sender,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "is_internal": is_internal
        }
        
        ticket.messages.append(msg)
        ticket.updated_at = datetime.now()
        
        # Se não for mensagem interna, enviar para cliente
        if not is_internal and sender != ticket.phone:
            await self.service.send_text_message(
                to=ticket.phone,
                text=f"""
💬 *Nova Mensagem - Ticket {ticket_id}*

👤 {sender}:
{message}

_Responda esta mensagem para continuar o atendimento._
"""
            )
    
    async def assign_ticket(
        self,
        ticket_id: str,
        agent_name: str
    ):
        """Atribui ticket a um atendente"""
        
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {ticket_id} não encontrado")
        
        ticket.assigned_to = agent_name
        ticket.status = TicketStatus.IN_PROGRESS
        ticket.updated_at = datetime.now()
        
        await self.service.send_text_message(
            to=ticket.phone,
            text=f"""
👤 *Ticket Atribuído*

🎫 Ticket: {ticket_id}
👨‍💼 Atendente: {agent_name}

{agent_name} irá ajudar você com seu ticket.
Aguarde o contato!
"""
        )
        
        print(f"✅ Ticket {ticket_id} atribuído a {agent_name}")
    
    async def request_customer_feedback(self, ticket_id: str):
        """Solicita avaliação do atendimento"""
        
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            raise ValueError(f"Ticket {ticket_id} não encontrado")
        
        await self.service.send_interactive_buttons(
            to=ticket.phone,
            header_text="📊 Avalie nosso Atendimento",
            body_text=f"""
Seu ticket *{ticket_id}* foi resolvido!

Como você avalia nosso atendimento?
""",
            buttons=[
                {"id": f"rate_good_{ticket_id}", "title": "😊 Ótimo"},
                {"id": f"rate_ok_{ticket_id}", "title": "😐 Regular"},
                {"id": f"rate_bad_{ticket_id}", "title": "😞 Ruim"}
            ],
            footer_text="Sua opinião é importante!"
        )
    
    def get_open_tickets(self) -> List[Ticket]:
        """Retorna tickets em aberto"""
        return [
            t for t in self.tickets.values()
            if t.status in [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]
        ]
    
    def get_ticket_stats(self) -> Dict:
        """Retorna estatísticas dos tickets"""
        total = len(self.tickets)
        
        by_status = {}
        by_priority = {}
        
        for ticket in self.tickets.values():
            by_status[ticket.status.value] = by_status.get(ticket.status.value, 0) + 1
            by_priority[ticket.priority.value] = by_priority.get(ticket.priority.value, 0) + 1
        
        return {
            "total": total,
            "by_status": by_status,
            "by_priority": by_priority,
            "open": len(self.get_open_tickets())
        }


async def main():
    """Exemplo de uso do sistema de tickets"""
    
    system = TicketSystem()
    phone = "5511999999999"
    
    print("🎫 Sistema de Tickets\n")
    
    # 1. Criar ticket urgente
    print("📝 Criando ticket urgente...")
    ticket1 = await system.create_ticket(
        phone=phone,
        description="Sistema de pagamento não está funcionando",
        priority=TicketPriority.URGENT
    )
    
    await asyncio.sleep(2)
    
    # 2. Atribuir a um atendente
    print("\n👨‍💼 Atribuindo ticket...")
    await system.assign_ticket(ticket1.id, "João Silva")
    
    await asyncio.sleep(2)
    
    # 3. Adicionar mensagem do atendente
    print("\n💬 Atendente enviando mensagem...")
    await system.add_message(
        ticket1.id,
        "João Silva",
        "Olá! Estou verificando o problema com o pagamento. Você pode informar qual erro aparece?"
    )
    
    await asyncio.sleep(2)
    
    # 4. Atualizar para aguardando cliente
    print("\n⏳ Aguardando resposta do cliente...")
    await system.update_status(
        ticket1.id,
        TicketStatus.WAITING_CUSTOMER
    )
    
    await asyncio.sleep(2)
    
    # 5. Resolver ticket
    print("\n✅ Resolvendo ticket...")
    await system.update_status(
        ticket1.id,
        TicketStatus.RESOLVED,
        "Problema resolvido! O gateway de pagamento foi reconfigurado."
    )
    
    await asyncio.sleep(2)
    
    # 6. Solicitar feedback
    print("\n📊 Solicitando avaliação...")
    await system.request_customer_feedback(ticket1.id)
    
    # 7. Mostrar estatísticas
    print("\n📈 Estatísticas:")
    stats = system.get_ticket_stats()
    print(f"Total de tickets: {stats['total']}")
    print(f"Por status: {stats['by_status']}")
    print(f"Por prioridade: {stats['by_priority']}")
    
    await system.service.close()
    
    print("\n✅ Exemplo concluído!")


if __name__ == "__main__":
    asyncio.run(main())
