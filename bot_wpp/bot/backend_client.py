"""
Cliente para integração com Backend Spring Boot
"""
import os
import httpx
from typing import Dict, Any, Optional
from loguru import logger
from dotenv import load_dotenv

load_dotenv()


class BackendClient:
    """Cliente HTTP para comunicação com o backend Spring Boot"""

    def __init__(self):
        self.base_url = os.getenv("BACKEND_API_URL", "http://localhost:8080/api/v1")
        self.timeout = 30.0
        logger.info(f"🔗 Backend API: {self.base_url}")

    async def chat(self, message: str, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Envia mensagem para o backend e retorna resposta estruturada

        Args:
            message: Mensagem do usuário
            session_id: ID da sessão (telefone do usuário)

        Returns:
            ChatResponse do backend ou None em caso de erro
        """
        url = f"{self.base_url}/chat"

        payload = {
            "message": message,
            "sessionId": session_id
        }

        try:
            logger.info(f"📤 Chamando backend: {message[:50]}...")

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)

                if response.status_code == 200:
                    data = response.json()
                    logger.success(f"✅ Backend respondeu: categoria={data.get('tag', {}).get('txt', 'N/A')}")
                    return data
                else:
                    logger.error(f"❌ Backend erro {response.status_code}: {response.text}")
                    return None

        except httpx.TimeoutException:
            logger.error("⏱️ Timeout ao chamar backend")
            return None
        except httpx.ConnectError:
            logger.error("🔌 Backend não está rodando ou não acessível")
            return None
        except Exception as e:
            logger.error(f"❌ Erro ao chamar backend: {e}")
            return None

    async def health_check(self) -> bool:
        """Verifica se o backend está online"""
        url = f"{self.base_url}/health"

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                return response.status_code == 200
        except:
            return False
