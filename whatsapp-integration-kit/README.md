# WhatsApp Integration Kit 📱

**Kit completo e reutilizável para integração com WhatsApp Business API**

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um kit profissional, documentado e pronto para produção que encapsula toda a complexidade da WhatsApp Business API em uma interface Python simples e intuitiva.

---

## 🎯 Por Que Este Kit?

✅ **Plug & Play** - Copie para qualquer projeto e comece a usar em minutos  
✅ **Classes Abstratas** - Arquitetura extensível e bem estruturada  
✅ **Exemplos Completos** - 15+ exemplos práticos de casos de uso reais  
✅ **Type Hints** - 100% tipado para melhor autocomplete e menos bugs  
✅ **Error Handling** - Tratamento robusto de erros com exceções específicas  
✅ **Documentação Rica** - Código bem documentado com exemplos em docstrings  
✅ **Pronto para Produção** - Retry automático, logging, rate limiting  

---

## 📦 O Que Está Incluso

```
whatsapp-integration-kit/
├── whatsapp_kit/              # 📚 Biblioteca principal
│   ├── core/                  # Classes abstratas e tipos
│   ├── services/              # Serviço WhatsApp completo
│   ├── utils/                 # Validadores e formatadores
│   ├── messages/              # 🎯 Message Components (NOVO!)
│   │   ├── text.py           # Mensagens de texto
│   │   ├── buttons.py        # Botões interativos
│   │   ├── lists.py          # Listas interativas
│   │   ├── media.py          # Imagens, documentos, áudio, vídeo
│   │   └── interactive.py    # Localização, etc
│   └── config.py              # Gerenciamento de configuração
│
├── examples/                  # 🎓 Exemplos prontos para usar
│   ├── 01_basic/             # Enviar mensagens, templates, mídia
│   ├── 02_interactive/       # Botões, listas, CTAs
│   ├── 03_webhooks/          # Receber mensagens e status
│   ├── 04_use_cases/         # Casos de uso completos
│   │   ├── billing_system/   # Sistema de cobrança
│   │   ├── customer_support/ # Atendimento ao cliente
│   │   ├── order_confirmation/ # Confirmação de pedidos
│   │   └── notifications/    # Sistema de notificações
│   └── message_components_example.py  # 🆕 Exemplos de componentes
│
└── docs/                      # 📖 Documentação detalhada
    ├── API_REFERENCE.md      # Referência completa da API
    ├── WEBHOOKS_GUIDE.md     # Guia de webhooks
    ├── MESSAGE_TYPES.md      # Tipos de mensagens
    └── BEST_PRACTICES.md     # Boas práticas
```

---

## 🚀 Quick Start (5 minutos)

### 1. Copiar para Seu Projeto

```bash
# Copie a pasta whatsapp-integration-kit para seu projeto
cp -r whatsapp-integration-kit/ /seu/projeto/
cd /seu/projeto/whatsapp-integration-kit
```

### 2. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar Credenciais

```bash
# Copie o template de configuração
cp .env.example .env

# Edite com suas credenciais
nano .env
```

Preencha suas credenciais no `.env`:

```env
WHATSAPP_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
```

**Onde obter credenciais?**  
👉 [Guia Rápido: Como obter credenciais WhatsApp](docs/GET_CREDENTIALS.md)

### 4. Enviar Primeira Mensagem

```python
import asyncio
from whatsapp_kit import WhatsAppService

async def main():
    service = WhatsAppService()
    
    response = await service.send_text_message(
        to="5511999999999",  # Número do destinatário
        text="Olá! Minha primeira mensagem 🚀"
    )
    
    print(f"✅ Enviado! ID: {service.extract_message_id(response)}")
    await service.close()

asyncio.run(main())
```

**Pronto! 🎉** Sua primeira mensagem foi enviada.

---

## 🎯 Message Components (NOVO!)

**Componentes reutilizáveis** para criar payloads de mensagens em qualquer projeto.

### Por Que Usar?

✅ **Zero duplicação** - Código em um só lugar
✅ **Plug & Play** - Importa e usa
✅ **Type hints** - Autocompletar no IDE
✅ **Funções puras** - Fácil de testar

### Exemplo Rápido

```python
from whatsapp_kit import create_button_message, create_list_message

# Criar payload de botões
payload = create_button_message(
    to="5511999999999",
    body="Como posso ajudar?",
    buttons=[
        {"id": "services", "title": "Ver serviços"},
        {"id": "quote", "title": "Orçamento"},
        {"id": "contact", "title": "Falar com humano"}
    ],
    footer="Responda em 24h"
)

# Enviar com seu cliente HTTP
import httpx
response = await httpx.post(url, headers=headers, json=payload)
```

### Componentes Disponíveis

- `create_text_message()` - Texto simples
- `create_button_message()` - Botões (até 3)
- `create_list_message()` - Listas (até 10 opções)
- `create_location_request()` - Solicitar GPS
- `create_image_message()` - Enviar imagens
- `create_document_message()` - Enviar PDFs, DOCX
- `create_audio_message()` - Enviar áudio
- `create_video_message()` - Enviar vídeo

