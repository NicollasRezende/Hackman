"""
Gerenciamento de configuração do WhatsApp Integration Kit

Este módulo fornece classes para configurar o serviço WhatsApp de forma
flexível: via variáveis de ambiente, arquivo .env, ou passando valores diretamente.
"""

import os
from typing import Optional
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False

from .core.exceptions import WhatsAppConfigError


@dataclass
class WhatsAppConfig:
    """
    Configuração completa para WhatsApp Business API
    
    Esta classe centraliza todas as configurações necessárias para usar
    a API do WhatsApp Business. Pode ser inicializada de várias formas:
    
    1. Passando valores diretamente ao construtor
    2. Lendo de variáveis de ambiente
    3. Lendo de arquivo .env
    
    Attributes:
        token: Access token do WhatsApp Business API (obrigatório)
        phone_number_id: ID do número de telefone WhatsApp (obrigatório)
        business_account_id: ID da conta Business (opcional)
        api_version: Versão da API (default: v18.0)
        base_url: URL base da API (default: https://graph.facebook.com)
        verify_token: Token para verificação de webhook (opcional)
        timeout: Timeout para requests em segundos (default: 30)
        max_retries: Número máximo de tentativas (default: 3)
    
    Example:
        # Opção 1: Valores diretos
        config = WhatsAppConfig(
            token="EAAabcd...",
            phone_number_id="123456789"
        )
        
        # Opção 2: Carregar do ambiente
        config = WhatsAppConfig.from_env()
        
        # Opção 3: Carregar de arquivo .env específico
        config = WhatsAppConfig.from_env_file(".env.production")
    """
    
    # Credenciais obrigatórias
    token: str
    phone_number_id: str
    
    # Credenciais opcionais
    business_account_id: Optional[str] = None
    verify_token: Optional[str] = None
    
    # Configurações da API
    api_version: str = "v18.0"
    base_url: str = "https://graph.facebook.com"
    
    # Configurações de conexão
    timeout: float = 30.0
    max_retries: int = 3
    
    # Configurações de logging
    log_level: str = "INFO"
    log_requests: bool = True
    log_responses: bool = True
    
    def __post_init__(self):
        """Valida configurações após inicialização"""
        self._validate()
    
    def _validate(self):
        """
        Valida se configurações obrigatórias foram fornecidas
        
        Raises:
            WhatsAppConfigError: Se alguma configuração obrigatória está faltando
        """
        if not self.token:
            raise WhatsAppConfigError(
                "Token do WhatsApp é obrigatório. "
                "Configure WHATSAPP_TOKEN no ambiente ou passe via construtor."
            )
        
        if not self.phone_number_id:
            raise WhatsAppConfigError(
                "Phone Number ID é obrigatório. "
                "Configure WHATSAPP_PHONE_NUMBER_ID no ambiente ou passe via construtor."
            )
        
        # Validar formato do token (deve começar com EAA ou ter length mínimo)
        if len(self.token) < 20:
            raise WhatsAppConfigError(
                f"Token parece inválido (muito curto): {len(self.token)} caracteres"
            )
    
    @property
    def api_url(self) -> str:
        """
        Retorna URL completa base da API
        
        Returns:
            URL base formatada: https://graph.facebook.com/v18.0
        """
        return f"{self.base_url.rstrip('/')}/{self.api_version}"
    
    @property
    def messages_url(self) -> str:
        """
        Retorna URL completa para envio de mensagens
        
        Returns:
            URL para POST de mensagens
        """
        return f"{self.api_url}/{self.phone_number_id}/messages"
    
    @property
    def media_url(self) -> str:
        """
        Retorna URL base para operações de mídia
        
        Returns:
            URL base para mídia
        """
        return f"{self.api_url}/{self.phone_number_id}/media"
    
    def get_headers(self) -> dict:
        """
        Retorna headers HTTP padrão para requisições
        
        Returns:
            Dict com Authorization e Content-Type
        """
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    @classmethod
    def from_env(cls, load_dotenv_file: bool = True) -> "WhatsAppConfig":
        """
        Cria configuração a partir de variáveis de ambiente
        
        Variáveis esperadas:
        - WHATSAPP_TOKEN (obrigatório)
        - WHATSAPP_PHONE_NUMBER_ID (obrigatório)
        - WHATSAPP_BUSINESS_ACCOUNT_ID (opcional)
        - WHATSAPP_VERIFY_TOKEN (opcional)
        - WHATSAPP_API_VERSION (opcional, default: v18.0)
        - WHATSAPP_BASE_URL (opcional, default: https://graph.facebook.com)
        - WHATSAPP_TIMEOUT (opcional, default: 30)
        - WHATSAPP_MAX_RETRIES (opcional, default: 3)
        - WHATSAPP_LOG_LEVEL (opcional, default: INFO)
        
        Args:
            load_dotenv_file: Se True, tenta carregar .env primeiro (default: True)
        
        Returns:
            Instância de WhatsAppConfig configurada
        
        Raises:
            WhatsAppConfigError: Se configurações obrigatórias não forem encontradas
        
        Example:
            config = WhatsAppConfig.from_env()
            service = WhatsAppService(config)
        """
        # Tentar carregar .env se disponível
        if load_dotenv_file and DOTENV_AVAILABLE:
            env_path = Path(".env")
            if env_path.exists():
                load_dotenv(env_path)
        
        # Ler variáveis de ambiente
        token = os.getenv("WHATSAPP_TOKEN", "")
        phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        
        # Variáveis opcionais
        business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
        verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
        api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
        base_url = os.getenv(
            "WHATSAPP_BASE_URL",
            "https://graph.facebook.com"
        )
        
        # Configurações numéricas
        try:
            timeout = float(os.getenv("WHATSAPP_TIMEOUT", "30"))
        except ValueError:
            timeout = 30.0
        
        try:
            max_retries = int(os.getenv("WHATSAPP_MAX_RETRIES", "3"))
        except ValueError:
            max_retries = 3
        
        # Configurações de logging
        log_level = os.getenv("WHATSAPP_LOG_LEVEL", "INFO")
        log_requests = os.getenv("WHATSAPP_LOG_REQUESTS", "true").lower() == "true"
        log_responses = os.getenv("WHATSAPP_LOG_RESPONSES", "true").lower() == "true"
        
        return cls(
            token=token,
            phone_number_id=phone_number_id,
            business_account_id=business_account_id,
            verify_token=verify_token,
            api_version=api_version,
            base_url=base_url,
            timeout=timeout,
            max_retries=max_retries,
            log_level=log_level,
            log_requests=log_requests,
            log_responses=log_responses,
        )
    
    @classmethod
    def from_env_file(cls, env_file: str) -> "WhatsAppConfig":
        """
        Cria configuração a partir de arquivo .env específico
        
        Args:
            env_file: Caminho para arquivo .env
        
        Returns:
            Instância de WhatsAppConfig
        
        Raises:
            WhatsAppConfigError: Se arquivo não existe ou config inválida
        
        Example:
            config = WhatsAppConfig.from_env_file(".env.production")
        """
        env_path = Path(env_file)
        
        if not env_path.exists():
            raise WhatsAppConfigError(
                f"Arquivo de configuração não encontrado: {env_file}"
            )
        
        if not DOTENV_AVAILABLE:
            raise WhatsAppConfigError(
                "python-dotenv não está instalado. "
                "Instale com: pip install python-dotenv"
            )
        
        # Carregar arquivo específico
        load_dotenv(env_path, override=True)
        
        # Criar config do ambiente
        return cls.from_env(load_dotenv_file=False)
    
    def to_dict(self) -> dict:
        """
        Converte configuração para dicionário
        
        Útil para logging e debugging (não inclui o token completo).
        
        Returns:
            Dict com configurações (token mascarado)
        """
        return {
            "token": f"{self.token[:10]}...[MASKED]",
            "phone_number_id": self.phone_number_id,
            "business_account_id": self.business_account_id,
            "api_version": self.api_version,
            "base_url": self.base_url,
            "timeout": self.timeout,
            "max_retries": self.max_retries,
            "api_url": self.api_url,
        }
    
    def __repr__(self) -> str:
        """Representação da configuração (token mascarado)"""
        return f"WhatsAppConfig(phone_number_id={self.phone_number_id}, api_version={self.api_version})"


# Instância global padrão (lazy loading)
_default_config: Optional[WhatsAppConfig] = None


def get_default_config() -> WhatsAppConfig:
    """
    Obtém configuração padrão global (singleton)
    
    Carrega configuração do ambiente na primeira chamada
    e reutiliza nas chamadas seguintes.
    
    Returns:
        Instância singleton de WhatsAppConfig
    
    Example:
        from whatsapp_kit.config import get_default_config
        
        config = get_default_config()
        print(config.api_url)
    """
    global _default_config
    
    if _default_config is None:
        _default_config = WhatsAppConfig.from_env()
    
    return _default_config


def set_default_config(config: WhatsAppConfig):
    """
    Define configuração padrão global
    
    Args:
        config: Instância de WhatsAppConfig
    
    Example:
        custom_config = WhatsAppConfig(
            token="...",
            phone_number_id="..."
        )
        set_default_config(custom_config)
    """
    global _default_config
    _default_config = config
