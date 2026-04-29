// Tipos compartidos para el chat unificado.

export interface ConversationCustomer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp_number?: string | null;
  profile_image_url?: string | null;
}

export interface Conversation {
  id: string;
  phone_number: string;
  customer_id: string | null;
  status: string;
  last_message_at: string | null;
  customers: ConversationCustomer | null;
  last_read_at: string | null;
  last_read_by: string | null;
  unread_count: number;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  awaiting_reply: boolean;
  minutes_since_last_inbound: number | null;
  last_message_preview: string | null;
}

export interface Message {
  id: string;
  conversation_id: string | null;
  direction: "inbound" | "outbound";
  content: string | null;
  message_type: string | null;
  status: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  waba_message_id: string | null;
  error_code: number | null;
  error_title: string | null;
  error_message: string | null;
  error_message_es: string | null;
  failed_at: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  media_size_bytes: number | null;
  media_caption: string | null;
  media_duration_sec: number | null;
}

export type StatusFilter = "all" | "unread" | "awaiting" | "open" | "closed";
