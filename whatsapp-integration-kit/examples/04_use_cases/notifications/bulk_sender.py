"""
Sistema de Envio em Massa

Envia mensagens para múltiplos destinatários com:
- Rate limiting
- Retry automático
- Personalização por destinatário
- Relatório detalhado
"""

import asyncio
from datetime import datetime
from typing import List, Dict, Optional
from asyncio import Semaphore
import json
from whatsapp_kit import WhatsAppService
from whatsapp_kit.core.exceptions import (
    WhatsAppRateLimitError,
    WhatsAppTimeoutError,
    WhatsAppAPIError
)


class Recipient:
    """Destinatário com dados de personalização"""
    
    def __init__(self, phone: str, name: str, **kwargs):
        self.phone = phone
        self.name = name
        self.custom_data = kwargs  # Dados extras para personalização


class BulkSendResult:
    """Resultado de envio em massa"""
    
    def __init__(self):
        self.total = 0
        self.success = 0
        self.failed = 0
        self.details: List[Dict] = []
        self.start_time = datetime.now()
        self.end_time: Optional[datetime] = None
    
    def add_success(self, phone: str, message_id: str):
        """Registra sucesso"""
        self.success += 1
        self.details.append({
            "phone": phone,
            "status": "success",
            "message_id": message_id,
            "timestamp": datetime.now().isoformat()
        })
    
    def add_failure(self, phone: str, error: str):
        """Registra falha"""
        self.failed += 1
        self.details.append({
            "phone": phone,
            "status": "failed",
            "error": error,
            "timestamp": datetime.now().isoformat()
        })
    
    def finalize(self):
        """Finaliza o envio"""
        self.end_time = datetime.now()
    
    @property
    def duration(self) -> float:
        """Duração total em segundos"""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (datetime.now() - self.start_time).total_seconds()
    
    @property
    def success_rate(self) -> float:
        """Taxa de sucesso (%)"""
        if self.total == 0:
            return 0
        return (self.success / self.total) * 100
    
    def to_dict(self) -> Dict:
        """Converte para dicionário"""
        return {
            "total": self.total,
            "success": self.success,
            "failed": self.failed,
            "success_rate": f"{self.success_rate:.2f}%",
            "duration_seconds": round(self.duration, 2),
            "messages_per_second": round(self.success / self.duration if self.duration > 0 else 0, 2),
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "details": self.details
        }


class BulkSender:
    """Sistema de envio em massa"""
    
    def __init__(
        self,
        max_concurrent: int = 10,
        delay_between_messages: float = 0.5,
        max_retries: int = 3
    ):
        self.service = WhatsAppService()
        self.max_concurrent = max_concurrent
        self.delay = delay_between_messages
        self.max_retries = max_retries
        self.blacklist: set = set()  # Números que não devem receber
    
    def add_to_blacklist(self, phone: str):
        """Adiciona número à blacklist"""
        self.blacklist.add(phone)
        print(f"🚫 {phone} adicionado à blacklist")
    
    def personalize_message(self, template: str, recipient: Recipient) -> str:
        """Personaliza mensagem com dados do destinatário"""
        
        message = template.replace("{nome}", recipient.name)
        message = message.replace("{telefone}", recipient.phone)
        
        # Substituir dados customizados
        for key, value in recipient.custom_data.items():
            placeholder = "{" + key + "}"
            message = message.replace(placeholder, str(value))
        
        return message
    
    async def send_to_one(
        self,
        recipient: Recipient,
        message: str,
        result: BulkSendResult,
        semaphore: Semaphore
    ):
        """Envia para um destinatário com controle de concorrência"""
        
        async with semaphore:
            # Verificar blacklist
            if recipient.phone in self.blacklist:
                result.add_failure(recipient.phone, "In blacklist")
                return
            
            # Tentar enviar com retry
            for attempt in range(self.max_retries):
                try:
                    response = await self.service.send_text_message(
                        to=recipient.phone,
                        text=message
                    )
                    
                    message_id = self.service.extract_message_id(response)
                    result.add_success(recipient.phone, message_id)
                    
                    print(f"✅ {recipient.name} ({recipient.phone})")
                    
                    # Delay entre mensagens
                    await asyncio.sleep(self.delay)
                    return
                    
                except WhatsAppRateLimitError as e:
                    print(f"⚠️ Rate limit - aguardando...")
                    if e.retry_after:
                        await asyncio.sleep(e.retry_after)
                    else:
                        await asyncio.sleep(5)
                    continue
                    
                except WhatsAppTimeoutError:
                    print(f"⚠️ Timeout - tentativa {attempt + 1}/{self.max_retries}")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(2 ** attempt)  # Backoff exponencial
                        continue
                    else:
                        result.add_failure(recipient.phone, "Timeout after retries")
                        return
                        
                except WhatsAppAPIError as e:
                    result.add_failure(recipient.phone, f"API Error: {e.message}")
                    print(f"❌ {recipient.name} ({recipient.phone}): {e.message}")
                    return
                    
                except Exception as e:
                    result.add_failure(recipient.phone, f"Unknown error: {str(e)}")
                    print(f"❌ {recipient.name} ({recipient.phone}): {str(e)}")
                    return
    
    async def send_bulk(
        self,
        recipients: List[Recipient],
        message_template: str,
        personalize: bool = True
    ) -> BulkSendResult:
        """
        Envia mensagens em massa
        
        Args:
            recipients: Lista de destinatários
            message_template: Template da mensagem (use {nome}, {campo_customizado})
            personalize: Se True, personaliza mensagem para cada destinatário
        
        Returns:
            BulkSendResult com estatísticas
        """
        
        result = BulkSendResult()
        result.total = len(recipients)
        
        print(f"\n📤 Iniciando envio em massa")
        print(f"📊 Total de destinatários: {result.total}")
        print(f"⚙️ Concorrência máxima: {self.max_concurrent}")
        print(f"⏱️ Delay entre mensagens: {self.delay}s")
        print(f"🔁 Máximo de tentativas: {self.max_retries}")
        print()
        
        # Criar semáforo para controle de concorrência
        semaphore = Semaphore(self.max_concurrent)
        
        # Criar tasks para todos os envios
        tasks = []
        for recipient in recipients:
            # Personalizar mensagem se necessário
            if personalize:
                message = self.personalize_message(message_template, recipient)
            else:
                message = message_template
            
            task = self.send_to_one(recipient, message, result, semaphore)
            tasks.append(task)
        
        # Executar todos em paralelo (com semáforo controlando concorrência)
        await asyncio.gather(*tasks)
        
        result.finalize()
        
        print()
        print("=" * 60)
        print("📊 RELATÓRIO FINAL")
        print("=" * 60)
        print(f"✅ Sucesso: {result.success}/{result.total} ({result.success_rate:.1f}%)")
        print(f"❌ Falhas: {result.failed}/{result.total}")
        print(f"⏱️ Duração: {result.duration:.2f}s")
        print(f"📈 Taxa: {result.success / result.duration if result.duration > 0 else 0:.2f} msg/s")
        print("=" * 60)
        
        return result
    
    async def send_segmented_campaign(
        self,
        segments: Dict[str, List[Recipient]],
        message_templates: Dict[str, str]
    ) -> Dict[str, BulkSendResult]:
        """
        Envia campanha segmentada
        
        Args:
            segments: Dict com nome_segmento: lista_destinatarios
            message_templates: Dict com nome_segmento: mensagem
        
        Returns:
            Dict com resultados por segmento
        """
        
        results = {}
        
        print("\n🎯 Campanha Segmentada")
        print(f"📊 Total de segmentos: {len(segments)}\n")
        
        for segment_name, recipients in segments.items():
            print(f"\n📍 Enviando para segmento: {segment_name}")
            print(f"   Destinatários: {len(recipients)}")
            
            template = message_templates.get(segment_name, message_templates.get("default", ""))
            
            result = await self.send_bulk(recipients, template)
            results[segment_name] = result
            
            # Delay entre segmentos
            await asyncio.sleep(2)
        
        return results


