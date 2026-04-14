"""
Formatador de respostas do backend para mensagens WhatsApp
"""
from typing import Dict, Any, List, Optional
from loguru import logger


class ResponseFormatter:
    """Converte ChatResponse do backend em mensagens WhatsApp formatadas"""

    @staticmethod
    def format_chat_response(data: Dict[str, Any]) -> str:
        """
        Formata resposta completa do backend para WhatsApp
        Otimizado para usar apenas campos que a IA realmente retorna

        Args:
            data: ChatResponse JSON do backend

        Returns:
            Mensagem formatada em Markdown para WhatsApp
        """
        parts = []

        # 1. Introdução (sempre presente)
        intro = data.get("intro", "")
        if intro:
            intro_clean = ResponseFormatter._strip_html(intro)
            # Limitar tamanho da introdução (WhatsApp tem limite)
            if len(intro_clean) > 500:
                intro_clean = intro_clean[:497] + "..."
            parts.append(intro_clean)
            parts.append("")

        # 2. Blocos informativos (quando presentes)
        blocks = data.get("blocks", [])
        if blocks:
            parts.append("*📋 Informações importantes:*")
            parts.append("")
            for block in blocks:
                block_icon = block.get("icon", "▪️")
                block_title = block.get("title", "")
                block_body = block.get("body", "")

                if block_title:
                    parts.append(f"{block_icon} *{block_title}*")
                if block_body:
                    body_clean = ResponseFormatter._strip_html(block_body)
                    parts.append(body_clean)
                    parts.append("")

        # 3. Passo a passo (quando presente)
        steps = data.get("steps", [])
        if steps and len(steps) > 0:
            # Ignorar se for só "Se quiser, me diga sua cidade..."
            useful_steps = [s for s in steps if len(s) > 50]
            if useful_steps:
                parts.append("*📝 Como proceder:*")
                parts.append("")
                for i, step in enumerate(useful_steps, 1):
                    step_clean = ResponseFormatter._strip_html(step)
                    parts.append(f"{i}. {step_clean}")
                parts.append("")

        # 4. Dica (quando presente)
        tip = data.get("tip")
        if tip and len(tip) > 10:
            tip_clean = ResponseFormatter._strip_html(tip)
            parts.append(f"💡 {tip_clean}")
            parts.append("")

        # 5. Contato (sempre útil)
        contact = data.get("contact")
        if contact and contact.get("phone"):
            parts.append("*📞 Contato:*")
            if contact.get("title"):
                parts.append(f"• {contact['title']}")
            parts.append(f"• Tel: *{contact['phone']}*")
            if contact.get("hours"):
                parts.append(f"• Horário: {contact['hours']}")
            parts.append("")

        # 6. Link oficial (quando presente)
        official = data.get("official")
        if official and official.get("url"):
            url = official.get("url")
            parts.append(f"🔗 {url}")
            parts.append("")

        # Rodapé
        parts.append("_Digite /menu para voltar ou faça outra pergunta_")

        return "\n".join(parts)

    @staticmethod
    def format_buttons(data: Dict[str, Any]) -> Optional[List[Dict[str, str]]]:
        """
        Extrai sugestões de botões da resposta

        Returns:
            Lista de botões no formato WhatsApp (max 3)
        """
        related = data.get("related", [])
        if not related:
            return None

        buttons = []
        for i, question in enumerate(related[:3], 1):
            # Truncar título para 20 caracteres (limite WhatsApp)
            title = question[:20] if len(question) > 20 else question
            buttons.append({
                "id": f"related_{i}",
                "title": title
            })

        return buttons if buttons else None

    @staticmethod
    def _strip_html(text: str) -> str:
        """
        Remove tags HTML simples e converte para Markdown WhatsApp

        Args:
            text: Texto com HTML

        Returns:
            Texto limpo com formatação WhatsApp
        """
        if not text:
            return ""

        # Conversões básicas
        conversions = {
            "<strong>": "*",
            "</strong>": "*",
            "<b>": "*",
            "</b>": "*",
            "<em>": "_",
            "</em>": "_",
            "<i>": "_",
            "</i>": "_",
            "<code>": "`",
            "</code>": "`",
            "<br>": "\n",
            "<br/>": "\n",
            "<br />": "\n",
        }

        result = text
        for html_tag, md_tag in conversions.items():
            result = result.replace(html_tag, md_tag)

        # Remover links HTML (manter apenas URL)
        import re
        result = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>([^<]*)</a>', r'\2: \1', result)

        # Remover qualquer outra tag restante
        result = re.sub(r'<[^>]+>', '', result)

        return result

    @staticmethod
    def format_fallback() -> str:
        """Mensagem de fallback quando backend não está disponível"""
        return """ℹ️ *Atendimento Geral*

Desculpe, estou com dificuldades técnicas no momento.

*📋 Como proceder:*

1. Tente novamente em alguns instantes
2. Reformule sua pergunta de forma mais específica
3. Ligue para a Central do Cidadão: *156*

*📞 Atendimento:*
• Central do Cidadão GDF
• Telefone: 156
• Horário: 24 horas

🔗 *Link oficial:* https://www.df.gov.br

_Digite /menu para tentar novamente_"""
