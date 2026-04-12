# Quick Start - Comece em 5 Minutos ⚡

Guia rápido para enviar sua primeira mensagem WhatsApp.

---

## Passo 1: Obter Credenciais WhatsApp (2 min)

### A. Acessar Meta for Developers

1. Acesse: https://developers.facebook.com/
2. Faça login com sua conta Facebook
3. Clique em **"My Apps"** → **"Create App"**

### B. Configurar WhatsApp Business

1. Selecione tipo: **"Business"**
2. Preencha informações do app
3. No dashboard, clique em **"Add Product"**
4. Selecione **"WhatsApp"** → **"Set Up"**

### C. Obter Credenciais

Na tela de **API Setup**, você verá:

```
📱 Phone Number ID: 123456789012345
🔑 Temporary Access Token: EAAxxxx...
```

**IMPORTANTE:**  
- O token temporário dura apenas 24h
- Para produção, gere um **token permanente** (veja abaixo)

### D. Token Permanente (Produção)

1. Vá em **Meta Business Suite** → **Business Settings**
2. Navegue para **System Users**
3. Clique em **Add** → Crie um system user
4. Em **Assign Assets**, adicione o app WhatsApp
5. Clique em **Generate New Token**
6. Selecione permissões: `whatsapp_business_messaging`
7. Copie e salve o token (não será mostrado novamente!)

---

## Passo 2: Configurar Projeto (1 min)

### A. Copiar Kit para Seu Projeto

```bash
# Copie a pasta para seu projeto
cp -r whatsapp-integration-kit/ /caminho/do/seu/projeto/

cd /caminho/do/seu/projeto/whatsapp-integration-kit
```

### B. Instalar Dependências

```bash
# Crie ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instale dependências
pip install -r requirements.txt
```

Dependências instaladas:
- `httpx` - Cliente HTTP async
- `loguru` - Logging avançado  
- `python-dotenv` - Variáveis de ambiente
- `fastapi` - Para webhooks (opcional)

---

## Passo 3: Configurar Credenciais (1 min)

### A. Criar Arquivo .env

```bash
# Copie o template
cp .env.example .env

# Edite o arquivo
nano .env  # ou use seu editor favorito
```

### B. Preencher Credenciais

```env
# Cole suas credenciais obtidas no Passo 1
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345

# Opcional: para webhooks
WHATSAPP_VERIFY_TOKEN=meu_token_secreto_123
```

**Dica:** Use um token longo e aleatório para `VERIFY_TOKEN`

---

## Passo 4: Enviar Primeira Mensagem (1 min)

### A. Criar Arquivo test.py

```python
# test.py
import asyncio
from whatsapp_kit import WhatsAppService

async def main():
    # Inicializar serviço (carrega .env automaticamente)
    service = WhatsAppService()
    
    # IMPORTANTE: Substitua pelo SEU número (formato: código país + DDD + número)
    phone = "5511999999999"  # Exemplo: Brasil (55) + São Paulo (11) + número
    
    # Enviar mensagem
    print(f"📤 Enviando mensagem para {phone}...")
    
    try:
        response = await service.send_text_message(
            to=phone,
            text="🎉 Minha primeira mensagem via WhatsApp Integration Kit!"
        )
        
        message_id = service.extract_message_id(response)
        print(f"✅ Sucesso! Message ID: {message_id}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    finally:
        await service.close()

# Executar
asyncio.run(main())
```

### B. Executar

```bash
python test.py
```

**Resultado esperado:**

```
📤 Enviando mensagem para 5511999999999...
✅ Sucesso! Message ID: wamid.xxx==
```

**🎉 Parabéns!** Você enviou sua primeira mensagem!

---

## Próximos Passos

Agora que você enviou sua primeira mensagem, explore:

### 1. Exemplos Básicos

```bash
cd examples/01_basic/

# Enviar texto simples
python send_simple_message.py

# Enviar template
python send_template.py

# Enviar mídia (imagem, documento)
python send_media.py
```

### 2. Mensagens Interativas

```bash
cd examples/02_interactive/

# Botões
python send_buttons.py

# Botão com link (CTA)
python send_cta_url.py
```

### 3. Webhooks (Receber Mensagens)

```bash
cd examples/03_webhooks/

# Iniciar servidor de webhook
python fastapi_webhook.py

# Em outro terminal, expor com ngrok
ngrok http 8000
```

Copie a URL do ngrok e configure no Meta Business Manager:
- URL: `https://xxx.ngrok.io/webhooks/whatsapp`
- Verify Token: o valor do seu `.env`

### 4. Casos de Uso Completos

```bash
cd examples/04_use_cases/

# Sistema de cobrança
cd billing_system/
python send_payment_reminder.py

# Atendimento ao cliente
cd customer_support/
python chatbot_menu.py
```

---

## Troubleshooting Rápido

### ❌ Erro: "WhatsAppConfigError: Token do WhatsApp é obrigatório"

**Solução:** Verifique se o `.env` existe e tem o token correto

```bash
# Verificar se .env existe
ls -la .env

# Ver conteúdo (sem expor token completo)
cat .env | grep WHATSAPP_TOKEN
```

### ❌ Erro: "WhatsAppAuthError: Token de acesso expirado"

**Solução:** Token temporário expirou (dura 24h)
- Gere um token permanente (Passo 1D)
- Ou gere um novo token temporário

### ❌ Erro: "WhatsAppValidationError: Número de telefone inválido"

**Solução:** Formato do número deve ser: `código_país + DDD + número`

```python
# ✅ Correto
"5511999999999"  # Brasil

# ❌ Errado
"+55 11 99999-9999"  # Não use +, espaços ou hífens
"11999999999"        # Falta código do país
```

### ❌ Mensagem não chega

**Possíveis causas:**

1. **Número não tem WhatsApp** - Só funciona com números que têm WhatsApp
2. **Número não está no teste** - Durante desenvolvimento, apenas números cadastrados em "Phone Numbers" > "To" podem receber
3. **Conta não verificada** - Verifique status da conta no Meta Business

---

## Formatos de Número Por País

| País | Código | Formato | Exemplo |
|------|--------|---------|---------|
| 🇧🇷 Brasil | 55 | 55 + DDD + número | 5511999999999 |
| 🇺🇸 EUA | 1 | 1 + área + número | 14155551234 |
| 🇦🇷 Argentina | 54 | 54 + área + número | 5491123456789 |
| 🇲🇽 México | 52 | 52 + área + número | 5215512345678 |
| 🇵🇹 Portugal | 351 | 351 + número | 351912345678 |

---

## Recursos Úteis

- 📖 **[README.md](README.md)** - Documentação completa
- 🎓 **[Examples](examples/)** - 15+ exemplos práticos
- 🔧 **[API Reference](docs/API_REFERENCE.md)** - Métodos disponíveis
- 💬 **[WhatsApp Docs](https://developers.facebook.com/docs/whatsapp)** - Documentação oficial

---

## Checklist de Setup

- [ ] Conta criada no Meta for Developers
- [ ] App criado com produto WhatsApp
- [ ] Token obtido (temporário ou permanente)
- [ ] Phone Number ID copiado
- [ ] Kit copiado para projeto
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivo `.env` criado e configurado
- [ ] Primeira mensagem enviada com sucesso ✅

---

**Pronto para o próximo nível?** 🚀

Explore os [Casos de Uso Completos](examples/04_use_cases/) para ver implementações reais de:
- Sistema de cobrança
- Chatbot de atendimento
- Confirmação de pedidos
- Notificações em massa

**Happy Coding!** 💻✨
