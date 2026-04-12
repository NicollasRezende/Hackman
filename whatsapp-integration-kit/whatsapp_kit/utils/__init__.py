"""
Utilities module - Funções auxiliares (SOLID COMPLIANT)

Exporta todas as funções utilitárias do kit, agora incluindo
implementações SOLID e helpers.
"""

from .validators import (
    validate_phone_number,
    validate_message_text,
    validate_template_name,
    validate_media_url,
    validate_button_id,
    validate_button_title,
    validate_buttons_count,
    validate_list_sections,
    validate_language_code,
    WhatsAppValidator,  # Nova implementação SOLID
)

from .formatters import (
    format_phone_number,
    format_currency,
    format_date_br,
    truncate_text,
    escape_markdown,
    format_list_message,
)

from .logging import (
    setup_logging,
    mask_sensitive_data,
)

from .helpers import (
    MessageHelper,
    PhoneHelper,
    ResponseHelper,
)

__all__ = [
    # Validators (funções)
    "validate_phone_number",
    "validate_message_text",
    "validate_template_name",
    "validate_media_url",
    "validate_button_id",
    "validate_button_title",
    "validate_buttons_count",
    "validate_list_sections",
    "validate_language_code",

    # Validator class (SOLID - DIP)
    "WhatsAppValidator",

    # Formatters
    "format_phone_number",
    "format_currency",
    "format_date_br",
    "truncate_text",
    "escape_markdown",
    "format_list_message",

    # Logging
    "setup_logging",
    "mask_sensitive_data",

    # Helpers (SOLID - SRP)
    "MessageHelper",
    "PhoneHelper",
    "ResponseHelper",
]
