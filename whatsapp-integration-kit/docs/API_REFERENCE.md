# API Reference - Referência Completa

Documentação detalhada de todos os métodos disponíveis no WhatsApp Integration Kit.

---

## WhatsAppService

Classe principal para interação com WhatsApp Business API.

### Inicialização

```python
from whatsapp_kit import WhatsAppService, WhatsAppConfig

# Opção 1: Carregar do .env
service = WhatsAppService()

# Opção 2: Config manual
config = WhatsAppConfig(
    token="seu_token",
    phone_number_id="seu_phone_id"
)
service = WhatsAppService(config)

# Opção 3: Context manager (recomendado)
async with WhatsAppService() as service:
    await service.send_text_message(...)
```

---

## Métodos de Envio

### send_text_message()

Envia mensagem de texto simples.

**Assinatura:**
```python
async def send_text_message(
    to: str,
    text: str,
    preview_url: bool = True
) -> Dict[str, Any]
```

**Parâmetros:**
- `to` (str): Número do destinatário no formato internacional sem +
- `text` (str): Texto da mensagem (máximo 4096 caracteres)
- `preview_url` (bool): Se True, mostra preview de URLs na mensagem

**Retorna:**
- `Dict[str, Any]`: Resposta da API com message_id

**Exceções:**
- `WhatsAppValidationError`: Número ou texto inválido
- `WhatsAppAPIError`: Erro da API do WhatsApp
- `WhatsAppAuthError`: Token inválido ou expirado

**Exemplo:**
```python
response = await service.send_text_message(
    to="5511999999999",
    text="Olá! Como posso ajudar?"
)
message_id = service.extract_message_id(response)
```

---

### send_template()

Envia mensagem template pré-aprovada.

**Assinatura:**
```python
async def send_template(
    to: str,
    template_name: str,
    language_code: str = "pt_BR",
    components: Optional[List[Dict]] = None
) -> Dict[str, Any]
```

**Parâmetros:**
- `to`: Número do destinatário
- `template_name`: Nome do template (deve estar aprovado no Meta Business)
- `language_code`: Código do idioma (pt_BR, en_US, es_ES)
- `components`: Lista de componentes com parâmetros dinâmicos

**Exemplo:**
```python
# Template simples
await service.send_template(
    to="5511999999999",
    template_name="hello_world",
    language_code="en_US"
)

# Template com parâmetros
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

---

### send_media()

Envia mídia (imagem, vídeo, documento, áudio).

**Assinatura:**
```python
async def send_media(
    to: str,
    media_type: str,
    media_id: Optional[str] = None,
    media_url: Optional[str] = None,
    caption: Optional[str] = None,
    filename: Optional[str] = None
) -> Dict[str, Any]
```

**Parâmetros:**
- `to`: Número do destinatário
- `media_type`: Tipo (image, video, document, audio)
- `media_id`: ID da mídia já uploadada (OU use media_url)
- `media_url`: URL pública da mídia (OU use media_id)
- `caption`: Legenda (apenas para image/video)
- `filename`: Nome do arquivo (apenas para document)

**Tipos de Mídia Suportados:**
- **image**: JPG, PNG (máx 5MB)
- **video**: MP4, 3GPP (máx 16MB)
- **audio**: MP3, OGG, AMR (máx 16MB)
- **document**: PDF, DOCX, XLSX, etc (máx 100MB)

**Exemplo:**
```python
# Enviar imagem
await service.send_media(
    to="5511999999999",
    media_type="image",
    media_url="https://example.com/image.jpg",
    caption="Confira! 📸"
)

