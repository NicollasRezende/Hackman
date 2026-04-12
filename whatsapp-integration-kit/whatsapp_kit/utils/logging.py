"""
Configuração de logging para WhatsApp Integration Kit

Fornece setup padronizado de logging com loguru.
"""

import sys
from loguru import logger
from typing import Optional


def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    rotation: str = "10 MB",
    retention: str = "7 days",
    format_string: Optional[str] = None
):
    """
    Configura logging do sistema
    
    Args:
        level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Caminho para arquivo de log (opcional)
        rotation: Rotação de logs (default: 10 MB)
        retention: Tempo de retenção (default: 7 days)
        format_string: Formato customizado (opcional)
    
    Example:
        >>> setup_logging(
        ...     level="DEBUG",
        ...     log_file="logs/whatsapp.log"
        ... )
    """
    # Remove handlers padrão
    logger.remove()
    
    # Formato padrão
    if format_string is None:
        format_string = (
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        )
    
    # Handler para console
    logger.add(
        sys.stdout,
        format=format_string,
        level=level,
        colorize=True
    )
    
    # Handler para arquivo (se especificado)
    if log_file:
        logger.add(
            log_file,
            format=format_string,
            level=level,
            rotation=rotation,
            retention=retention,
            compression="zip"
        )
    
    logger.info(f"Logging configurado: level={level}")


def mask_sensitive_data(data: dict, keys: list = None) -> dict:
    """
    Mascara dados sensíveis em dicionário para logging seguro
    
    Args:
        data: Dicionário original
        keys: Lista de chaves para mascarar (default: token, password, secret)
    
    Returns:
        Dicionário com valores mascarados
    
    Example:
        >>> mask_sensitive_data({"token": "abc123", "name": "João"})
        {"token": "abc...[MASKED]", "name": "João"}
    """
    if keys is None:
        keys = ["token", "password", "secret", "key", "authorization"]
    
    masked = data.copy()
    
    for key in keys:
        if key in masked:
            value = str(masked[key])
            if len(value) > 10:
                masked[key] = f"{value[:10]}...[MASKED]"
            else:
                masked[key] = "[MASKED]"
    
    return masked
