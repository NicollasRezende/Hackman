"""
Exemplo: Webhook WhatsApp com FastAPI

Implementação completa de webhook para receber mensagens e status do WhatsApp.
Este exemplo mostra como:
- Verificar webhook (GET)
- Receber mensagens (POST)
- Processar diferentes tipos de mensagem
- Baixar mídia recebida
"""

from fastapi import FastAPI, Request, HTTPException
from whatsapp_kit import WhatsAppService, WhatsAppConfig
import os

app = FastAPI()

# Configurar serviço WhatsApp
service = WhatsAppService()

# Token de verificação (deve estar no .env)
VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "my_verify_token")


@app.get("/webhooks/whatsapp")
async def verify_webhook(request: Request):
    """
    Endpoint de verificação do webhook
    
    O WhatsApp chamará este endpoint com parâmetros de verificação.
    Você deve responder com o challenge se o token estiver correto.
    """
    # Parâmetros enviados pelo WhatsApp
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    # Verificar token
    if mode == "subscribe" and token == VERIFY_TOKEN:
        print("✅ Webhook verified successfully!")
        return int(challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhooks/whatsapp")
async def receive_webhook(request: Request):
    """
    Endpoint para receber mensagens e status
    
    O WhatsApp envia dados de mensagens recebidas, status de entrega,
    e outros eventos para este endpoint.
    """
    try:
        body = await request.json()
        print(f"\n📨 Webhook received: {body}\n")
        
        # Verificar se é uma notificação de mensagem
        if body.get("object") != "whatsapp_business_account":
            return {"status": "ignored"}
        
        # Processar entries
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                # Processar mensagens recebidas
                if "messages" in value:
                    await process_messages(value)
                
                # Processar status de mensagens enviadas
                if "statuses" in value:
                    await process_statuses(value)
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"❌ Error processing webhook: {e}")
        return {"status": "error", "message": str(e)}


async def process_messages(value: dict):
    """Processa mensagens recebidas"""
    messages = value.get("messages", [])
    
    for message in messages:
        # Dados da mensagem
        from_number = message.get("from")
        message_id = message.get("id")
        message_type = message.get("type")
        timestamp = message.get("timestamp")
        
        print(f"\n📩 Nova mensagem de {from_number}")
        print(f"Type: {message_type}")
        print(f"ID: {message_id}")
        
        # Marcar como lida
        await service.mark_as_read(message_id)
        
        # Processar por tipo
        if message_type == "text":
            text_body = message.get("text", {}).get("body", "")
            print(f"Texto: {text_body}")
            
            # Responder automaticamente
            await service.send_text_message(
                to=from_number,
                text=f"Recebi sua mensagem: '{text_body}'"
            )
        
        elif message_type == "image":
            image_data = message.get("image", {})
            media_id = image_data.get("id")
            caption = image_data.get("caption", "")
            
            print(f"Imagem recebida - Media ID: {media_id}")
            print(f"Caption: {caption}")
            
            # Baixar imagem
            try:
                media_url = await service.get_media_url(media_id)
                save_path = f"storage/received_{media_id}.jpg"
                size = await service.download_media(media_url, save_path)
                print(f"✅ Imagem salva: {save_path} ({size} bytes)")
                
                # Confirmar recebimento
                await service.send_text_message(
                    to=from_number,
                    text="✅ Imagem recebida com sucesso!"
                )
            except Exception as e:
                print(f"❌ Erro ao baixar imagem: {e}")
        
        elif message_type == "document":
            doc_data = message.get("document", {})
            media_id = doc_data.get("id")
            filename = doc_data.get("filename", "document")
            
            print(f"Documento recebido: {filename}")
            
            # Baixar documento
            try:
                media_url = await service.get_media_url(media_id)
                save_path = f"storage/{filename}"
                size = await service.download_media(media_url, save_path)
                print(f"✅ Documento salvo: {save_path} ({size} bytes)")
                
                await service.send_text_message(
                    to=from_number,
                    text=f"✅ Documento '{filename}' recebido!"
                )
            except Exception as e:
                print(f"❌ Erro ao baixar documento: {e}")
        
        elif message_type == "button":
            # Resposta de botão interativo
            button_data = message.get("button", {})
            button_id = button_data.get("payload")
            button_text = button_data.get("text")
            
            print(f"Botão clicado: {button_text} (ID: {button_id})")
            
            # Processar ação do botão
            if button_id == "confirm_payment":
                await service.send_text_message(
                    to=from_number,
                    text="✅ Pagamento confirmado! Obrigado."
                )
            elif button_id == "cancel":
                await service.send_text_message(
                    to=from_number,
                    text="❌ Operação cancelada."
                )


async def process_statuses(value: dict):
    """Processa status de mensagens enviadas"""
    statuses = value.get("statuses", [])
    
    for status in statuses:
        message_id = status.get("id")
        status_type = status.get("status")
        recipient = status.get("recipient_id")
        
        print(f"\n📊 Status Update:")
        print(f"Message ID: {message_id}")
        print(f"Status: {status_type}")
        print(f"Recipient: {recipient}")
        
        # Status possíveis: sent, delivered, read, failed
        if status_type == "delivered":
            print("✅ Mensagem entregue")
        elif status_type == "read":
            print("👁️ Mensagem lida")
        elif status_type == "failed":
            error = status.get("errors", [{}])[0]
            print(f"❌ Falha no envio: {error}")


if __name__ == "__main__":
    import uvicorn
    
    print("\n🚀 Starting WhatsApp Webhook Server...")
    print("📍 Webhook URL: http://localhost:8000/webhooks/whatsapp")
    print("🔗 Use ngrok para expor publicamente: ngrok http 8000\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
