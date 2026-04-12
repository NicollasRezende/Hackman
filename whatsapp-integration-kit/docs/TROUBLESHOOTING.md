# Troubleshooting - Solução de Problemas

Guia para resolver problemas comuns ao usar o WhatsApp Integration Kit.

---

## Erros de Autenticação

### ❌ "WhatsAppAuthError: Token de acesso expirado"

**Causa:** Token temporário expirou (dura apenas 24 horas).

**Solução:**
1. Gere um token permanente no Meta Business Manager
2. Ou gere um novo token temporário

**Como gerar token permanente:**
```
1. Meta Business Suite → Business Settings
2. System Users → Add
3. Assign Assets → Selecione seu app WhatsApp
4. Generate New Token
5. Permissões: whatsapp_business_messaging
6. Copie o token (não será mostrado novamente!)
```

---

### ❌ "WhatsAppAuthError: Não autorizado"

**Causa:** Token inválido ou sem permissões.

**Verificações:**
```bash
# 1. Verificar se token está no .env
cat .env | grep WHATSAPP_TOKEN

# 2. Verificar se não tem espaços extras
# ✅ Correto: WHATSAPP_TOKEN=EAAxxxx
# ❌ Errado:  WHATSAPP_TOKEN= EAAxxxx (espaço após =)

# 3. Testar token manualmente
curl -X GET "https://graph.facebook.com/v18.0/me" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Erros de Validação

### ❌ "WhatsAppValidationError: Número de telefone inválido"

**Causa:** Formato do número incorreto.

**Formato correto:**
```python
# ✅ Correto (sem +, espaços ou hífens)
"5511999999999"  # Brasil: 55 + 11 + 999999999

# ❌ Errado
"+5511999999999"  # Não use +
"55 11 99999-9999"  # Não use espaços ou hífens
"11999999999"  # Falta código do país (55)
```

**Solução:**
```python
from whatsapp_kit.utils import format_phone_number

# Formata automaticamente
phone = format_phone_number("+55 (11) 99999-9999")
# Resultado: "5511999999999"
```

---

### ❌ "WhatsAppValidationError: Texto muito longo"

**Causa:** Mensagem excede 4096 caracteres.

**Solução:**
```python
from whatsapp_kit.utils import truncate_text

# Truncar texto automaticamente
text = truncate_text(long_text, max_length=4096)
```

---

## Erros de API

### ❌ "WhatsAppAPIError: (#100) Invalid parameter"

**Causas comuns:**
1. Template name incorreto
2. Parâmetros faltando
3. Formato de payload inválido

**Solução:**
```python
# Verificar nome do template
# Deve ser exatamente como cadastrado no Meta Business
await service.send_template(
    to="5511999999999",
    template_name="payment_reminder",  # Nome exato!
    language_code="pt_BR"
)
```

---

### ❌ "WhatsAppAPIError: (#131009) Parameter value is not valid"

**Causa:** Phone Number ID incorreto.

**Verificação:**
```bash
# 1. Verificar Phone Number ID no .env
cat .env | grep PHONE_NUMBER_ID

# 2. Verificar no Meta Business Manager:
# WhatsApp > Phone Numbers > copie o ID numérico
```

---

## Problemas com Webhooks

### ❌ Webhook não recebe mensagens

**Verificações:**

1. **URL está acessível publicamente?**
```bash
# Use ngrok para expor localhost
ngrok http 8000

# Copie a URL HTTPS gerada
# Ex: https://abc123.ngrok.io
```

2. **URL configurada no Meta Business?**
```
Meta Business Manager → WhatsApp → Configuration
Webhook URL: https://seu-dominio.com/webhooks/whatsapp
Verify Token: mesmo valor do .env
```

3. **Subscriptions ativas?**
```
Certifique-se de estar subscrito em:
- messages
- message_status (opcional)
```

4. **Verificar logs:**
```python
# Adicione logs detalhados no webhook
@app.post("/webhook")
async def webhook(request: Request):
    body = await request.json()
    print(f"📨 Webhook received: {json.dumps(body, indent=2)}")
    # ...
```

---

### ❌ "Error 403: Verification failed"

**Causa:** Verify token incorreto.

**Solução:**
```python
# Garanta que o verify token no código...
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")

# ...seja EXATAMENTE o mesmo configurado no Meta Business Manager
```

---

## Problemas de Conexão

### ❌ "WhatsAppTimeoutError: Timeout após 30s"

**Causas:**
1. Conexão lenta
2. API do WhatsApp sobrecarregada
3. Timeout muito curto

**Soluções:**
```python
# 1. Aumentar timeout
config = WhatsAppConfig.from_env()
config.timeout = 60.0  # 60 segundos
service = WhatsAppService(config)

