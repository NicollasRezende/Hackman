"""
Teste local do bot V2 (mockado)
"""
from knowledge_base import KnowledgeBase

def test_queries():
    kb = KnowledgeBase()

    test_cases = [
        "perdi meu emprego",
        "preciso marcar consulta no SUS",
        "como tirar RG",
        "bolsa familia",
        "aposentadoria",
        "violencia domestica",
        "CNH",
        "alguma coisa aleatoria"
    ]

    for query in test_cases:
        print(f"\n{'='*60}")
        print(f"QUERY: {query}")
        print(f"{'='*60}")

        response = kb.get_response(query)

        if response:
            print(f"\nTÍTULO: {response.get('title')}")
            print(f"CATEGORIA: {response.get('category')}")
            print(f"\nCONTEÚDO:\n{response.get('content')[:200]}...")

            if response.get('contact'):
                contact = response['contact']
                print(f"\nCONTATO: {contact.get('org')} - {contact.get('phone')}")

            if response.get('links'):
                print(f"\nLINKS: {len(response['links'])} links oficiais")
        else:
            print("NENHUMA RESPOSTA ENCONTRADA")

if __name__ == "__main__":
    test_queries()
