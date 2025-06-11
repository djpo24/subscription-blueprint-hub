
// Temporary type definitions to resolve TypeScript errors
// These should be replaced once Supabase types are properly regenerated

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_number?: string;
  address?: string;
  id_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Package {
  id: string;
  tracking_number?: string;
  customer_id?: string;
  trip_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IncomingMessage {
  id: string;
  customer_id?: string;
  from_phone: string;
  message_content?: string;
  message_type?: string;
  timestamp?: string;
  whatsapp_message_id?: string;
  customers?: {
    name: string;
  };
}

export interface MessageDeliveryStatus {
  id: string;
  notification_id?: string;
  whatsapp_message_id?: string;
  status: string;
  timestamp?: string;
  recipient_phone: string;
  notification_log?: {
    message: string;
    customers?: {
      name: string;
      phone: string;
    };
  };
}

export interface NotificationLog {
  id: string;
  customer_id?: string;
  package_id?: string;
  message: string;
  status?: string;
  created_at?: string;
  sent_at?: string;
  customers?: {
    name: string;
    phone: string;
    whatsapp_number?: string;
  };
  packages?: {
    tracking_number: string;
    destination: string;
    amount_to_collect: number;
    currency: string;
  };
}

export interface UserProfile {
  id: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Traveler {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
  user_profiles?: {
    email: string;
  };
}

export interface Trip {
  id: string;
  traveler_id?: string;
  departure_date?: string;
  arrival_date?: string;
  origin?: string;
  destination?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