# 2. Implementar retry
from tenacity import retry, stop_after_attempt

@retry(stop=stop_after_attempt(3))
async def send_with_retry(phone, text):
    return await service.send_text_message(phone, text)
```

---

## Problemas com Mídia

### ❌ "WhatsAppMediaError: Error downloading media"

**Verificações:**

1. **URL é pública?**
```python
# ✅ URL deve ser acessível sem autenticação
"https://example.com/public/image.jpg"

# ❌ URLs que requerem login não funcionam
"https://example.com/private/image.jpg"
```

2. **HTTPS obrigatório:**
```python
# ✅ Use HTTPS
media_url="https://example.com/image.jpg"

# ❌ HTTP não funciona
media_url="http://example.com/image.jpg"
```

3. **Tamanho do arquivo:**
```
Limites:
- Imagem: 5MB
- Vídeo: 16MB
- Áudio: 16MB
- Documento: 100MB
```

---

### ❌ Imagem enviada, mas não aparece no WhatsApp

**Causas:**
1. Formato não suportado
2. Imagem corrompida
3. URL expirou

**Formatos suportados:**
- Imagem: JPG, PNG
- Vídeo: MP4, 3GPP
- Áudio: MP3, OGG, AMR
- Documento: PDF, DOCX, XLSX, etc

---

## Problemas de Rate Limit

### ❌ "WhatsAppRateLimitError: Rate limit exceeded"

**Causa:** Muitas requisições em curto período.

**Limites do WhatsApp:**
- ~80 mensagens/segundo (varia por conta)
- Limite diário por conta
- Limite por destinatário

**Solução:**
```python
import asyncio
from asyncio import Semaphore

async def send_with_rate_limit(recipients):
    """Limita envios concorrentes"""
    service = WhatsAppService()
    semaphore = Semaphore(10)  # Máx 10 concurrent
    
    async def send_one(phone, text):
        async with semaphore:
            try:
                await service.send_text_message(phone, text)
                await asyncio.sleep(0.1)  # 100ms entre mensagens
            except WhatsAppRateLimitError as e:
                if e.retry_after:
                    await asyncio.sleep(e.retry_after)
    
    tasks = [send_one(p, t) for p, t in recipients]
    await asyncio.gather(*tasks, return_exceptions=True)
    await service.close()
```

---

## Problemas de Configuração

### ❌ "WhatsAppConfigError: Token do WhatsApp é obrigatório"

**Causa:** Arquivo `.env` não encontrado ou vazio.

**Verificações:**
```bash
# 1. Arquivo existe?
ls -la .env

# 2. Conteúdo está correto?
cat .env

# 3. python-dotenv instalado?
pip install python-dotenv

# 4. .env no diretório correto?
# Deve estar na raiz onde você executa o script
pwd
ls .env
```

---

## Mensagens Não Chegam

### Possíveis causas:

1. **Número não tem WhatsApp**
   - Só funciona com números que têm WhatsApp ativo

2. **Número não está na lista de teste**
   - Durante desenvolvimento, apenas números cadastrados podem receber
   - Meta Business → WhatsApp → Phone Numbers → To
   - Adicione o número de teste

3. **Conta não verificada**
   - Verifique status da conta no Meta Business

4. **Limite de mensagens atingido**
   - Contas novas têm limites baixos
   - Verifique limits no dashboard

---

## Debug Avançado

### Habilitar logs detalhados:

```python
from whatsapp_kit.utils import setup_logging

# Habilitar modo DEBUG
setup_logging(level="DEBUG", log_file="debug.log")

# Logs incluirão:
# - Todas as requisições HTTP
# - Payloads completos
# - Respostas da API
# - Stack traces detalhados
```

### Testar conectividade com a API:

```python
import httpx

async def test_api_connection():
    """Testa conexão com API do WhatsApp"""
    url = "https://graph.facebook.com/v18.0/me"
    headers = {"Authorization": f"Bearer {YOUR_TOKEN}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
```

---

## Ainda com Problemas?

### Checklist Final:

- [ ] Token permanente (não temporário de 24h)
- [ ] Phone Number ID correto
- [ ] `.env` no lugar certo
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Número tem WhatsApp ativo
- [ ] Número na lista de teste (se dev)
- [ ] Formato do número correto (sem +)
- [ ] Webhook URL pública (HTTPS)
- [ ] Verify token correto
- [ ] Subscriptions ativas
- [ ] Logs habilitados para debug

### Recursos Úteis:

- 📖 [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- 🔧 [Status da API](https://developers.facebook.com/status/)
- 💬 [Meta Business Support](https://business.facebook.com/business/help)

---

**Dica:** Mantenha os logs sempre ativos em desenvolvimento para diagnosticar problemas rapidamente!
