"""
WhatsApp Integration Kit - SOLID COMPLIANT

Kit completo e reutilizável para integração com WhatsApp Business API.
Totalmente refatorado seguindo princípios SOLID.

Quick Start:
    >>> from whatsapp_kit import WhatsAppService, WhatsAppConfig
    >>>
    >>> # Opção 1: Factory method (cria dependências automaticamente)
    >>> service = WhatsAppService.create_default()
    >>>
    >>> # Opção 2: Injeção manual de dependências (SOLID - DIP)
    >>> from whatsapp_kit.core.base_client import BaseHTTPClient
    >>> from whatsapp_kit.utils.validators import WhatsAppValidator
    >>>
    >>> config = WhatsAppConfig.from_env()
    >>> http_client = BaseHTTPClient(timeout=30)
    >>> validator = WhatsAppValidator()
    >>>
    >>> service = WhatsAppService(
    ...     config=config,
    ...     http_client=http_client,
    ...     validator=validator
    ... )
    >>>
    >>> # Enviar mensagem
    >>> await service.send_text_message("5511999999999", "Olá!")
"""

__version__ = "2.0.0"  # Incrementado para versão SOLID

from .config import WhatsAppConfig, get_default_config, set_default_config
from .services import WhatsAppService
from .core.exceptions import (
    WhatsAppException,
    WhatsAppAPIError,
    WhatsAppAuthError,
    WhatsAppValidationError,
    WhatsAppTimeoutError,
    WhatsAppRateLimitError,
    WhatsAppMediaError,
    WhatsAppWebhookError,
    WhatsAppConfigError,
)
from .core.interfaces import (
    IValidator,
    IFormatter,
    IHTTPClient,
    IMessageSender,
    IMediaHandler,
    IInteractiveMessages,
)
from .utils.validators import WhatsAppValidator
from .utils.helpers import MessageHelper, PhoneHelper, ResponseHelper
from .core.base_client import BaseHTTPClient

# Message Components (Reusable)
from .messages import (
    create_text_message,
    create_button_message,
    create_list_message,
    create_location_request,
    create_image_message,
    create_document_message,
    create_audio_message,
    create_video_message,
)

__all__ = [
    # Version
    "__version__",

    # Configuration
    "WhatsAppConfig",
    "get_default_config",
    "set_default_config",

    # Services
    "WhatsAppService",

    # Exceptions
    "WhatsAppException",
    "WhatsAppAPIError",
    "WhatsAppAuthError",
    "WhatsAppValidationError",
    "WhatsAppTimeoutError",
    "WhatsAppRateLimitError",
    "WhatsAppMediaError",
    "WhatsAppWebhookError",
    "WhatsAppConfigError",

    # Interfaces (SOLID - DIP, ISP)
    "IValidator",
    "IFormatter",
    "IHTTPClient",
    "IMessageSender",
    "IMediaHandler",
    "IInteractiveMessages",

    # Implementações concretas
    "WhatsAppValidator",
    "BaseHTTPClient",

    # Helpers (SOLID - SRP)
    "MessageHelper",
    "PhoneHelper",
    "ResponseHelper",

    # Message Components (Reusable)
    "create_text_message",
    "create_button_message",
    "create_list_message",
    "create_location_request",
    "create_image_message",
    "create_document_message",
    "create_audio_message",
    "create_video_message",
]
