"""
Exceções customizadas para o WhatsApp Integration Kit

Este módulo define todas as exceções específicas do kit de integração WhatsApp,
permitindo tratamento de erros mais granular e específico.
"""

from typing import Optional, Dict, Any


class WhatsAppException(Exception):
    """
    Exceção base para todos os erros do WhatsApp Integration Kit

    Todos os erros específicos do kit herdam desta classe,
    facilitando o catch geral se necessário.
    """

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

    def __str__(self) -> str:
        if self.details:
            return f"{self.message} | Details: {self.details}"
        return self.message


class WhatsAppAPIError(WhatsAppException):
    """
    Erro retornado pela API do WhatsApp

    Levantado quando a API do WhatsApp retorna um erro (status code >= 400).
    Contém informações detalhadas sobre o erro para debugging.

    Attributes:
        status_code: HTTP status code retornado pela API
        error_code: Código de erro específico do WhatsApp (se disponível)
        error_type: Tipo do erro do WhatsApp (se disponível)

    Example:
        try:
            await service.send_message(...)
        except WhatsAppAPIError as e:
            if e.status_code == 401:
                print("Token inválido")
            elif e.error_code == 190:
                print("Token expirado")
    """

    def __init__(
        self,
        message: str,
        status_code: int,
        error_code: Optional[int] = None,
        error_type: Optional[str] = None,
        response_data: Optional[Dict[str, Any]] = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.error_type = error_type
        self.response_data = response_data or {}

        details = {
            "status_code": status_code,
            "error_code": error_code,
            "error_type": error_type
        }

        super().__init__(message, details)


class WhatsAppAuthError(WhatsAppException):
    """
    Erro de autenticação com a API do WhatsApp

    Levantado quando há problemas com o token de acesso:
    - Token inválido
    - Token expirado
    - Permissões insuficientes
    - Token não fornecido

    Example:
        try:
            service = WhatsAppService(token="invalid_token")
            await service.send_message(...)
        except WhatsAppAuthError:
            print("Problema com autenticação. Verifique seu token.")
    """
    pass


class WhatsAppValidationError(WhatsAppException):
    """
    Erro de validação de dados antes de enviar para a API

    Levantado quando os dados fornecidos são inválidos:
    - Número de telefone inválido
    - Parâmetros faltando
    - Formato de dados incorreto
    - Valores fora do range permitido

    Example:
        try:
            await service.send_message("123", "texto")  # número inválido
        except WhatsAppValidationError as e:
            print(f"Dados inválidos: {e.message}")
    """
    pass


class WhatsAppTimeoutError(WhatsAppException):
    """
    Timeout ao fazer requisição para a API do WhatsApp

    Levantado quando a requisição demora mais que o timeout configurado.
    Pode indicar problemas de rede ou sobrecarga na API.

    Example:
        try:
            await service.send_message(...)
        except WhatsAppTimeoutError:
            # Tentar novamente ou notificar usuário
            print("Timeout. Tentando novamente...")
    """
    pass


class WhatsAppRateLimitError(WhatsAppException):
    """
    Rate limit excedido da API do WhatsApp

    Levantado quando você excede o limite de requisições permitido.
    A API do WhatsApp tem limites de:
    - Mensagens por segundo
    - Mensagens por dia
    - Mensagens por destinatário

    Attributes:
        retry_after: Segundos para aguardar antes de tentar novamente (se disponível)

    Example:
        try:
            await service.send_message(...)
        except WhatsAppRateLimitError as e:
            if e.retry_after:
                await asyncio.sleep(e.retry_after)
                # Tentar novamente
    """

    def __init__(
        self,
        message: str,
        retry_after: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.retry_after = retry_after
        details = details or {}
        if retry_after:
            details["retry_after"] = retry_after
        super().__init__(message, details)


class WhatsAppMediaError(WhatsAppException):
    """
    Erro ao processar mídia (upload, download, conversão)

    Levantado quando há problemas com arquivos de mídia:
    - Arquivo muito grande
    - Formato não suportado
    - Falha no upload
    - Falha no download
    - Arquivo corrompido

    Example:
        try:
            await service.send_media("image.jpg", ...)
        except WhatsAppMediaError as e:
            print(f"Erro com mídia: {e.message}")
    """
    pass


class WhatsAppWebhookError(WhatsAppException):
    """
    Erro ao processar webhook recebido do WhatsApp

    Levantado quando há problemas ao processar dados do webhook:
    - Assinatura inválida
    - Payload malformado
    - Tipo de evento desconhecido
    - Dados faltando

    Example:
        try:
            handler.process_webhook(request_data)
        except WhatsAppWebhookError as e:
            print(f"Webhook inválido: {e.message}")
    """
    pass


class WhatsAppConfigError(WhatsAppException):
    """
    Erro de configuração do serviço WhatsApp

    Levantado quando há problemas na configuração:
    - Variáveis de ambiente faltando
    - Configuração inválida
    - Credenciais não fornecidas

    Example:
        try:
            service = WhatsAppService()  # sem config
        except WhatsAppConfigError:
            print("Configure as variáveis de ambiente necessárias")
    """
    pass
