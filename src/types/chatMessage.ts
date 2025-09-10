
// ELIMINADO COMPLETAMENTE - NO HAY PROCESAMIENTO AUTOMÁTICO DE MENSAJES

export interface ChatMessage {
  id: string;
  message_content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template' | 'reaction' | 'sticker';
  timestamp: string;
  whatsapp_message_id?: string;
  from_phone?: string;
  is_from_customer?: boolean;
  media_url?: string;
  raw_data?: any;
  reply_to_message_id?: string;
  reply_to_message?: ChatMessage;
}

// ELIMINADO: ReactionData, StickerData, ProcessedMessage
// No hay procesamiento automático de reacciones, stickers o mensajes

export interface IncomingMessage {
  id: string;
  whatsapp_message_id: string;
  from_phone: string;
  customer_id: string | null;
  message_type: string;
  message_content: string | null;
  media_url: string | null;
  message_timestamp: string;
  is_from_customer?: boolean;
  raw_data?: any;
  customers?: {
    name: string;
    profile_image_url?: string;
  } | null;
}
