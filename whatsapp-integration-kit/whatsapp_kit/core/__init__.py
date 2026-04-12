"""
Core module - Classes abstratas e tipos base (SOLID COMPLIANT)

Este módulo exporta todas as classes base, exceções, interfaces e tipos
necessários para construir serviços WhatsApp seguindo princípios SOLID.
"""

from .base_client import BaseHTTPClient
from .base_service import BaseWhatsAppService
from .interfaces import (
    IValidator,
    IFormatter,
    IHTTPClient,
    IMessageSender,
    IMediaHandler,
    IInteractiveMessages,
)
from .exceptions import (
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
from .types import (
    MessageType,
    InteractiveType,
    MessageStatus,
    MediaType,
    PhoneNumber,
    MessageID,
    MediaID,
    TemplateLanguage,
    WhatsAppMessage,
    WhatsAppAPIResponse,
    WebhookPayload,
)

__all__ = [
    # Base classes
    "BaseHTTPClient",
    "BaseWhatsAppService",

    # Interfaces (SOLID - DIP, ISP)
    "IValidator",
    "IFormatter",
    "IHTTPClient",
    "IMessageSender",
    "IMediaHandler",
    "IInteractiveMessages",

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

    # Enums
    "MessageType",
    "InteractiveType",
    "MessageStatus",
    "MediaType",

    # Type aliases
    "PhoneNumber",
    "MessageID",
    "MediaID",
    "TemplateLanguage",

    # TypedDicts
    "WhatsAppMessage",
    "WhatsAppAPIResponse",
    "WebhookPayload",
]
