# Message Components

Componentes reutilizáveis para criar payloads de mensagens WhatsApp.

## 📦 O Que São

Funções puras que retornam payloads prontos para enviar via WhatsApp API.
**Zero dependências** - só importa, cria o payload, e envia.

## 🚀 Uso Rápido

```python
from whatsapp_kit import create_button_message, create_list_message

# Criar payload de botões
payload = create_button_message(
    to="5511999999999",
    body="Como posso ajudar?",
    buttons=[
        {"id": "opt1", "title": "Ver serviços"},
        {"id": "opt2", "title": "Orçamento"}
    ]
)

# Enviar com seu cliente HTTP favorito
import httpx
response = await httpx.post(url, headers=headers, json=payload)
```

## 📚 Componentes Disponíveis

### Text Messages
```python
from whatsapp_kit import create_text_message

payload = create_text_message(
    to="5511999999999",
    text="Olá! Bem-vindo."
)
```

### Button Messages (até 3 botões)
```python
from whatsapp_kit import create_button_message

buttons = [
    {"id": "btn1", "title": "Opção 1"},
    {"id": "btn2", "title": "Opção 2"},
    {"id": "btn3", "title": "Opção 3"}
]

payload = create_button_message(
    to="5511999999999",
    body="Escolha uma opção:",
    buttons=buttons,
    footer="Responda em 24h"  # Opcional
)
```

### List Messages (até 10 opções)
```python
from whatsapp_kit import create_list_message

sections = [
    {
        "title": "Serviços",
        "rows": [
            {"id": "s1", "title": "Lavagem", "description": "R$ 30"},
            {"id": "s2", "title": "Polimento", "description": "R$ 150"}
        ]
    }
]

payload = create_list_message(
    to="5511999999999",
    body="Escolha um serviço:",
    button_text="Ver opções",
    sections=sections,
    header="LavaJato",      # Opcional
    footer="Melhor preço"   # Opcional
)
```

### Location Request
```python
from whatsapp_kit import create_location_request

payload = create_location_request(
    to="5511999999999",
    body="Compartilhe sua localização para agendamento"
)
```

### Image Message
```python
from whatsapp_kit import create_image_message

payload = create_image_message(
    to="5511999999999",
    image_url="https://example.com/image.jpg",
    caption="Confira!"  # Opcional
)
```

### Document Message
```python
from whatsapp_kit import create_document_message

payload = create_document_message(
    to="5511999999999",
    document_url="https://example.com/doc.pdf",
    filename="Contrato.pdf",
    caption="Segue contrato"  # Opcional
)
```

### Audio Message
```python
from whatsapp_kit import create_audio_message

payload = create_audio_message(
    to="5511999999999",
    audio_url="https://example.com/audio.mp3"
)
```

### Video Message
```python
from whatsapp_kit import create_video_message

payload = create_video_message(
    to="5511999999999",
    video_url="https://example.com/video.mp4",
    caption="Tutorial"  # Opcional
)
```

## 🎯 Por Que Usar Componentes?

### ❌ Antes (código duplicado)
```python
# Em bot1.py
payload = {
    "messaging_product": "whatsapp",
    "to": to,
    "type": "interactive",
    "interactive": {
        "type": "button",
        "body": {"text": body},
        "action": {"buttons": [...]}
    }
}

# Em bot2.py (mesmo código copiado)
payload = {
    "messaging_product": "whatsapp",
    "to": to,
    "type": "interactive",
    # ... copiou e colou de novo
}
```

### ✅ Depois (componentizado)
```python
# Em qualquer projeto
from whatsapp_kit import create_button_message

payload = create_button_message(to, body, buttons)
```

## 🔧 Integração com Seu Cliente

```python
import httpx
from whatsapp_kit import create_button_message

async def send_message(payload: dict):
    url = f"https://graph.facebook.com/v22.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        return response.json()

# Usar
buttons = [{"id": "opt1", "title": "Ver serviços"}]
payload = create_button_message("5511999999999", "Olá!", buttons)

result = await send_message(payload)
```

## 📖 Exemplos Completos

Veja: [examples/message_components_example.py](../../examples/message_components_example.py)

## ✨ Vantagens

✅ **Reutilizável** - Importa em qualquer projeto
✅ **Zero duplicação** - Código em um só lugar
✅ **Type hints** - Autocompletar no IDE
✅ **Testável** - Funções puras, fácil de testar
✅ **Documentado** - Docstrings com exemplos
✅ **Validado** - Limites automáticos (max 3 botões, 20 chars, etc)

---

**Componentizado e pronto para reutilizar!** 🚀
