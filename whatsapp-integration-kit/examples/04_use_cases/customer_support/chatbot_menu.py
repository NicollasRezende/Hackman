"""
Sistema de Atendimento - Menu Interativo

Chatbot com menu de departamentos e FAQ automático.
Cliente escolhe opção e é direcionado para o atendimento correto.
"""

import asyncio
from datetime import datetime
from whatsapp_kit import WhatsAppService


# Base de conhecimento FAQ
FAQ_DATABASE = {
    "horario": {
        "keywords": ["horário", "horario", "atendimento", "funciona", "abre", "fecha"],
        "response": """
⏰ *Horário de Atendimento*

📅 Segunda a Sexta: 8h às 18h
📅 Sábado: 8h às 12h
📅 Domingo: Fechado

_Fora do horário, deixe sua mensagem que retornaremos!_
"""
    },
    "prazo_entrega": {
        "keywords": ["prazo", "entrega", "demora", "quanto tempo", "quando chega"],
        "response": """
📦 *Prazos de Entrega*

🚚 Capital: 2-3 dias úteis
🚚 Interior: 5-7 dias úteis
✈️ Express: 24h (taxa adicional)

_Após envio, você recebe código de rastreamento._
"""
    },
    "formas_pagamento": {
        "keywords": ["pagamento", "pagar", "cartão", "boleto", "pix"],
        "response": """
💳 *Formas de Pagamento*

✅ PIX (desconto de 5%)
✅ Cartão de crédito (até 12x)
✅ Boleto bancário (à vista)
✅ Transferência bancária

_Pagamentos aprovados em até 2h úteis._
"""
    },
    "rastreamento": {
        "keywords": ["rastrear", "rastreio", "código", "onde está", "pedido"],
        "response": """
📍 *Rastreamento de Pedido*

Para rastrear seu pedido, preciso de:
1️⃣ Número do pedido
2️⃣ CPF/CNPJ cadastrado

Ou acesse: https://example.com/rastreamento

Digite: *RASTREAR [número do pedido]*
"""
    },
    "cancelamento": {
        "keywords": ["cancelar", "desistir", "não quero", "devolução"],
        "response": """
🔄 *Política de Cancelamento*

✅ Até 7 dias: Devolução total
✅ Produto com defeito: Troca imediata
✅ Arrependimento: Reembolso em 5 dias

Para cancelar, envie:
- Número do pedido
- Motivo do cancelamento
- Foto do produto (se aplicável)
"""
    }
}


