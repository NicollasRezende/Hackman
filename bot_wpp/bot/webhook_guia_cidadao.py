"""
Webhook WhatsApp - Guia Cidadão IA Bot
Integração completa com bot de atendimento GDF
"""
import os
import sys
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from loguru import logger
from dotenv import load_dotenv

from whatsapp_client import whatsapp
from guia_cidadao_bot import GuiaCidadaoBot

load_dotenv()

# Configurar logging
logger.add(
    "logs/webhook.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO"
)

# Criar diretórios necessários
Path("logs").mkdir(exist_ok=True)
Path("storage/sessions").mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Guia Cidadão WhatsApp Bot")

# Config
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "meu_token_secreto_123")

# Inicializar bot
bot = GuiaCidadaoBot(whatsapp)


@app.get("/")
@app.post("/")
async def root():
    return {
        "status": "online",
        "service": "Guia Cidadão IA WhatsApp Bot",
        "version": "1.0.0",
        "organization": "Governo do Distrito Federal (GDF)",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/webhooks/whatsapp")
async def verify_webhook(request: Request):
    """Verificação do webhook pelo WhatsApp"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    logger.info(f"🔍 Verificação de webhook")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        logger.success("✅ Webhook verificado!")
        return int(challenge)
    else:
        logger.error("❌ Token incorreto")
        raise HTTPException(status_code=403, detail="Forbidden")


@app.post("/webhooks/whatsapp")
async def receive_webhook(request: Request):
    """Recebe mensagens do WhatsApp"""
    try:
        body = await request.json()

        logger.info("📨 Webhook recebido")

        if body.get("object") != "whatsapp_business_account":
            return {"status": "ignored"}

        # Processar entradas
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})

                # Processar mensagens
                messages = value.get("messages", [])
                for msg in messages:
                    phone = msg["from"]
                    msg_id = msg["id"]
                    msg_type = msg.get("type", "unknown")

                    logger.info(f"📱 Mensagem de {phone} (tipo: {msg_type})")

                    # Mensagem de texto
                    if msg_type == "text":
                        text = msg["text"]["body"]
                        await bot.handle_message(phone, text, "text")

                    # Resposta de botão interativo
                    elif msg_type == "interactive":
                        interactive = msg.get("interactive", {})
                        if interactive.get("type") == "button_reply":
                            button_reply = interactive.get("button_reply", {})
                            button_id = button_reply.get("id", "")
                            button_text = button_reply.get("title", "")
                            await bot.handle_button_reply(phone, button_id, button_text)

                        elif interactive.get("type") == "list_reply":
                            list_reply = interactive.get("list_reply", {})
                            list_id = list_reply.get("id", "")
                            list_title = list_reply.get("title", "")
                            await bot.handle_message(phone, list_title, "list")

                    # Outros tipos de mensagem
                    else:
                        logger.warning(f"⚠️ Tipo de mensagem não suportado: {msg_type}")
                        await bot.send_text(
                            phone,
                            "Desculpe, só consigo processar mensagens de texto no momento. "
                            "Por favor, digite sua dúvida."
                        )

                # Processar status de mensagens
                statuses = value.get("statuses", [])
                for status in statuses:
                    msg_id = status["id"]
                    status_type = status["status"]
                    logger.debug(f"📊 Status {msg_id}: {status_type}")

        return {"status": "success"}

    except Exception as e:
        logger.exception(f"❌ Erro no webhook: {e}")
        return {"status": "error", "message": str(e)}


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "Guia Cidadão Bot",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn

    PORT = int(os.getenv("PORT", 8000))

    logger.info(f"🚀 Iniciando servidor na porta {PORT}")

    uvicorn.run(
        "webhook_guia_cidadao:app",
        host="0.0.0.0",
        port=PORT,
        reload=True
    )
