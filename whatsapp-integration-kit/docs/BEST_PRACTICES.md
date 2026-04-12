# Best Practices - Boas Práticas

Guia de boas práticas para usar o WhatsApp Integration Kit em produção.

---

## 🔒 Segurança

### 1. Proteção de Credenciais

**❌ NUNCA faça:**
```python
# NÃO coloque tokens no código
service = WhatsAppService(
    config=WhatsAppConfig(token="EAAxxxxx...")
)

# NÃO commite .env no git
git add .env  # ❌
```

**✅ SEMPRE faça:**
```python
# Use variáveis de ambiente
service = WhatsAppService()  # Carrega do .env

# Adicione .env no .gitignore
echo ".env" >> .gitignore
```

### 2. Validação de Webhooks

```python
import hmac
import hashlib

def validate_webhook(payload: bytes, signature: str, secret: str) -> bool:
    """Valida assinatura do webhook"""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, f"sha256={expected}")

# No endpoint do webhook
@app.post("/webhook")
async def webhook(request: Request):
    signature = request.headers.get("X-Hub-Signature-256")
    body = await request.body()
    
    if not validate_webhook(body, signature, WEBHOOK_SECRET):
        raise HTTPException(403, "Invalid signature")
```

---

## ⚡ Performance

### 1. Reutilizar Service Instance

**❌ NÃO crie instância a cada mensagem:**
```python
async def send_messages(numbers):
    for number in numbers:
        service = WhatsAppService()  # ❌ Lento
        await service.send_text_message(number, "Olá")
        await service.close()
```

**✅ Reutilize a instância:**
```python
async def send_messages(numbers):
    async with WhatsAppService() as service:  # ✅ Rápido
        for number in numbers:
            await service.send_text_message(number, "Olá")
```

### 2. Envio em Paralelo

```python
import asyncio

async def send_bulk_messages(recipients):
    service = WhatsAppService()
    
    # Criar tasks
    tasks = [
        service.send_text_message(phone, message)
        for phone, message in recipients
    ]
    
    # Executar em paralelo
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    await service.close()
    return results
```

### 3. Rate Limiting

```python
import asyncio
from asyncio import Semaphore

async def send_with_rate_limit(recipients, max_concurrent=5):
    """Limita envios concorrentes"""
    service = WhatsAppService()
    semaphore = Semaphore(max_concurrent)
    
    async def send_one(phone, text):
        async with semaphore:
            await service.send_text_message(phone, text)
            await asyncio.sleep(0.5)  # Delay entre mensagens
    
    tasks = [send_one(p, t) for p, t in recipients]
    await asyncio.gather(*tasks)
    await service.close()
```

---

## 🎯 Tratamento de Erros

### 1. Retry com Backoff Exponencial

```python
import asyncio

async def send_with_retry(service, phone, text, max_retries=3):
    """Envia com retry automático"""
    for attempt in range(max_retries):
        try:
            return await service.send_text_message(phone, text)
            
        except WhatsAppRateLimitError as e:
            if e.retry_after:
                await asyncio.sleep(e.retry_after)
            else:
                await asyncio.sleep(2 ** attempt)  # Backoff exponencial
                
        except WhatsAppTimeoutError:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)
            
        except WhatsAppAuthError:
            # Erro de auth não deve fazer retry
            raise
    
    raise Exception("Max retries exceeded")
```

### 2. Logging de Erros

```python
from loguru import logger

async def send_safe(service, phone, text):
    """Envia com logging completo"""
    try:
        logger.info(f"Sending to {phone}")
        result = await service.send_text_message(phone, text)
        logger.success(f"Sent to {phone}: {result}")
        return result
        
    except WhatsAppValidationError as e:
        logger.warning(f"Invalid data for {phone}: {e.message}")
        
    except WhatsAppAPIError as e:
        logger.error(
            f"API error for {phone}: "
            f"status={e.status_code} code={e.error_code}"
        )
        
    except Exception as e:
        logger.exception(f"Unexpected error for {phone}")
        raise
```

---

## 📊 Monitoramento

### 1. Métricas de Envio