class CustomerSupportBot:
    """Chatbot de atendimento ao cliente"""
    
    def __init__(self):
        self.service = WhatsAppService()
    
    async def send_main_menu(self, phone: str, customer_name: str = None):
        """Envia menu principal de atendimento"""
        
        greeting = f"Olá, {customer_name}!" if customer_name else "Olá!"
        
        await self.service.send_interactive_buttons(
            to=phone,
            header_text="🤖 Atendimento Automático",
            body_text=f"""{greeting}

Como posso ajudar você hoje?

Escolha uma das opções abaixo ou digite sua dúvida:""",
            buttons=[
                {"id": "sales", "title": "🛒 Vendas"},
                {"id": "support", "title": "🔧 Suporte"},
                {"id": "billing", "title": "💰 Financeiro"}
            ],
            footer_text="Atendimento 24/7"
        )
    
    async def handle_sales(self, phone: str):
        """Menu de vendas"""
        
        await self.service.send_interactive_buttons(
            to=phone,
            header_text="🛒 Departamento de Vendas",
            body_text="""
O que você precisa?

📦 Ver produtos
💬 Falar com vendedor
❓ Dúvidas sobre pedido
""",
            buttons=[
                {"id": "catalog", "title": "📦 Catálogo"},
                {"id": "talk_sales", "title": "💬 Vendedor"},
                {"id": "order_doubt", "title": "❓ Dúvida"}
            ],
            footer_text="Responda em até 24h"
        )
    
    async def handle_support(self, phone: str):
        """Menu de suporte técnico"""
        
        await self.service.send_interactive_buttons(
            to=phone,
            header_text="🔧 Suporte Técnico",
            body_text="""
Como podemos ajudar?

🐛 Reportar problema
📖 Ver tutoriais
🎫 Abrir ticket
""",
            buttons=[
                {"id": "report_bug", "title": "🐛 Problema"},
                {"id": "tutorials", "title": "📖 Tutoriais"},
                {"id": "open_ticket", "title": "🎫 Ticket"}
            ],
            footer_text="Suporte especializado"
        )
    
    async def handle_billing(self, phone: str):
        """Menu financeiro"""
        
        await self.service.send_interactive_buttons(
            to=phone,
            header_text="💰 Departamento Financeiro",
            body_text="""
Selecione uma opção:

💳 Ver faturas
📄 Segunda via boleto
💸 Negociar dívida
""",
            buttons=[
                {"id": "invoices", "title": "💳 Faturas"},
                {"id": "duplicate", "title": "📄 2ª Via"},
                {"id": "negotiate", "title": "💸 Negociar"}
            ],
            footer_text="Financeiro 8h-18h"
        )
    
    async def check_faq(self, phone: str, message: str):
        """
        Verifica se mensagem contém palavra-chave do FAQ
        e responde automaticamente
        """
        
        message_lower = message.lower()
        
        for faq_key, faq_data in FAQ_DATABASE.items():
            # Verificar se alguma keyword está na mensagem
            for keyword in faq_data["keywords"]:
                if keyword in message_lower:
                    # Resposta encontrada!
                    await self.service.send_text_message(
                        to=phone,
                        text=faq_data["response"]
                    )
                    
                    # Perguntar se resolveu
                    await asyncio.sleep(1)
                    await self.service.send_interactive_buttons(
                        to=phone,
                        body_text="Isso respondeu sua dúvida?",
                        buttons=[
                            {"id": "faq_yes", "title": "✅ Sim"},
                            {"id": "faq_no", "title": "❌ Não"},
                            {"id": "faq_more", "title": "➕ Mais info"}
                        ]
                    )
                    
                    return True
        
        return False
    
    async def create_ticket(self, phone: str, issue_description: str):
        """Cria ticket de atendimento"""
        
        # Gerar ID do ticket
        ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Salvar no banco (simulado aqui)
        ticket_data = {
            "id": ticket_id,
            "phone": phone,
            "description": issue_description,
            "status": "open",
            "created_at": datetime.now().isoformat()
        }
        
        # Aqui você salvaria no banco de dados
        print(f"📋 Ticket criado: {ticket_data}")
        
        # Confirmar para cliente
        await self.service.send_text_message(
            to=phone,
            text=f"""
✅ *Ticket Criado com Sucesso!*

🎫 Número: {ticket_id}
📝 Descrição: {issue_description}
📅 Aberto em: {datetime.now().strftime('%d/%m/%Y às %H:%M')}

Um atendente entrará em contato em breve.
Tempo médio de resposta: *2 horas úteis*

_Guarde o número do ticket para acompanhamento._
"""
        )
        
        # Enviar para equipe interna (webhook, email, etc)
        print(f"🔔 Notificar equipe sobre ticket {ticket_id}")
        
        return ticket_id
    
    async def check_business_hours(self):
        """Verifica se está em horário de atendimento"""
        now = datetime.now()
        
        # Verificar dia da semana (0=segunda, 6=domingo)
        if now.weekday() == 6:  # Domingo
            return False
        
        if now.weekday() == 5:  # Sábado
            return 8 <= now.hour < 12
        
        # Segunda a sexta
        return 8 <= now.hour < 18
    
    async def send_out_of_hours_message(self, phone: str):
        """Mensagem para fora do horário"""
        
        await self.service.send_text_message(
            to=phone,
            text="""
🌙 *Atendimento Fora do Horário*

No momento estamos fechados.

⏰ Nosso horário:
📅 Seg-Sex: 8h às 18h
📅 Sábado: 8h às 12h

Deixe sua mensagem que retornaremos no próximo dia útil!

Ou use nosso FAQ automático digitando sua dúvida.
"""
        )


async def main():
    """Exemplo de uso do chatbot"""
    
    bot = CustomerSupportBot()
    phone = "5511999999999"
    
    print("🤖 Iniciando Chatbot de Atendimento\n")
    
    # 1. Verificar horário
    if await bot.check_business_hours():
        print("✅ Em horário de atendimento")
    else:
        print("🌙 Fora do horário")
        await bot.send_out_of_hours_message(phone)
        return
    
    # 2. Enviar menu principal
    print("\n📤 Enviando menu principal...")
    await bot.send_main_menu(phone, "João Silva")
    print("✅ Menu enviado\n")
    
    await asyncio.sleep(2)
    
    # 3. Simular cliente escolhendo "Suporte"
    print("📥 Cliente escolheu: Suporte")
    await bot.handle_support(phone)
    print("✅ Menu de suporte enviado\n")
    
    await asyncio.sleep(2)
    
    # 4. Simular pergunta do FAQ
    print("📥 Cliente perguntou sobre horário")
    question = "qual o horario de atendimento?"
    found = await bot.check_faq(phone, question)
    
    if found:
        print("✅ Resposta automática enviada (FAQ)\n")
    else:
        print("❌ Não encontrado no FAQ - criando ticket\n")
        await bot.create_ticket(phone, question)
    
    await bot.service.close()
    
    print("\n✅ Exemplo concluído!")
    print("\n💡 Para usar em produção:")
    print("   1. Integre com webhook (fastapi_webhook.py)")
    print("   2. Conecte com banco de dados para tickets")
    print("   3. Adicione mais itens ao FAQ")
    print("   4. Implemente transferência para humano")


if __name__ == "__main__":
    asyncio.run(main())
