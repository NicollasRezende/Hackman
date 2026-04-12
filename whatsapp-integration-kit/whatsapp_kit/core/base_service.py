"""
Serviço base abstrato para WhatsApp Business API - REFATORADO

Este módulo define interfaces segregadas (ISP) que serviços WhatsApp
devem implementar, garantindo consistência e seguindo SOLID.
"""

from abc import ABC
from typing import Dict, Any, Optional, List
from .interfaces import IMessageSender, IMediaHandler, IInteractiveMessages


class BaseWhatsAppService(IMessageSender, IMediaHandler, IInteractiveMessages, ABC):
    """
    Serviço base abstrato para WhatsApp Business API

    Esta classe combina todas as interfaces segregadas para formar
    um serviço WhatsApp completo. Implementações concretas devem
    herdar desta classe.

    As interfaces são segregadas em:
    - IMessageSender: Envio de mensagens básicas (texto, templates)
    - IMediaHandler: Manipulação de mídia (envio, download)
    - IInteractiveMessages: Mensagens interativas (botões, CTAs)

    Example:
        class MyWhatsAppService(BaseWhatsAppService):
            async def send_text_message(self, to, text, preview_url=True):
                # Implementação concreta
                ...
    """

    async def close(self):
        """
        Fecha recursos do serviço (conexões, clients, etc)

        Implementações concretas devem sobrescrever para cleanup.
        """
        pass

    async def __aenter__(self):
        """Context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.close()


# Alias para compatibilidade
BaseService = BaseWhatsAppService
