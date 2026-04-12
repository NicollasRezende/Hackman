# Message Types - Tipos de Mensagens

Guia completo de todos os tipos de mensagens suportadas pelo WhatsApp Business API.

---

## 📝 Mensagens de Texto

### Texto Simples

```python
await service.send_text_message(
    to="5511999999999",
    text="Olá! Como posso ajudar?"
)
```

### Texto com Preview de URL

```python
await service.send_text_message(
    to="5511999999999",
    text="Confira nosso site: https://example.com",
    preview_url=True  # Mostra preview do link
)
```

### Texto com Formatação Markdown

WhatsApp suporta formatação básica:

```python
text = """
*Texto em negrito*
_Texto em itálico_
~Texto riscado~
```Texto monoespaçado```

Você também pode combinar: *_negrito e itálico_*
"""

await service.send_text_message(to="5511999999999", text=text)
```

**Resultado:**
- **Texto em negrito**
- *Texto em itálico*
- ~Texto riscado~
- `Texto monoespaçado`

---

## 📄 Templates

Templates são mensagens pré-aprovadas para iniciar conversações.

### Template Simples (Hello World)

```python
await service.send_template(
    to="5511999999999",
    template_name="hello_world",
    language_code="en_US"
)
```

### Template com Parâmetros

```python
# Template: "Olá {{1}}! Sua fatura de {{2}} vence em {{3}}."

await service.send_template(
    to="5511999999999",
    template_name="payment_reminder",
    language_code="pt_BR",
    components=[{
        "type": "body",
        "parameters": [
            {"type": "text", "text": "João Silva"},
            {"type": "text", "text": "R$ 150,00"},
            {"type": "text", "text": "15/02/2024"}
        ]
    }]
)
```

### Template com Header

```python
await service.send_template(
    to="5511999999999",
    template_name="invoice_ready",
    language_code="pt_BR",
    components=[
        {
            "type": "header",
            "parameters": [
                {
                    "type": "image",
                    "image": {
                        "link": "https://example.com/logo.jpg"
                    }
                }
            ]
        },
        {
            "type": "body",
            "parameters": [
                {"type": "text", "text": "João Silva"}
            ]
        }
    ]
)
```

---

## 🖼️ Mídia

### Imagem

```python
# Por URL
await service.send_media(
    to="5511999999999",
    media_type="image",
    media_url="https://example.com/image.jpg",
    caption="Confira esta imagem! 📸"
)

# Por ID (mídia já uploadada)
await service.send_media(
    to="5511999999999",
    media_type="image",
    media_id="123456789",
    caption="Imagem do catálogo"
)
```

**Formatos:** JPG, PNG  
**Tamanho máximo:** 5MB

### Documento

```python
await service.send_media(
    to="5511999999999",
    media_type="document",
    media_url="https://example.com/invoice.pdf",
    filename="fatura_janeiro_2024.pdf"
)
```

**Formatos:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT  
**Tamanho máximo:** 100MB

### Vídeo

```python
await service.send_media(
    to="5511999999999",
    media_type="video",
    media_url="https://example.com/tutorial.mp4",
    caption="Tutorial completo 🎥"
)
```

**Formatos:** MP4, 3GPP  
**Tamanho máximo:** 16MB

### Áudio

```python
await service.send_media(
    to="5511999999999",
    media_type="audio",
    media_url="https://example.com/audio.mp3"
)
```

**Formatos:** MP3, OGG, AMR  
**Tamanho máximo:** 16MB

---

## 🔘 Mensagens Interativas

### Botões (Reply Buttons)

Até 3 botões de resposta rápida.

```python
await service.send_interactive_buttons(
    to="5511999999999",
    header_text="Nova Cobrança",
    body_text="Você tem uma fatura de R$ 150,00.\nDeseja confirmar o pagamento?",
    buttons=[
        {"id": "confirm_payment", "title": "✅ Confirmar"},
        {"id": "view_details", "title": "📄 Detalhes"},
        {"id": "cancel", "title": "❌ Cancelar"}
    ],
    footer_text="Responda em até 24 horas"
)
```

**Limites:**
- Máximo: 3 botões
- ID: até 256 caracteres
- Título: até 20 caracteres
- Body: até 1024 caracteres

**Webhook Response:**
```json
{
  "type": "button",
  "button": {
    "payload": "confirm_payment",
    "text": "✅ Confirmar"
  }
}
```

### Lista Interativa

Menu com até 10 seções, cada uma com até 10 itens.