```python
from collections import Counter
from datetime import datetime

class MessageTracker:
    def __init__(self):
        self.stats = Counter()
        self.start_time = datetime.now()
    
    def record_success(self):
        self.stats["success"] += 1
    
    def record_failure(self, error_type):
        self.stats[f"error_{error_type}"] += 1
    
    def summary(self):
        duration = (datetime.now() - self.start_time).total_seconds()
        return {
            "total": sum(self.stats.values()),
            "success": self.stats["success"],
            "errors": {k: v for k, v in self.stats.items() if k != "success"},
            "duration_seconds": duration,
            "messages_per_second": self.stats["success"] / duration
        }

# Uso
tracker = MessageTracker()

try:
    await service.send_text_message(...)
    tracker.record_success()
except WhatsAppAPIError:
    tracker.record_failure("api_error")

print(tracker.summary())
```

---

## 💾 Persistência

### 1. Salvar Message IDs

```python
import json

class MessageLogger:
    def __init__(self, log_file="messages.jsonl"):
        self.log_file = log_file
    
    def log_message(self, phone, text, message_id, status="sent"):
        """Salva log de mensagem"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "phone": phone,
            "text": text[:50],  # Truncar para privacidade
            "message_id": message_id,
            "status": status
        }
        
        with open(self.log_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
    
    def update_status(self, message_id, new_status):
        """Atualiza status de mensagem"""
        # Implementar busca e atualização
        pass

# Uso
logger = MessageLogger()

response = await service.send_text_message(phone, text)
message_id = service.extract_message_id(response)
logger.log_message(phone, text, message_id)
```

---

## 🔄 Webhooks

### 1. Processamento Assíncrono

```python
from fastapi import BackgroundTasks

@app.post("/webhook")
async def webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.json()
    
    # Responder rapidamente (< 20s)
    background_tasks.add_task(process_webhook, body)
    
    return {"status": "ok"}

async def process_webhook(data):
    """Processa webhook em background"""
    # Processamento pesado aqui
    pass
```

### 2. Idempotência

```python
import redis

redis_client = redis.Redis()

async def process_message_idempotent(message_id, data):
    """Garante processamento único"""
    # Verificar se já processou
    if redis_client.exists(f"processed:{message_id}"):
        logger.info(f"Message {message_id} already processed")
        return
    
    # Processar
    await process_message(data)
    
    # Marcar como processado (expira em 24h)
    redis_client.setex(f"processed:{message_id}", 86400, "1")
```

---

## 📝 Templates

### 1. Gerenciamento de Templates

```python
class TemplateManager:
    def __init__(self):
        self.templates = {
            "payment_reminder": {
                "name": "payment_reminder",
                "language": "pt_BR",
                "params": ["customer_name", "amount", "due_date"]
            },
            "welcome": {
                "name": "welcome_message",
                "language": "pt_BR",
                "params": ["customer_name"]
            }
        }
    
    def build_template(self, template_id, **params):
        """Constrói componentes do template"""
        template = self.templates[template_id]
        
        components = [{
            "type": "body",
            "parameters": [
                {"type": "text", "text": str(params[p])}
                for p in template["params"]
            ]
        }]
        
        return template["name"], template["language"], components

# Uso
manager = TemplateManager()

name, lang, components = manager.build_template(
    "payment_reminder",
    customer_name="João",
    amount="R$ 150,00",
    due_date="15/02/2024"
)

await service.send_template(phone, name, lang, components)
```

---

## 🧪 Testes

### 1. Mock do Service para Testes

```python
from unittest.mock import AsyncMock

class MockWhatsAppService:
    async def send_text_message(self, to, text):
        return {
            "messages": [{"id": "mock_message_id"}]
        }
    
    def extract_message_id(self, response):
        return response["messages"][0]["id"]
    
    async def close(self):
        pass

# Em seus testes
async def test_send_notification():
    service = MockWhatsAppService()
    
    response = await service.send_text_message("5511999999999", "Test")
    message_id = service.extract_message_id(response)
    
    assert message_id == "mock_message_id"
```

---

## Checklist de Produção

- [ ] Tokens armazenados de forma segura (variáveis de ambiente)
- [ ] `.env` no `.gitignore`
- [ ] Token permanente (não temporário de 24h)
- [ ] Validação de assinatura de webhooks
- [ ] Tratamento de erros completo
- [ ] Retry com backoff exponencial
- [ ] Rate limiting implementado
- [ ] Logging estruturado
- [ ] Monitoramento de métricas
- [ ] Processamento assíncrono de webhooks
- [ ] Idempotência garantida
- [ ] Testes automatizados
- [ ] Alertas para erros críticos
- [ ] Backup de message IDs
- [ ] Documentação atualizada

---

Pronto para produção! 🚀
