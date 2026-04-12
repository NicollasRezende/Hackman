"""
Cliente HTTP base com retry, timeout e logging

Este módulo fornece um cliente HTTP abstrato com funcionalidades prontas
para integração robusta com APIs externas.
"""

import asyncio
import httpx
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from loguru import logger

from .exceptions import WhatsAppTimeoutError, WhatsAppAPIError
from .interfaces import IHTTPClient


class BaseHTTPClient(IHTTPClient):
    """
    Cliente HTTP base com features prontas para produção
    
    Features:
    - Retry automático com backoff exponencial
    - Timeout configurável
    - Logging detalhado de requests/responses
    - Tratamento de erros HTTP padronizado
    - Contexto de sessão gerenciado
    
    Attributes:
        timeout: Timeout em segundos para requests (default: 30)
        max_retries: Número máximo de tentativas (default: 3)
        backoff_factor: Fator de multiplicação para backoff (default: 2)
    
    Example:
        class MyAPIClient(BaseHTTPClient):
            def __init__(self):
                super().__init__(timeout=60, max_retries=5)
            
            async def get_data(self):
                return await self._get("https://api.example.com/data")
    """
    
    def __init__(
        self,
        timeout: float = 30.0,
        max_retries: int = 3,
        backoff_factor: float = 2.0
    ):
        """
        Inicializa o cliente HTTP
        
        Args:
            timeout: Timeout em segundos (default: 30)
            max_retries: Número máximo de tentativas (default: 3)
            backoff_factor: Multiplicador para backoff exponencial (default: 2)
        """
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self._client: Optional[httpx.AsyncClient] = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Obtém ou cria cliente HTTP reutilizável"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client
    
    async def close(self):
        """Fecha o cliente HTTP e libera recursos"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None
    
    async def _request_with_retry(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> httpx.Response:
        """
        Faz requisição HTTP com retry automático
        
        Args:
            method: Método HTTP (GET, POST, etc)
            url: URL completa
            **kwargs: Argumentos passados para httpx (headers, json, etc)
        
        Returns:
            Response do httpx
        
        Raises:
            WhatsAppTimeoutError: Se timeout ocorrer após todas as tentativas
            WhatsAppAPIError: Se a API retornar erro após todas as tentativas
        """
        client = await self._get_client()
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                logger.debug(
                    f"[Attempt {attempt + 1}/{self.max_retries}] "
                    f"{method} {url}"
                )
                
                response = await client.request(method, url, **kwargs)
                
                # Log da resposta
                logger.debug(
                    f"Response: {response.status_code} | "
                    f"Body: {response.text[:500]}"
                )
                
                # Se sucesso, retornar
                if response.status_code < 400:
                    return response
                
                # Se erro 4xx (client error), não fazer retry
                if 400 <= response.status_code < 500:
                    logger.warning(
                        f"Client error {response.status_code}, "
                        f"não fazendo retry"
                    )
                    return response
                
                # Se erro 5xx (server error), fazer retry
                last_exception = Exception(
                    f"Server error: {response.status_code}"
                )
                
            except httpx.TimeoutException as e:
                logger.warning(f"Timeout on attempt {attempt + 1}: {e}")
                last_exception = e
                
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
                last_exception = e
            
            # Aguardar antes do próximo retry (backoff exponencial)
            if attempt < self.max_retries - 1:
                wait_time = self.backoff_factor ** attempt
                logger.info(f"Waiting {wait_time}s before retry...")
                await asyncio.sleep(wait_time)
        
        # Se chegou aqui, todas as tentativas falharam
        if isinstance(last_exception, httpx.TimeoutException):
            raise WhatsAppTimeoutError(
                f"Request timeout after {self.max_retries} attempts"
            )
        
        raise WhatsAppAPIError(
            message=f"Request failed after {self.max_retries} attempts",
            status_code=500,
            details={"last_error": str(last_exception)}
        )
    
    async def get(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Faz requisição GET com retry

        Args:
            url: URL completa
            headers: Headers HTTP
            params: Query parameters

        Returns:
            Response JSON parseado
        """
        logger.info(f"GET {url}")
        response = await self._request_with_retry(
            "GET",
            url,
            headers=headers,
            params=params
        )
        return response.json()

    async def post(
        self,
        url: str,
        json: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Faz requisição POST com retry

        Args:
            url: URL completa
            json: Body JSON
            headers: Headers HTTP

        Returns:
            Response JSON parseado
        """
        logger.info(f"POST {url}")
        logger.debug(f"Request body: {json}")

        response = await self._request_with_retry(
            "POST",
            url,
            json=json,
            headers=headers
        )
        return response.json()

    # Métodos internos (mantidos para compatibilidade)
    async def _get(self, *args, **kwargs):
        """Alias interno para get()"""
        return await self.get(*args, **kwargs)

    async def _post(self, *args, **kwargs):
        """Alias interno para post()"""
        return await self.post(*args, **kwargs)
    
    async def __aenter__(self):
        """Context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - fecha o cliente"""
        await self.close()