# Enviar documento
await service.send_media(
    to="5511999999999",
    media_type="document",
    media_url="https://example.com/invoice.pdf",
    filename="fatura_janeiro.pdf"
)
```

---

### send_interactive_buttons()

Envia mensagem com botões interativos (máximo 3).

**Assinatura:**
```python
async def send_interactive_buttons(
    to: str,
    body_text: str,
    buttons: List[Dict[str, str]],
    header_text: Optional[str] = None,
    footer_text: Optional[str] = None
) -> Dict[str, Any]
```

**Parâmetros:**
- `to`: Número do destinatário
- `body_text`: Texto principal (máx 1024 caracteres)
- `buttons`: Lista de botões [{"id": "btn_1", "title": "Texto"}] (máx 3)
- `header_text`: Cabeçalho opcional (máx 60 caracteres)
- `footer_text`: Rodapé opcional (máx 60 caracteres)

**Restrições:**
- Máximo 3 botões
- ID do botão: máx 256 caracteres
- Título do botão: máx 20 caracteres

**Exemplo:**
```python
await service.send_interactive_buttons(
    to="5511999999999",
    header_text="Nova Cobrança",
    body_text="Você tem uma fatura de R$ 150,00. Confirmar pagamento?",
    buttons=[
        {"id": "confirm", "title": "✅ Confirmar"},
        {"id": "details", "title": "📄 Detalhes"},
        {"id": "cancel", "title": "❌ Cancelar"}
    ],
    footer_text="Responda em 24h"
)
```

---

### send_cta_url()

Envia mensagem com botão de Call-to-Action com URL.

**Assinatura:**
```python
async def send_cta_url(
    to: str,
    body_text: str,
    button_text: str,
    url: str
) -> Dict[str, Any]
```

**Parâmetros:**
- `to`: Número do destinatário
- `body_text`: Texto da mensagem (máx 1024 caracteres)
- `button_text`: Texto do botão (máx 20 caracteres)
- `url`: URL completa para abrir

**Exemplo:**
```python
await service.send_cta_url(
    to="5511999999999",
    body_text="Sua fatura está pronta!",
    button_text="💳 Pagar Agora",
    url="https://payments.example.com/invoice/123"
)
```

---

## Métodos de Mídia

### get_media_url()

Obtém URL de download de uma mídia recebida.

**Assinatura:**
```python
async def get_media_url(media_id: str) -> str
```

**Parâmetros:**
- `media_id`: ID da mídia recebida via webhook

**Retorna:**
- `str`: URL de download (válida por tempo limitado)

**Exemplo:**
```python
# media_id recebido do webhook
media_url = await service.get_media_url(media_id)
```

---

### download_media()

Baixa mídia e salva localmente.

**Assinatura:**
```python
async def download_media(
    media_url: str,
    save_path: str
) -> int
```

**Parâmetros:**
- `media_url`: URL obtida via get_media_url()
- `save_path`: Caminho completo onde salvar

**Retorna:**
- `int`: Tamanho do arquivo em bytes

**Exemplo:**
```python
media_url = await service.get_media_url(media_id)
size = await service.download_media(media_url, "storage/image.jpg")
print(f"Baixado: {size} bytes")
```

---

## Métodos Utilitários

### mark_as_read()

Marca mensagem como lida (exibe check azul).

**Assinatura:**
```python
async def mark_as_read(message_id: str) -> Dict[str, Any]
```

**Exemplo:**
```python
# No webhook handler
message_id = webhook_data["entry"][0]["changes"][0]["value"]["messages"][0]["id"]
await service.mark_as_read(message_id)
```

---

### extract_message_id()

Extrai message_id da resposta da API.

**Assinatura:**
```python
def extract_message_id(response: Dict[str, Any]) -> Optional[str]
```

**Exemplo:**
```python
response = await service.send_text_message(...)
message_id = service.extract_message_id(response)
print(f"Message ID: {message_id}")
```

---

### validate_phone_number()

Valida formato de número de telefone.

**Assinatura:**
```python
def validate_phone_number(phone: str) -> bool
```

**Exceções:**
- `WhatsAppValidationError`: Número inválido

**Exemplo:**
```python
try:
    service.validate_phone_number("5511999999999")
    print("✅ Número válido")
except WhatsAppValidationError as e:
    print(f"❌ Número inválido: {e}")
```

---

## WhatsAppConfig

Classe de configuração.

### Atributos

```python
@dataclass
class WhatsAppConfig:
    # Obrigatórios
    token: str
    phone_number_id: str
    
    # Opcionais
    api_version: str = "v18.0"
    base_url: str = "https://graph.facebook.com"
    timeout: float = 30.0
    max_retries: int = 3
    log_level: str = "INFO"
```

### Métodos Estáticos

**from_env()** - Carrega do .env
```python
config = WhatsAppConfig.from_env()
```

**from_env_file()** - Carrega de arquivo específico
```python
config = WhatsAppConfig.from_env_file(".env.production")
```

---

## Exceções

Todas as exceções herdam de `WhatsAppException`:

```python
try:
    await service.send_text_message(...)
    
except WhatsAppAuthError:
    # Token inválido ou expirado
    
except WhatsAppValidationError as e:
    # Dados inválidos (número, texto, etc)
    print(e.message)
    
except WhatsAppAPIError as e:
    # Erro da API do WhatsApp
    print(e.status_code)
    print(e.error_code)
    
except WhatsAppTimeoutError:
    # Timeout na requisição
    
except WhatsAppRateLimitError as e:
    # Rate limit excedido
    if e.retry_after:
        await asyncio.sleep(e.retry_after)
        # Tentar novamente
    
except WhatsAppMediaError:
    # Erro ao processar mídia
    
except WhatsAppWebhookError:
    # Erro ao processar webhook
    
except WhatsAppException as e:
    # Qualquer erro do kit
    print(e.details)
```

---

## Utilidades (utils)

### Validators

```python
from whatsapp_kit.utils import (
    validate_phone_number,
    validate_message_text,
    validate_template_name,
    validate_media_url
)

# Validar número
phone = validate_phone_number("+55 11 99999-9999")  # "5511999999999"

# Validar texto
validate_message_text("Meu texto", max_length=4096)
```

### Formatters

```python
from whatsapp_kit.utils import (
    format_phone_number,
    format_currency,
    format_date_br
)

phone = format_phone_number("+55 (11) 99999-9999")  # "5511999999999"
value = format_currency(150.50)  # "R$ 150,50"
date = format_date_br(datetime.now())  # "15/01/2024"
```

### Logging

```python
from whatsapp_kit.utils import setup_logging

setup_logging(
    level="DEBUG",
    log_file="logs/whatsapp.log"
)
```

---

Veja exemplos práticos na pasta [examples/](../examples/).
