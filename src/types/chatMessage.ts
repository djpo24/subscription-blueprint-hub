
export interface ChatMessage {
  id: string;
  message_content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: string;
  whatsapp_message_id?: string;
  from_phone?: string;
  is_from_customer?: boolean;
  media_url?: string;
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
  customers?: {
    name: string;
    profile_image_url?: string;
  } | null;
}