async def example_simple_bulk():
    """Exemplo simples de envio em massa"""
    
    sender = BulkSender(
        max_concurrent=5,
        delay_between_messages=0.5
    )
    
    # Lista de destinatários
    recipients = [
        Recipient("5511999999999", "João Silva", cidade="São Paulo"),
        Recipient("5511888888888", "Maria Santos", cidade="Rio de Janeiro"),
        Recipient("5511777777777", "Pedro Costa", cidade="Belo Horizonte"),
        Recipient("5511666666666", "Ana Paula", cidade="Curitiba"),
        Recipient("5511555555555", "Carlos Lima", cidade="Porto Alegre")
    ]
    
    # Template de mensagem
    message = """
🎉 *Promoção Especial!*

Olá, {nome}!

Temos uma oferta exclusiva para {cidade}!

💰 *50% OFF* em todos os produtos
📅 Válido até domingo

Aproveite!
"""
    
    # Enviar
    result = await sender.send_bulk(recipients, message, personalize=True)
    
    # Salvar relatório
    with open("bulk_send_report.json", "w", encoding="utf-8") as f:
        json.dump(result.to_dict(), f, indent=2, ensure_ascii=False)
    
    print("\n💾 Relatório salvo em bulk_send_report.json")
    
    await sender.service.close()


async def example_segmented_campaign():
    """Exemplo de campanha segmentada"""
    
    sender = BulkSender(max_concurrent=5)
    
    # Segmentos
    segments = {
        "vip": [
            Recipient("5511999999999", "João VIP", saldo_pontos="1500"),
            Recipient("5511888888888", "Maria VIP", saldo_pontos="2000")
        ],
        "regular": [
            Recipient("5511777777777", "Pedro Regular"),
            Recipient("5511666666666", "Ana Regular")
        ],
        "novos": [
            Recipient("5511555555555", "Carlos Novo", cupom="BEMVINDO20")
        ]
    }
    
    # Templates por segmento
    templates = {
        "vip": """
⭐ *Cliente VIP*

Olá, {nome}!

Você tem {saldo_pontos} pontos acumulados!

🎁 Resgate agora e ganhe brindes exclusivos.
""",
        "regular": """
📣 *Novidades!*

Olá, {nome}!

Confira nossos lançamentos desta semana!
""",
        "novos": """
👋 *Bem-vindo!*

Olá, {nome}!

Use o cupom *{cupom}* em sua primeira compra!
"""
    }
    
    # Enviar campanha
    results = await sender.send_segmented_campaign(segments, templates)
    
    # Relatório consolidado
    print("\n📊 Relatório Consolidado:")
    for segment, result in results.items():
        print(f"\n{segment.upper()}:")
        print(f"  ✅ {result.success}/{result.total} enviados")
        print(f"  📈 Taxa: {result.success_rate:.1f}%")
    
    await sender.service.close()


async def main():
    """Menu de exemplos"""
    
    print("=" * 60)
    print("  Sistema de Envio em Massa WhatsApp")
    print("=" * 60)
    print()
    
    # Executar exemplo simples
    await example_simple_bulk()
    
    # Descomentar para testar campanha segmentada:
    # await example_segmented_campaign()


if __name__ == "__main__":
    asyncio.run(main())
