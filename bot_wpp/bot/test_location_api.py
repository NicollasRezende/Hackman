"""
Teste da integração com BrasilAPI e CNES
Verifica se CEP lookup e busca de UPAs funcionam
"""
import asyncio
from location_service import LocationService
from loguru import logger

async def test_cep_lookup():
    """Testa busca de CEP real de Brasília"""
    service = LocationService()

    # CEPs reais de diferentes regiões de Brasília
    test_ceps = [
        "70040020",  # Asa Sul
        "72010000",  # Taguatinga
        "72215000",  # Ceilândia
    ]

    print("=" * 60)
    print("TESTE: Busca de CEP via BrasilAPI")
    print("=" * 60)

    for cep in test_ceps:
        print(f"\n🔍 Testando CEP: {cep}")

        endereco = await service.buscar_endereco_por_cep(cep)

        if endereco:
            print(f"✅ CEP encontrado!")
            print(f"   Rua: {endereco.get('street')}")
            print(f"   Bairro: {endereco.get('neighborhood')}")
            print(f"   Cidade: {endereco.get('city')}/{endereco.get('state')}")
        else:
            print(f"❌ CEP não encontrado")

        print()

async def test_upa_search():
    """Testa busca de UPAs via CNES"""
    service = LocationService()

    print("=" * 60)
    print("TESTE: Busca de UPAs via CNES API")
    print("=" * 60)

    upas = await service.buscar_upas_brasilia(limit=3)

    if upas:
        print(f"✅ Encontradas {len(upas)} UPAs\n")
        for i, upa in enumerate(upas, 1):
            print(f"{i}. {upa['nome']}")
            print(f"   Endereço: {upa['endereco']}")
            print(f"   Telefone: {upa['telefone']}")
            print(f"   CNES: {upa['cnes']}")
            print()
    else:
        print("❌ Nenhuma UPA encontrada")

async def test_upa_por_regiao():
    """Testa busca de UPAs por região (híbrido mock/API)"""
    service = LocationService()

    print("=" * 60)
    print("TESTE: Busca de UPAs por região (Híbrido)")
    print("=" * 60)

    test_regions = [
        "Asa Sul",
        "Taguatinga",
        "Ceilândia",
        "Gama"  # Não está no mock, deve buscar via API
    ]

    for regiao in test_regions:
        print(f"\n🔍 Região: {regiao}")

        upas = await service.buscar_upas_por_regiao(regiao)

        if upas:
            print(f"✅ Encontradas {len(upas)} UPAs")
            for upa in upas[:2]:  # Mostrar apenas 2
                print(f"   • {upa['nome']}")
                print(f"     {upa['endereco']}")
        else:
            print(f"❌ Nenhuma UPA encontrada")

async def test_invalid_cep():
    """Testa comportamento com CEP inválido"""
    service = LocationService()

    print("=" * 60)
    print("TESTE: CEP Inválido")
    print("=" * 60)

    invalid_ceps = [
        "00000000",
        "99999999",
        "12345678"
    ]

    for cep in invalid_ceps:
        print(f"\n🔍 Testando CEP inválido: {cep}")

        endereco = await service.buscar_endereco_por_cep(cep)

        if endereco:
            print(f"⚠️ Inesperado: CEP inválido retornou dados")
        else:
            print(f"✅ Corretamente rejeitado")

async def main():
    """Executa todos os testes"""
    print("\n" + "=" * 60)
    print("TESTE COMPLETO: Location Service APIs")
    print("=" * 60 + "\n")

    try:
        await test_cep_lookup()
        await test_upa_search()
        await test_upa_por_regiao()
        await test_invalid_cep()

        print("\n" + "=" * 60)
        print("✅ Todos os testes concluídos!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Erro durante testes: {e}")
        logger.exception("Erro nos testes")

if __name__ == "__main__":
    asyncio.run(main())