```python
await service.send_interactive_list(
    to="5511999999999",
    body_text="Escolha um departamento:",
    button_text="Ver Opções",
    sections=[
        {
            "title": "Vendas",
            "rows": [
                {"id": "sales_new", "title": "Novo Pedido", "description": "Fazer um novo pedido"},
                {"id": "sales_track", "title": "Rastrear", "description": "Rastrear pedido existente"}
            ]
        },
        {
            "title": "Suporte",
            "rows": [
                {"id": "support_tech", "title": "Técnico", "description": "Suporte técnico"},
                {"id": "support_billing", "title": "Financeiro", "description": "Questões de cobrança"}
            ]
        }
    ]
)
```

**Limites:**
- Máximo: 10 seções
- Máximo: 10 rows por seção
- Título da row: até 24 caracteres
- Descrição: até 72 caracteres

### CTA (Call-to-Action) com URL

Botão que abre uma URL.

```python
await service.send_cta_url(
    to="5511999999999",
    body_text=(
        "🔔 Sua fatura está pronta!\n\n"
        "💰 Valor: R$ 150,00\n"
        "📅 Vencimento: 15/02/2024\n\n"
        "Clique no botão para pagar com segurança."
    ),
    button_text="💳 Pagar Agora",
    url="https://payments.example.com/invoice/abc123"
)
```

**Limites:**
- Button text: até 20 caracteres
- URL: deve ser HTTPS
- Body: até 1024 caracteres

---

## 📍 Localização

### Enviar Localização

```python
await service.send_location(
    to="5511999999999",
    latitude=-23.550520,
    longitude=-46.633308,
    name="Avenida Paulista",
    address="Av. Paulista, 1578 - São Paulo, SP"
)
```

---

## 👤 Contatos

### Enviar Contato

```python
await service.send_contact(
    to="5511999999999",
    contacts=[{
        "name": {
            "formatted_name": "João Silva",
            "first_name": "João",
            "last_name": "Silva"
        },
        "phones": [{
            "phone": "5511999999999",
            "type": "CELL"
        }],
        "emails": [{
            "email": "joao@example.com",
            "type": "WORK"
        }]
    }]
)
```

---

## 📊 Comparação de Tipos

| Tipo | Uso Principal | Limites | Interativo |
|------|--------------|---------|------------|
| Texto | Mensagens simples | 4096 chars | ❌ |
| Template | Iniciar conversas | Pré-aprovado | ❌ |
| Imagem | Fotos, prints | 5MB | ❌ |
| Documento | PDFs, planilhas | 100MB | ❌ |
| Vídeo | Tutoriais | 16MB | ❌ |
| Áudio | Mensagens de voz | 16MB | ❌ |
| Botões | Respostas rápidas | 3 botões | ✅ |
| Lista | Menus complexos | 10 seções | ✅ |
| CTA URL | Links externos | 1 botão | ✅ |

---

## 🎯 Quando Usar Cada Tipo

### Use Texto quando:
- Mensagem simples e direta
- Resposta a uma pergunta
- Confirmação de ação

### Use Template quando:
- Iniciar nova conversa
- Mensagem padronizada (boas-vindas, cobrança)
- Precisa de aprovação prévia

### Use Mídia quando:
- Enviar comprovantes
- Compartilhar documentos
- Tutoriais em vídeo
- Fotos de produtos

### Use Botões quando:
- Opções simples (Sim/Não)
- Ações rápidas (Confirmar/Cancelar)
- Máximo 3 opções

### Use Lista quando:
- Menu com muitas opções
- Categorias organizadas
- Departamentos/Serviços

### Use CTA URL quando:
- Link de pagamento
- Formulário externo
- Site/Landing page
- Rastreamento de pedido

---

## 💡 Dicas de UX

### 1. Seja Conciso
```python
# ✅ Bom
"Sua fatura de R$ 150,00 vence amanhã. Pagar agora?"

# ❌ Ruim
"Olá! Tudo bem? Esperamos que sim. Gostaríamos de informar que..."
```

### 2. Use Emojis com Moderação
```python
# ✅ Bom
"✅ Pagamento confirmado!"

# ❌ Ruim
"✅🎉🎊💯 Pagamento confirmado! 🚀🔥💪"
```

### 3. Estruture Informações
```python
# ✅ Bom
text = """
📄 Fatura: #2024-001
💰 Valor: R$ 150,00
📅 Vencimento: 15/02/2024
"""

# ❌ Ruim
text = "Fatura 2024-001 no valor de R$ 150,00 com vencimento em 15/02/2024"
```

### 4. Call-to-Action Claro
```python
# ✅ Bom
button_text="💳 Pagar Agora"

# ❌ Ruim
button_text="Clique aqui"
```

---

Veja exemplos práticos em [examples/](../examples/).
