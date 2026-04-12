"""
Cliente WhatsApp Simples

Cliente minimalista para enviar mensagens e baixar mídia.
"""

import httpx
import os
from typing import Optional, Dict, Any
from loguru import logger
from dotenv import load_dotenv

load_dotenv()


class WhatsAppClient:
    """Cliente simples do WhatsApp Business API"""

    def __init__(self):
        self.token = os.getenv("WHATSAPP_TOKEN")
        self.phone_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        self.base_url = "https://graph.facebook.com/v22.0"

        if not self.token or not self.phone_id:
            raise ValueError("Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID no .env")

        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def normalize_brazilian_phone(self, phone: str) -> str:
        """
        Normaliza número de telefone brasileiro para o formato do WhatsApp.

        WhatsApp Brasil usa formato: 55 + DDD (2 dígitos) + 9 + número (8 dígitos)
        Exemplo: 5561991769500

        Se o número vier como 556191769500 (sem o 9 extra), adiciona o 9.
        """
        # Remove qualquer caractere não numérico
        phone = ''.join(filter(str.isdigit, phone))

        # Se começa com 55 (Brasil) e tem 12 dígitos (falta o 9)
        if phone.startswith('55') and len(phone) == 12:
            # Formato: 55 + DDD (2) + número (8) = 12 dígitos
            # Precisa adicionar o 9: 55 + DDD (2) + 9 + número (8) = 13 dígitos
            ddd = phone[2:4]  # Pega o DDD
            number = phone[4:]  # Pega o resto
            phone = f"55{ddd}9{number}"  # Adiciona o 9
            logger.debug(f"Normalizando número brasileiro: adicionando 9 → {phone}")

        return phone
    
    async def send_text(self, to: str, text: str) -> Dict[str, Any]:
        """
        Envia mensagem de texto

        Args:
            to: Número do destinatário (ex: 5511999999999)
            text: Texto da mensagem

        Returns:
            Resposta da API
        """
        # Normaliza número brasileiro (adiciona o 9 se necessário)
        to = self.normalize_brazilian_phone(to)

        url = f"{self.base_url}/{self.phone_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"body": text}
        }

        logger.info(f"📤 Enviando para {to}: {text[:50]}...")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)

            if response.status_code >= 400:
                logger.error(f"❌ Erro: {response.text}")
                response.raise_for_status()

            logger.success(f"✅ Mensagem enviada!")
            return response.json()

    async def send_buttons(self, to: str, body: str, buttons: list, footer: str = None) -> Dict[str, Any]:
        """
        Envia mensagem com botões interativos

        Args:
            to: Número do destinatário
            body: Texto principal da mensagem
            buttons: Lista de botões (max 3), cada um com 'id' e 'title'
            footer: Texto do rodapé (opcional)

        Returns:
            Resposta da API
        """
        # Normaliza número brasileiro
        to = self.normalize_brazilian_phone(to)

        url = f"{self.base_url}/{self.phone_id}/messages"

        # Formatar botões
        formatted_buttons = []
        for btn in buttons[:3]:  # WhatsApp permite max 3 botões
            formatted_buttons.append({
                "type": "reply",
                "reply": {
                    "id": btn["id"],
                    "title": btn["title"][:20]  # Max 20 caracteres
                }
            })

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": body},
                "action": {"buttons": formatted_buttons}
            }
        }

        if footer:
            payload["interactive"]["footer"] = {"text": footer[:60]}  # Max 60 caracteres

        logger.info(f"📤 Enviando botões para {to}")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)

            if response.status_code >= 400:
                logger.error(f"❌ Erro: {response.text}")
                response.raise_for_status()

            logger.success(f"✅ Botões enviados!")
            return response.json()

    async def send_list(self, to: str, body: str, button_text: str, sections: list, header: str = None, footer: str = None) -> Dict[str, Any]:
        """
        Envia lista interativa (até 10 opções)

        Args:
            to: Número do destinatário
            body: Texto principal
            button_text: Texto do botão (ex: "Ver opções")
            sections: Lista de seções, cada uma com title e rows
            header: Texto do cabeçalho (opcional)
            footer: Texto do rodapé (opcional)

        Returns:
            Resposta da API
        """
        to = self.normalize_brazilian_phone(to)
        url = f"{self.base_url}/{self.phone_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "list",
                "body": {"text": body},
                "action": {
                    "button": button_text[:20],
                    "sections": sections
                }
            }
        }

        if header:
            payload["interactive"]["header"] = {"type": "text", "text": header[:60]}
        if footer:
            payload["interactive"]["footer"] = {"text": footer[:60]}

        logger.info(f"📤 Enviando lista para {to}")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)

            if response.status_code >= 400:
                logger.error(f"❌ Erro: {response.text}")
                response.raise_for_status()

            logger.success(f"✅ Lista enviada!")
            return response.json()

    async def send_location_request(self, to: str, body: str) -> Dict[str, Any]:
        """
        Solicita localização do usuário

        Args:
            to: Número do destinatário
            body: Texto da mensagem

        Returns:
            Resposta da API
        """
        to = self.normalize_brazilian_phone(to)
        url = f"{self.base_url}/{self.phone_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "location_request_message",
                "body": {"text": body},
                "action": {"name": "send_location"}
            }
        }

        logger.info(f"📤 Solicitando localização de {to}")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)

            if response.status_code >= 400:
                logger.error(f"❌ Erro: {response.text}")
                response.raise_for_status()

            logger.success(f"✅ Solicitação de localização enviada!")
            return response.json()

    async def send_document(self, to: str, document_url: str, filename: str, caption: str = None) -> Dict[str, Any]:
        """
        Envia documento (PDF, DOCX, etc)

        Args:
            to: Número do destinatário
            document_url: URL pública do documento
            filename: Nome do arquivo
            caption: Legenda opcional

        Returns:
            Resposta da API
        """
        to = self.normalize_brazilian_phone(to)
        url = f"{self.base_url}/{self.phone_id}/messages"

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "document",
            "document": {
                "link": document_url,
                "filename": filename
            }
        }

        if caption:
            payload["document"]["caption"] = caption

        logger.info(f"📤 Enviando documento para {to}: {filename}")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)

            if response.status_code >= 400:
                logger.error(f"❌ Erro: {response.text}")
                response.raise_for_status()

            logger.success(f"✅ Documento enviado!")
            return response.json()

    async def mark_as_read(self, message_id: str):
        """Marca mensagem como lida"""
        url = f"{self.base_url}/{self.phone_id}/messages"
        
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(url, headers=self.headers, json=payload)
            logger.debug(f"✓ Mensagem {message_id} marcada como lida")
    
    async def get_media_url(self, media_id: str) -> str:
        """Obtém URL de download da mídia"""
        url = f"{self.base_url}/{media_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            data = response.json()
            return data.get("url")
    
    async def download_media(self, media_url: str, save_path: str) -> int:
        """Baixa mídia e salva localmente"""
        logger.info(f"📥 Baixando mídia para {save_path}")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(media_url, headers=self.headers)
            
            with open(save_path, "wb") as f:
                f.write(response.content)
            
            size = len(response.content)
            logger.success(f"✅ Mídia baixada: {size} bytes")
            return size


# Instância global
whatsapp = WhatsAppClient()
