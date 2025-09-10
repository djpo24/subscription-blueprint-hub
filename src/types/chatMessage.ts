
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
}

export interface ReactionData {
  emoji: string;
  message_id: string;
}

export interface StickerData {
  id: string;
  mime_type: string;
  animated?: boolean;
}

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
