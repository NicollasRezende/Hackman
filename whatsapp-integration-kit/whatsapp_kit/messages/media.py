"""
Media Messages - Mensagens com mídias (imagem, documento, áudio, vídeo)
"""

from typing import Dict, Any, Optional


def create_image_message(
    to: str,
    image_url: str,
    caption: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cria payload para enviar imagem

    Args:
        to: Número do destinatário
        image_url: URL pública da imagem (JPEG, PNG)
        caption: Legenda opcional

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> payload = create_image_message(
        ...     "5511999999999",
        ...     "https://example.com/image.jpg",
        ...     caption="Confira nossa promoção!"
        ... )
    """
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "image",
        "image": {"link": image_url}
    }

    if caption:
        payload["image"]["caption"] = caption

    return payload


def create_document_message(
    to: str,
    document_url: str,
    filename: str,
    caption: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cria payload para enviar documento (PDF, DOCX, etc)

    Args:
        to: Número do destinatário
        document_url: URL pública do documento
        filename: Nome do arquivo
        caption: Legenda opcional

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> payload = create_document_message(
        ...     "5511999999999",
        ...     "https://example.com/contract.pdf",
        ...     "Contrato_Servico.pdf",
        ...     caption="Segue contrato para assinatura"
        ... )
    """
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "document",
        "document": {
            "link": document_url,
            "filename": filename
        }
    }

    if caption:
        payload["document"]["caption"] = caption

    return payload


def create_audio_message(
    to: str,
    audio_url: str
) -> Dict[str, Any]:
    """
    Cria payload para enviar áudio

    Args:
        to: Número do destinatário
        audio_url: URL pública do áudio (AAC, MP3, OGG)

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> payload = create_audio_message(
        ...     "5511999999999",
        ...     "https://example.com/audio.mp3"
        ... )
    """
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "audio",
        "audio": {"link": audio_url}
    }


def create_video_message(
    to: str,
    video_url: str,
    caption: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cria payload para enviar vídeo

    Args:
        to: Número do destinatário
        video_url: URL pública do vídeo (MP4, 3GPP)
        caption: Legenda opcional

    Returns:
        dict: Payload pronto para enviar via WhatsApp API

    Example:
        >>> payload = create_video_message(
        ...     "5511999999999",
        ...     "https://example.com/video.mp4",
        ...     caption="Tutorial de uso"
        ... )
    """
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "video",
        "video": {"link": video_url}
    }

    if caption:
        payload["video"]["caption"] = caption

    return payload