📚 **Documentação completa:** [whatsapp_kit/messages/README.md](whatsapp_kit/messages/README.md)
📝 **Exemplos:** [examples/message_components_example.py](examples/message_components_example.py)

---

## 💡 Exemplos de Uso

### Enviar Texto Simples

```python
from whatsapp_kit import WhatsAppService

service = WhatsAppService()

await service.send_text_message(
    to="5511999999999",
    text="Olá! Como posso ajudar?"
)
```

### Enviar Template

```python
await service.send_template(
    to="5511999999999",
    template_name="payment_reminder",
    language_code="pt_BR",
    components=[{
        "type": "body",
        "parameters": [
            {"type": "text", "text": "João Silva"},
            {"type": "text", "text": "R$ 150,00"}
        ]
    }]
)
```

### Enviar Mídia (Imagem, Documento, Vídeo)

```python
await service.send_media(
    to="5511999999999",
    media_type="image",
    media_url="https://example.com/image.jpg",
    caption="Confira esta imagem! 📸"
)
```

### Mensagem Interativa com Botões

```python
await service.send_interactive_buttons(
    to="5511999999999",
    body_text="Escolha uma opção:",
    buttons=[
        {"id": "option_1", "title": "✅ Confirmar"},
        {"id": "option_2", "title": "❌ Cancelar"}
    ]
)
```

### Botão com Link (CTA)

```python
await service.send_cta_url(
    to="5511999999999",
    body_text="Sua fatura está pronta!",
    button_text="💳 Pagar Agora",
    url="https://payments.example.com/invoice/123"
)
```

### Receber Mensagens (Webhook)

```python
from fastapi import FastAPI, Request
from whatsapp_kit import WhatsAppService

app = FastAPI()
service = WhatsAppService()

@app.post("/webhooks/whatsapp")
async def receive_webhook(request: Request):
    body = await request.json()
    
    # Processar mensagens
    for entry in body.get("entry", []):
        messages = entry["changes"][0]["value"].get("messages", [])
        
        for msg in messages:
            from_number = msg["from"]
            text = msg.get("text", {}).get("body", "")
            
            print(f"📨 Mensagem de {from_number}: {text}")
            
            # Responder automaticamente
            await service.send_text_message(
                to=from_number,
                text=f"Recebi: {text}"
            )
    
    return {"status": "success"}
```

---

## 📚 Casos de Uso Completos

Todos os casos de uso incluem código completo, pronto para adaptar:

### 1. Sistema de Cobrança 💰

Envie cobranças, receba comprovantes, confirme pagamentos.

```bash
cd examples/04_use_cases/billing_system/
python send_payment_reminder.py
```

**Features:**
- Envio de lembrete com link de pagamento
- Recebimento de comprovante via WhatsApp
- Confirmação automática de pagamento
- Mensagens personalizadas por status

📖 [Ver documentação completa](examples/04_use_cases/billing_system/README.md)

### 2. Atendimento ao Cliente 🤝

Chatbot com menu interativo, sistema de tickets, FAQ.

```bash
cd examples/04_use_cases/customer_support/
python chatbot_menu.py
```

**Features:**
- Menu principal com botões
- Respostas automáticas (FAQ)
- Criação de tickets
- Encaminhamento para humano

📖 [Ver documentação completa](examples/04_use_cases/customer_support/README.md)

### 3. Confirmação de Pedidos 📦

Notificações de pedido, atualizações de rastreamento.

```bash
cd examples/04_use_cases/order_confirmation/
python order_flow.py
```

**Features:**
- Confirmação de pedido
- Updates de status
- Link de rastreamento
- Avaliação pós-entrega

### 4. Sistema de Notificações 🔔

Envio em massa, agendamento de mensagens.

```bash
cd examples/04_use_cases/notifications/
python notification_scheduler.py
```

---

## 🏗️ Arquitetura

### Classes Base Abstratas

O kit usa abstração para garantir extensibilidade:

```python
# Core abstractions
BaseHTTPClient        # Cliente HTTP com retry e timeout
BaseWhatsAppService   # Interface do serviço WhatsApp

# Concrete implementations
WhatsAppService       # Implementação completa da API
```

### Hierarquia de Exceções

Todas as exceções herdam de `WhatsAppException`:

```python
WhatsAppException
├── WhatsAppAPIError      # Erros da API
├── WhatsAppAuthError     # Autenticação
├── WhatsAppValidationError # Validação de dados
├── WhatsAppTimeoutError  # Timeout
├── WhatsAppRateLimitError # Rate limit
├── WhatsAppMediaError    # Erros de mídia
├── WhatsAppWebhookError  # Erros de webhook
└── WhatsAppConfigError   # Configuração
```

### Configuração Flexível

```python
# Opção 1: Carregar do .env
service = WhatsAppService()

# Opção 2: Config manual
config = WhatsAppConfig(
    token="...",
    phone_number_id="..."
)
service = WhatsAppService(config)

# Opção 3: Arquivo .env específico
config = WhatsAppConfig.from_env_file(".env.production")
service = WhatsAppService(config)
```

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente

