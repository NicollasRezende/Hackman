"""
Implementação SOLID do WhatsApp Business API Service

Este é o serviço principal REFATORADO seguindo todos os princípios SOLID:
- S: Responsabilidade única (orquestração de chamadas API)
- O: Aberto para extensão via interfaces
- L: Substituível por qualquer implementação de IHTTPClient
- I: Interfaces segregadas (IMessageSender, IMediaHandler, IInteractiveMessages)
- D: Depende de abstrações (IHTTPClient, IValidator), não implementações
"""

import httpx
from typing import Dict, Any, Optional, List
from loguru import logger

from ..config import WhatsAppConfig
from ..core.base_service import BaseWhatsAppService
from ..core.interfaces import IHTTPClient, IValidator
from ..core.base_client import BaseHTTPClient
from ..core.exceptions import (
    WhatsAppAPIError,
    WhatsAppAuthError,
    WhatsAppTimeoutError,
    WhatsAppMediaError,
    WhatsAppValidationError
)
from ..core.types import PhoneNumber, MessageID, TemplateLanguage, MediaType
from ..utils.validators import WhatsAppValidator
from ..utils.helpers import MessageHelper, PhoneHelper


class WhatsAppService(BaseWhatsAppService):
    """
    Serviço completo para WhatsApp Business API - REFATORADO COM SOLID

    Esta implementação segue todos os princípios SOLID:
    - Usa composição com IHTTPClient (LSP)
    - Injeta dependências (IValidator, IHTTPClient, Config) (DIP)
    - Responsabilidade única de orquestrar chamadas API (SRP)
    - Implementa interfaces segregadas (ISP)
    - Aberto para extensão sem modificação (OCP)

    Attributes:
        config: Configuração do WhatsApp
        http_client: Cliente HTTP (abstração)
        validator: Validador de dados (abstração)

    Example:
        # Injeção completa de dependências
        config = WhatsAppConfig.from_env()
        http_client = BaseHTTPClient(timeout=30)
        validator = WhatsAppValidator()

        service = WhatsAppService(
            config=config,
            http_client=http_client,
            validator=validator
        )

        await service.send_text_message("5511999999999", "Olá!")

        # Ou usar factory method (cria dependências automaticamente)
        service = WhatsAppService.create_default()
        await service.send_text_message("5511999999999", "Olá!")
    """

    def __init__(
        self,
        config: WhatsAppConfig,
        http_client: IHTTPClient,
        validator: IValidator
    ):
        """
        Inicializa o serviço WhatsApp com injeção de dependências

        Args:
            config: Configuração WhatsApp (INJETADA)
            http_client: Cliente HTTP (ABSTRAÇÃO - DIP)
            validator: Validador de dados (ABSTRAÇÃO - DIP)
        """
        self.config = config
        self._http_client = http_client
        self._validator = validator

        logger.info(f"WhatsAppService inicializado: {self.config}")

    @classmethod
    def create_default(cls, config: Optional[WhatsAppConfig] = None) -> "WhatsAppService":
        """
        Factory method para criar instância com dependências padrão

        Args:
            config: Configuração (se None, carrega do ambiente)

        Returns:
            Instância de WhatsAppService com dependências padrão

        Example:
            service = WhatsAppService.create_default()
            await service.send_text_message("5511999999999", "Teste")
        """
        if config is None:
            config = WhatsAppConfig.from_env()

        http_client = BaseHTTPClient(
            timeout=config.timeout,
            max_retries=config.max_retries
        )

        validator = WhatsAppValidator()

        return cls(config=config, http_client=http_client, validator=validator)

    async def close(self):
        """Fecha cliente HTTP e libera recursos"""
        await self._http_client.close()
        logger.debug("WhatsAppService resources closed")

    def _handle_error_response(self, response: httpx.Response) -> Dict[str, Any]:
        """
        Trata resposta de erro da API

        Args:
            response: Response do httpx

        Raises:
            WhatsAppAuthError ou WhatsAppAPIError
        """
        try:
            error_data = response.json()
            error_obj = error_data.get("error", {})
            error_message = error_obj.get("message", response.text)
            error_code = error_obj.get("code")
            error_type = error_obj.get("type")

        except:
            error_message = response.text
            error_code = None
            error_type = None

        # Erros de autenticação
        if response.status_code in [401, 403]:
            raise WhatsAppAuthError(
                f"Erro de autenticação ({response.status_code}): {error_message}"
            )

        # Token expirado
        if error_code == 190 or "expired" in error_message.lower():
            raise WhatsAppAuthError(
                "Token de acesso expirado. Gere um novo token no Meta Business."
            )

        # Erro genérico da API
        raise WhatsAppAPIError(
            message=f"WhatsApp API Error: {error_message}",
            status_code=response.status_code,
            error_code=error_code,
            error_type=error_type,
            response_data=error_data if "error_data" in locals() else {}
        )

    # ========================================================================
    # Implementação de IMessageSender
    # ========================================================================

    async def send_text_message(
        self,
        to: PhoneNumber,
        text: str,
        preview_url: bool = True
    ) -> Dict[str, Any]:
        """
        Envia mensagem de texto simples

        Args:
            to: Número do destinatário (ex: 5511999999999)
            text: Texto da mensagem (máx 4096 caracteres)
            preview_url: Se True, mostra preview de URLs (default: True)

        Returns:
            Resposta da API com message_id

        Raises:
            WhatsAppValidationError: Dados inválidos
            WhatsAppAPIError: Erro da API

        Example:
            response = await service.send_text_message(
                to="5511999999999",
                text="Olá! Como posso ajudar?"
            )
            message_id = MessageHelper.extract_message_id(response)
        """
        # Validações usando abstração injetada (DIP)
        to = self._validator.validate_phone_number(to)
        self._validator.validate_message_text(text)

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
                "preview_url": preview_url,
                "body": text
            }
        }

        logger.info(f"Sending text message to {PhoneHelper.mask_phone_number(to)}")

        return await self._http_client.post(
            self.config.messages_url,
            json=payload,
            headers=self.config.get_headers()
        )

    async def send_template(
        self,
        to: PhoneNumber,
        template_name: str,
        language_code: TemplateLanguage = "pt_BR",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem template pré-aprovada

        Templates devem ser criados e aprovados no Meta Business Manager.
        Use templates para iniciar conversas com clientes.

        Args:
            to: Número do destinatário
            template_name: Nome do template (ex: "hello_world")
            language_code: Código do idioma (pt_BR, en_US, es_ES)
            components: Lista de componentes com parâmetros

        Returns:
            Resposta da API com message_id

        Example:
            # Template simples sem parâmetros
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
        """
        to = self._validator.validate_phone_number(to)
        self._validator.validate_template_name(template_name)
        self._validator.validate_language_code(language_code)

        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }

        if components:
            payload["template"]["components"] = components

        logger.info(f"Sending template '{template_name}' to {PhoneHelper.mask_phone_number(to)}")

        return await self._http_client.post(
            self.config.messages_url,
            json=payload,
            headers=self.config.get_headers()
        )

    # ========================================================================
    # Implementação de IMediaHandler
    # ========================================================================

    async def send_media(
        self,
        to: PhoneNumber,
        media_type: str,
        media_id: Optional[str] = None,
        media_url: Optional[str] = None,
        caption: Optional[str] = None,
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envia mídia (imagem, vídeo, documento, áudio)

        Você pode enviar mídia de duas formas:
        1. Por ID (mídia já uploadada na API)
        2. Por URL (URL pública acessível)

        Args:
            to: Número do destinatário
            media_type: Tipo (image, video, document, audio)
            media_id: ID da mídia (OU use media_url)
            media_url: URL pública da mídia (OU use media_id)
            caption: Legenda (apenas para image/video)
            filename: Nome do arquivo (apenas para document)

        Returns:
            Resposta da API com message_id

        Raises:
            WhatsAppValidationError: Se nem media_id nem media_url fornecidos

        Example:
            # Enviar por URL
            await service.send_media(
                to="5511999999999",
                media_type="image",
                media_url="https://example.com/image.jpg",
                caption="Confira essa imagem!"
            )

            # Enviar documento
            await service.send_media(
                to="5511999999999",
                media_type="document",
                media_url="https://example.com/invoice.pdf",
                filename="fatura_janeiro.pdf"
            )
        """
        to = self._validator.validate_phone_number(to)

        if not media_id and not media_url:
            raise WhatsAppValidationError(
                "Forneça media_id OU media_url"
            )

        if media_url:
            self._validator.validate_media_url(media_url)

        # Construir objeto de mídia
        media_obj = {}
        if media_id:
            media_obj["id"] = media_id
        elif media_url:
            media_obj["link"] = media_url

        # Adicionar caption/filename conforme tipo
        if caption and media_type in ["image", "video"]:
            media_obj["caption"] = caption

        if filename and media_type == "document":
            media_obj["filename"] = filename

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": media_type,
            media_type: media_obj
        }

        logger.info(f"Sending {media_type} to {PhoneHelper.mask_phone_number(to)}")

        return await self._http_client.post(
            self.config.messages_url,
            json=payload,
            headers=self.config.get_headers()
        )

    async def get_media_url(self, media_id: str) -> str:
        """
        Obtém URL de download de uma mídia recebida

        Quando você recebe mídia via webhook, recebe um media_id.
        Use este método para obter a URL de download.

        Args:
            media_id: ID da mídia no WhatsApp

        Returns:
            URL para download (válida por tempo limitado)

        Example:
            # Recebeu media_id do webhook
            media_url = await service.get_media_url(media_id)
            await service.download_media(media_url, "comprovante.jpg")
        """
        url = f"{self.config.api_url}/{media_id}"

        logger.info(f"Getting media URL for {media_id}")

        response = await self._http_client.get(
            url,
            headers=self.config.get_headers()
        )

        media_url = response.get("url")
        if not media_url:
            raise WhatsAppMediaError(
                f"URL não encontrada na resposta: {response}"
            )

        return media_url

    async def download_media(
        self,
        media_url: str,
        save_path: str
    ) -> int:
        """
        Faz download de mídia e salva localmente

        Args:
            media_url: URL de download obtida via get_media_url()
            save_path: Caminho completo onde salvar (ex: "storage/image.jpg")

        Returns:
            Tamanho do arquivo em bytes

        Example:
            media_url = await service.get_media_url(media_id)
            size = await service.download_media(media_url, "comprovante.jpg")
            print(f"Baixado: {size} bytes")
        """
        logger.info(f"Downloading media from {media_url}")
        logger.info(f"Saving to {save_path}")

        # Para download, usamos httpx diretamente (operação especial)
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.get(
                    media_url,
                    headers=self.config.get_headers()
                )

                if response.status_code >= 400:
                    raise WhatsAppMediaError(
                        f"Erro ao baixar mídia: {response.status_code}"
                    )

                # Salvar arquivo
                with open(save_path, "wb") as f:
                    f.write(response.content)

                file_size = len(response.content)
                logger.info(f"Media downloaded: {file_size} bytes")

                return file_size

            except httpx.TimeoutException:
                raise WhatsAppTimeoutError(
                    f"Timeout ao baixar mídia: {media_url}"
                )

    # ========================================================================
    # Implementação de IInteractiveMessages
    # ========================================================================

    async def send_interactive_buttons(
        self,
        to: PhoneNumber,
        body_text: str,
        buttons: List[Dict[str, str]],
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envia mensagem interativa com botões (máx 3)

        Args:
            to: Número do destinatário
            body_text: Texto principal da mensagem
            buttons: Lista de dicts com 'id' e 'title' (máx 3)
            header_text: Texto do cabeçalho (opcional)
            footer_text: Texto do rodapé (opcional)

        Returns:
            Resposta da API

        Example:
            await service.send_interactive_buttons(
                to="5511999999999",
                body_text="Selecione uma opção:",
                buttons=[
                    {"id": "btn_1", "title": "✅ Confirmar"},
                    {"id": "btn_2", "title": "❌ Cancelar"},
                ],
                footer_text="Responda em até 24h"
            )
        """
        to = self._validator.validate_phone_number(to)
        self._validator.validate_buttons_count(len(buttons))

        # Validar cada botão
        for btn in buttons:
            self._validator.validate_button_id(btn["id"])
            self._validator.validate_button_title(btn["title"])

        # Construir botões no formato da API
        action_buttons = []
        for btn in buttons:
            action_buttons.append({
                "type": "reply",
                "reply": {
                    "id": btn["id"],
                    "title": btn["title"][:20]  # Max 20 chars
                }
            })

        interactive = {
            "type": "button",
            "body": {"text": body_text},
            "action": {"buttons": action_buttons}
        }

        if header_text:
            interactive["header"] = {"type": "text", "text": header_text}

        if footer_text:
            interactive["footer"] = {"text": footer_text}

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": interactive
        }

        logger.info(f"Sending interactive buttons to {PhoneHelper.mask_phone_number(to)}")

        return await self._http_client.post(
            self.config.messages_url,
            json=payload,
            headers=self.config.get_headers()
        )

    async def send_cta_url(
        self,
        to: PhoneNumber,
        body_text: str,
        button_text: str,
        url: str
    ) -> Dict[str, Any]:
        """
        Envia mensagem com botão de CTA (Call-to-Action) com URL

        Args:
            to: Número do destinatário
            body_text: Texto da mensagem
            button_text: Texto do botão
            url: URL para abrir

        Returns:
            Resposta da API

        Example:
            await service.send_cta_url(
                to="5511999999999",
                body_text="Sua fatura está pronta!",
                button_text="💳 Pagar Agora",
                url="https://payments.example.com/invoice/123"
            )
        """
        to = self._validator.validate_phone_number(to)
        self._validator.validate_media_url(url)  # Valida URL

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "cta_url",
                "body": {"text": body_text},
                "action": {
                    "name": "cta_url",
                    "parameters": {
                        "display_text": button_text[:20],  # Max 20 chars
                        "url": url
                    }
                }
            }
        }

        logger.info(f"Sending CTA URL to {PhoneHelper.mask_phone_number(to)}")

        return await self._http_client.post(
            self.config.messages_url,
            json=payload,
            headers=self.config.get_headers()
        )

    # ========================================================================
    # Métodos auxiliares
    # ========================================================================

    async def mark_as_read(self, message_id: MessageID) -> Dict[str, Any]:
        """
        Marca mensagem como lida (exibe check azul para o remetente)

        Args:
            message_id: ID da mensagem recebida

        Returns:
            Resposta da API

        Example:
            # No webhook handler
            message_id = webhook_data["entry"][0]["changes"][0]["value"]["messages"][0]["id"]
            await service.mark_as_read(message_id)
        """
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }

        logger.info(f"Marking message as read: {message_id}")

        return await self._http_client.post(
            self.config.messages_url,
            json=payload,
            headers=self.config.get_headers()
        )
