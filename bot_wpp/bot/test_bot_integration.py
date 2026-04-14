"""
Script de teste para validar integração bot + backend
"""
import asyncio
import json
from backend_client import BackendClient
from response_formatter import ResponseFormatter


async def test_backend_integration():
    """Testa integração completa"""

    print("🧪 TESTE DE INTEGRAÇÃO BOT + BACKEND\n")
    print("=" * 60)

    backend = BackendClient()
    formatter = ResponseFormatter()

    # Teste 1: Health check
    print("\n1️⃣ Verificando se backend está online...")
    is_online = await backend.health_check()
    if is_online:
        print("✅ Backend online!")
    else:
        print("❌ Backend offline - verifique se Spring Boot está rodando")
        return

    # Teste 2: Pergunta sobre emprego
    print("\n2️⃣ Testando pergunta: 'perdi meu emprego, o que faço?'")
    response = await backend.chat("perdi meu emprego, o que faço?", "test_session_1")

    if response:
        print("\n📦 Resposta do backend:")
        print(json.dumps(response, indent=2, ensure_ascii=False))

        print("\n📱 Formatado para WhatsApp:")
        formatted = formatter.format_chat_response(response)
        print("-" * 60)
        print(formatted)
        print("-" * 60)

        buttons = formatter.format_buttons(response)
        if buttons:
            print("\n🔘 Botões sugeridos:")
            for btn in buttons:
                print(f"  - [{btn['id']}] {btn['title']}")
    else:
        print("❌ Backend não retornou resposta")

    # Teste 3: Pergunta sobre saúde
    print("\n\n3️⃣ Testando pergunta: 'preciso marcar consulta no sus'")
    response = await backend.chat("preciso marcar consulta no sus", "test_session_2")

    if response:
        print("\n📱 Formatado para WhatsApp:")
        formatted = formatter.format_chat_response(response)
        print("-" * 60)
        print(formatted)
        print("-" * 60)

    # Teste 4: Pergunta com CEP
    print("\n\n4️⃣ Testando pergunta com CEP: 'onde fica hospital no cep 70040-020'")
    response = await backend.chat("onde fica hospital no cep 70040-020", "test_session_3")

    if response:
        print("\n📱 Formatado para WhatsApp:")
        formatted = formatter.format_chat_response(response)
        print("-" * 60)
        print(formatted)
        print("-" * 60)

    print("\n\n✅ TESTE CONCLUÍDO!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_backend_integration())
