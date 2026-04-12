# 🤖 Guia Cidadão IA - WhatsApp Bot

> **Assistente virtual oficial do Governo do Distrito Federal (GDF)**
> Orienta cidadãos do DF sobre serviços públicos via WhatsApp

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![WhatsApp Business API](https://img.shields.io/badge/WhatsApp-Business%20API-25D366.svg)](https://developers.facebook.com/docs/whatsapp)

---

## 📋 Visão Geral

O **Guia Cidadão IA** é um assistente de WhatsApp que ajuda cidadãos do Distrito Federal a acessar informações sobre serviços públicos de forma simples e sem burocracia.

### ✅ Serviços Atendidos

- 🏥 **Saúde** - SUS, UPA, consultas, medicamentos
- 💼 **Trabalho** - SINE, seguro-desemprego, vagas
- 🚗 **Trânsito** - DETRAN, CNH, multas, vistoria
- 🪪 **Documentos** - RG, CPF, certidões
- 🤝 **Assistência Social** - Bolsa Família, CRAS, BPC
- 🏦 **Previdência** - INSS, aposentadoria, benefícios

---

## 🎯 Features

- ✅ Respostas automáticas baseadas em palavras-chave
- ✅ Informações oficiais do GDF
- ✅ Links diretos para portais e agendamentos
- ✅ Telefones de contato e horários
- ✅ State machine para gerenciar conversas
- ✅ Persistência de sessões em JSON
- ✅ Logs estruturados com Loguru
- ✅ Mensagens interativas com botões

---

## 🚀 Quick Start

### 1. Pré-requisitos

- Python 3.8+
- Conta WhatsApp Business configurada
- Credenciais da WhatsApp Business API

> **💡 Dica:** Este bot usa as mesmas credenciais do `whatsapp-receiver/`

### 2. Instalação

```bash
cd hackthon/bot/

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configuração

O bot reutiliza o `.env` do `whatsapp-receiver/`:

```bash
# O script já cria um link simbólico automaticamente
# Mas você pode verificar:
ls -la .env

# Deve apontar para: ../../whatsapp-receiver/.env
```

### 4. Executar

```bash
./START_GUIA_CIDADAO.sh
```

O servidor inicia na porta **5001**.

### 5. Configurar Webhook

1. **Ngrok** (se local):
   ```bash
   ngrok http 5001
   ```

2. **Meta Business Manager**:
   - Webhook URL: `https://seu-ngrok.ngrok.io/webhooks/whatsapp`
   - Verify Token: (mesmo do `.env`)
   - Subscribe to: `messages`

---

## 📂 Estrutura do Projeto

```
hackthon/bot/
├── guia_cidadao_bot.py        # Bot principal com state machine
├── webhook_guia_cidadao.py    # Webhook FastAPI
├── whatsapp_client.py         # Symlink para whatsapp-receiver
├── START_GUIA_CIDADAO.sh      # Script de inicialização
├── requirements.txt           # Dependências Python
├── .env                       # Symlink para credenciais
├── logs/                      # Logs do webhook
│   └── webhook.log
└── storage/                   # Sessões dos usuários
    └── sessions/
        └── 5511999999999.json
```

---

## 🎓 Como Funciona

### Fluxo de Conversa

```
Usuário envia mensagem
    ↓
Webhook recebe
    ↓
Bot identifica palavras-chave
    ↓
Matcher retorna categoria de serviço
    ↓
Bot envia resposta estruturada
    ↓
Usuário pode fazer nova pergunta
```

### State Machine

```
INITIAL
  ↓ (primeira mensagem)
WAITING_QUESTION
  ↓ (processa pergunta)
WAITING_QUESTION (continua)
```

### Exemplo de Interação

```
👤 Usuário: "preciso de médico"

🤖 Bot:
━━━━━━━━━━━━━━━━━━━━
🏥 Saúde

Você tem direito ao atendimento gratuito pelo SUS.
Veja como acessar os serviços de saúde.

📋 Como proceder:

1. Para emergências: ligue 192 (SAMU) ou vá à UPA 24h
2. Para consultas: procure a UBS do seu bairro
3. A UBS vai encaminhar para especialistas via SISREG
4. Acompanhe em info.saude.df.gov.br

📞 Atendimento:
• Secretaria de Saúde do DF (SES-DF)
• Telefone: 160
• Horário: Seg–Sex, 8h–18h

🔗 Link oficial: https://www.saude.df.gov.br

Digite outra dúvida ou /menu para voltar ao início
━━━━━━━━━━━━━━━━━━━━
```

---

## 🛠️ Customização

### Adicionar Novo Serviço

Edite `guia_cidadao_bot.py:match_service_keywords()`:

```python
# Exemplo: adicionar suporte para "Educação"
elif any(keyword in text_lower for keyword in ["escola", "matrícula", "educação", "vaga"]):
    return {
        "category": "Educação",
        "icon": "📚",
        "intro": "Serviços de educação do DF...",
        "steps": [
            "Acesse www.se.df.gov.br",
            "Faça matrícula online em...",
            # ...
        ],
        "contact": {
            "title": "SEEDF",
            "phone": "156",
            "hours": "Seg–Sex, 8h–18h"
        },
        "link": "https://www.se.df.gov.br"
    }
```

### Integrar com Backend (API)

Para conectar com o backend Spring Boot:

```python
# Em guia_cidadao_bot.py
import httpx

class GuiaCidadaoBot:
    def __init__(self, whatsapp_client):
        self.whatsapp = whatsapp_client
        self.api_url = os.getenv("BACKEND_API_URL", "http://localhost:8080/api/v1")

    async def ask_backend(self, question: str) -> dict:
        """Envia pergunta para API backend"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/chat",
                json={"message": question}
            )
            return response.json()

    async def handle_message(self, phone: str, message: str, message_type: str = "text"):
        # ...
        # Em vez de match_service_keywords(), chamar:
        service_data = await self.ask_backend(message)
        # ...
```

---

## 📝 Variáveis de Ambiente

Configuradas em `whatsapp-receiver/.env`:

```env
# WhatsApp Business API
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=meu_token_secreto_123

# Servidor
PORT=5001

# Backend (opcional - para integração futura)
BACKEND_API_URL=http://localhost:8080/api/v1
```

---

## 🧪 Testando o Bot

### Teste Manual

1. Salve o número do WhatsApp Business nos contatos
2. Envie qualquer mensagem
3. O bot responde com menu de boas-vindas
4. Digite uma pergunta: `"preciso renovar minha CNH"`

### Comandos Especiais

- `/menu` ou `/start` - Volta ao menu inicial
- `menu` ou `início` - Mesma função

---

## 📊 Logs

Logs salvos em `logs/webhook.log`:

```
2026-04-12 10:30:15 | INFO | 📱 Mensagem de 5511999999999 (tipo: text)
2026-04-12 10:30:15 | INFO | 💬 [5511999999999] text: preciso de médico (estado: waiting_question)
2026-04-12 10:30:16 | SUCCESS | ✅ Mensagem enviada para 5511999999999
```

---

## 🔧 Troubleshooting

### Webhook não recebe mensagens

- ✅ Verifique se o ngrok está rodando: `ngrok http 5001`
- ✅ Verifique se a URL no Meta Business está correta
- ✅ Verifique o `VERIFY_TOKEN` no `.env`
- ✅ Veja os logs: `tail -f logs/webhook.log`

### Bot não responde

- ✅ Verifique se o servidor está rodando
- ✅ Verifique os logs de erro
- ✅ Teste com `/menu` para resetar

### Erro de importação

- ✅ Verifique se o whatsapp-integration-kit está acessível:
  ```bash
  ls -la ../whatsapp-integration-kit/
  ```

---

## 🚀 Próximos Passos

### Fase 1 - Bot Standalone ✅
- [x] Respostas baseadas em keywords
- [x] State machine básica
- [x] Persistência de sessões

### Fase 2 - Integração Backend (Planejado)
- [ ] Conectar com Spring Boot API
- [ ] Enviar perguntas para OpenRouter via backend
- [ ] Receber respostas estruturadas do LLM
- [ ] Exibir mapa de locais (via link)

### Fase 3 - Features Avançadas (Planejado)
- [ ] Consulta de Bolsa Família por NIS
- [ ] Agendamento de serviços presenciais
- [ ] Notificações proativas
- [ ] Dashboard de analytics

---

## 📖 Documentação Relacionada

- **[ai-context.md](../docs/ai-context.md)** - Base de conhecimento do GDF
- **[backend-api-spec.md](../docs/backend-api-spec.md)** - Spec da API Spring Boot
- **[whatsapp-integration-kit](../../whatsapp-integration-kit/)** - SDK WhatsApp reutilizável

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m "feat: adiciona novo serviço"`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - Use livremente em projetos do GDF.

---

## 👥 Autores

**Hackathon Brasília Virtual 2026 - Desafio 1**

---

## 📞 Suporte

- 📧 Email: suporte@guiacidadao.df.gov.br
- 📱 WhatsApp: (61) 9xxxx-xxxx
- 🌐 Portal: https://www.df.gov.br

---

**Feito com ❤️ para os cidadãos do Distrito Federal**

🚀 **Happy Coding!**
