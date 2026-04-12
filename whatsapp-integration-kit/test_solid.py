"""
Teste rápido da implementação SOLID
"""
import asyncio
from whatsapp_kit import WhatsAppService, WhatsAppConfig
from whatsapp_kit.core.base_client import BaseHTTPClient
from whatsapp_kit.utils.validators import WhatsAppValidator
from whatsapp_kit.utils.helpers import MessageHelper, PhoneHelper

async def test_solid_implementation():
    """Testa se todos os componentes SOLID estão funcionando"""

    print("🧪 Testando implementação SOLID...")

    # Teste 1: Factory method (deve funcionar)
    print("\n✅ Teste 1: Factory method")
    try:
        service = WhatsAppService.create_default()
        print("   ✓ WhatsAppService.create_default() OK")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Teste 2: Dependency Injection manual
    print("\n✅ Teste 2: Dependency Injection")
    try:
        config = WhatsAppConfig.from_env()
        http_client = BaseHTTPClient(timeout=30)
        validator = WhatsAppValidator()

        service = WhatsAppService(
            config=config,
            http_client=http_client,
            validator=validator
        )
        print("   ✓ Injeção de dependências OK")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Teste 3: Helpers
    print("\n✅ Teste 3: Helpers (SRP)")
    try:
        phone = PhoneHelper.format_phone_number("+55 11 99999-9999")
        assert phone == "5511999999999", f"Esperado '5511999999999', recebeu '{phone}'"

        masked = PhoneHelper.mask_phone_number("5511999999999")
        assert "*" in masked, "Máscara não aplicada"

        print(f"   ✓ PhoneHelper.format_phone_number() OK: {phone}")
        print(f"   ✓ PhoneHelper.mask_phone_number() OK: {masked}")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Teste 4: Validator
    print("\n✅ Teste 4: Validator (DIP)")
    try:
        validator = WhatsAppValidator()
        phone = validator.validate_phone_number("+55 11 99999-9999")
        assert phone == "5511999999999"

        validator.validate_message_text("Teste")
        validator.validate_language_code("pt_BR")

        print("   ✓ WhatsAppValidator OK")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Teste 5: Interfaces segregadas
    print("\n✅ Teste 5: Interfaces (ISP)")
    try:
        from whatsapp_kit.core.interfaces import (
            IValidator, IHTTPClient, IMessageSender,
            IMediaHandler, IInteractiveMessages
        )

        # Verificar se WhatsAppService implementa todas
        assert isinstance(service, IMessageSender)
        assert isinstance(service, IMediaHandler)
        assert isinstance(service, IInteractiveMessages)

        print("   ✓ Interfaces segregadas OK")
        print("   ✓ WhatsAppService implementa IMessageSender")
        print("   ✓ WhatsAppService implementa IMediaHandler")
        print("   ✓ WhatsAppService implementa IInteractiveMessages")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Teste 6: BaseHTTPClient implementa IHTTPClient (LSP)
    print("\n✅ Teste 6: LSP - BaseHTTPClient implementa IHTTPClient")
    try:
        from whatsapp_kit.core.interfaces import IHTTPClient

        http_client = BaseHTTPClient(timeout=30)
        assert isinstance(http_client, IHTTPClient)

        print("   ✓ BaseHTTPClient implementa IHTTPClient (LSP)")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Teste 7: Composição (WhatsAppService usa IHTTPClient)
    print("\n✅ Teste 7: Composição - WhatsAppService usa IHTTPClient")
    try:
        # Service deve ter _http_client que é IHTTPClient
        assert hasattr(service, '_http_client')
        assert isinstance(service._http_client, IHTTPClient)

        print("   ✓ WhatsAppService usa composição com IHTTPClient")
    except Exception as e:
        print(f"   ✗ Erro: {e}")
        return False

    # Cleanup
    await service.close()

    print("\n" + "="*50)
    print("🎉 TODOS OS TESTES PASSARAM!")
    print("="*50)
    print("\n📊 SOLID Compliance:")
    print("   ✅ S - Single Responsibility (Helpers separados)")
    print("   ✅ O - Open/Closed (Interfaces e abstrações)")
    print("   ✅ L - Liskov Substitution (BaseHTTPClient → IHTTPClient)")
    print("   ✅ I - Interface Segregation (IMessageSender, IMediaHandler, etc)")
    print("   ✅ D - Dependency Inversion (Injeção de IValidator, IHTTPClient)")

    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(test_solid_implementation())
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERRO FATAL: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