Todas as configurações disponíveis:

```env
# Obrigatórias
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# Opcionais
WHATSAPP_API_VERSION=v18.0
WHATSAPP_TIMEOUT=30
WHATSAPP_MAX_RETRIES=3
WHATSAPP_LOG_LEVEL=INFO
```

### Logging Customizado

```python
from whatsapp_kit.utils import setup_logging

setup_logging(
    level="DEBUG",
    log_file="logs/whatsapp.log",
    rotation="10 MB",
    retention="7 days"
)
```

---

## 📖 Documentação Completa

- **[QUICK_START.md](QUICK_START.md)** - Comece em 5 minutos
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Referência completa de métodos
- **[WEBHOOKS_GUIDE.md](docs/WEBHOOKS_GUIDE.md)** - Setup de webhooks
- **[MESSAGE_TYPES.md](docs/MESSAGE_TYPES.md)** - Todos os tipos de mensagem
- **[ERROR_HANDLING.md](docs/ERROR_HANDLING.md)** - Tratamento de erros
- **[BEST_PRACTICES.md](docs/BEST_PRACTICES.md)** - Boas práticas

---

## 🧪 Features Principais

### ✅ Mensagens de Texto
- Texto simples
- Preview de URLs
- Markdown (bold, italic, strikethrough)

### ✅ Templates
- Templates pré-aprovados
- Parâmetros dinâmicos
- Múltiplos idiomas

### ✅ Mensagens Interativas
- Botões (até 3)
- Listas (até 10 seções)
- CTA com URL

### ✅ Mídia
- Imagens (JPG, PNG)
- Documentos (PDF, DOCX, etc)
- Vídeos (MP4)
- Áudio (MP3, OGG)

### ✅ Webhooks
- Receber mensagens
- Status de entrega
- Validação de assinatura

### ✅ Recursos Avançados
- Retry automático
- Rate limiting
- Circuit breaker
- Logging estruturado
- Validação de dados

---

## 🛡️ Tratamento de Erros

Exemplo completo de tratamento:

```python
from whatsapp_kit import (
    WhatsAppService,
    WhatsAppAuthError,
    WhatsAppValidationError,
    WhatsAppTimeoutError
)

service = WhatsAppService()

try:
    await service.send_text_message("5511999999999", "Teste")
    
except WhatsAppAuthError:
    print("❌ Token inválido ou expirado")
    
except WhatsAppValidationError as e:
    print(f"❌ Dados inválidos: {e.message}")
    
except WhatsAppTimeoutError:
    print("❌ Timeout - tente novamente")
    
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
```

---

## 🔒 Segurança

### Validação de Webhook

```python
import hmac
import hashlib

def validate_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Valida assinatura do webhook do WhatsApp"""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)
```

### Mascaramento de Dados Sensíveis

```python
from whatsapp_kit.utils import mask_sensitive_data

data = {"token": "abc123secret", "name": "João"}
safe_data = mask_sensitive_data(data)
# {"token": "abc...[MASKED]", "name": "João"}
```

---

## 📊 Performance

- **Async/Await** - Suporta milhares de requisições concorrentes
- **Connection Pooling** - Reutilização de conexões HTTP
- **Retry Automático** - Backoff exponencial em falhas
- **Rate Limiting** - Respeita limites da API

---

## 🤝 Como Usar em Outros Projetos

1. **Copie a pasta completa** para seu projeto
2. **Instale dependências**: `pip install -r requirements.txt`
3. **Configure `.env`** com suas credenciais
4. **Importe e use**: `from whatsapp_kit import WhatsAppService`

**É isso!** O kit é 100% autocontido e portátil.

---

## 🐛 Troubleshooting

### Erro: "Token inválido"
- Verifique se o token está correto no `.env`
- Tokens temporários expiram em 24h - gere um permanente

### Erro: "Phone number ID inválido"
- Confirme o ID em WhatsApp Business Platform > Phone Numbers

### Webhook não recebe mensagens
- Use ngrok para expor localhost: `ngrok http 8000`
- Configure a URL no Meta Business Manager
- Verifique se o verify_token está correto

📖 [Guia completo de troubleshooting](docs/TROUBLESHOOTING.md)

---

## 📝 Licença

MIT License - Use livremente em projetos pessoais e comerciais.

---

## 🙋 Suporte

- 📖 [Documentação Completa](docs/)
- 💬 [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- 🐛 Encontrou um bug? Abra uma issue

---

## 🎓 Aprenda Mais

- **[Tutorial Completo](docs/TUTORIAL.md)** - Do zero ao avançado
- **[Exemplos Práticos](examples/)** - 15+ exemplos prontos
- **[Casos de Uso](examples/04_use_cases/)** - Cenários reais

---

**Feito com ❤️ para desenvolvedores que querem integrar WhatsApp de forma profissional**

🚀 **Happy Coding!**
