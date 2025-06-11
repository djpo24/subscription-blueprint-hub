
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
  description?: string;
  origin?: string;
  destination?: string;
  weight?: number | null;
  freight?: number | null;
  amount_to_collect?: number | null;
  currency?: 'COP' | 'AWG';
  flight_number?: string;
  delivered_at?: string;
  delivered_by?: string;
  created_at?: string;
  updated_at?: string;
  customers?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface IncomingMessage {
  id: string;
  customer_id?: string;
  from_phone: string;
  message_content?: string;
  message_type?: string;
  timestamp?: string;
  whatsapp_message_id?: string;
  media_url?: string;
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
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role?: 'admin' | 'employee' | 'traveler';
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
  trip_date?: string;
  origin?: string;
  destination?: string;
  flight_number?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrackingEvent {
  id: string;
  package_id: string;
  event_type: string;
  description: string;
  location?: string;
  created_at?: string;
}

export interface DispatchRelation {
  id: string;
  dispatch_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  total_packages?: number;
  total_weight?: number;
  total_freight?: number;
  total_amount_to_collect?: number;
  pending_count?: number;
  delivered_count?: number;
}

export interface DispatchPackage {
  id: string;
  dispatch_id: string;
  package_id: string;
  created_at?: string;
}

export interface UserAction {
  id: string;
  user_id?: string;
  action_type: string;
  description: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  can_revert?: boolean;
  created_at?: string;
  reverted_at?: string;
  reverted_by?: string;
}

export interface DestinationAddress {
  id: string;
  city: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayment {
  id: string;
  package_id?: string;
  amount: number;
  payment_method: string;
  currency: string;
  payment_date: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  packages?: {
    tracking_number: string;
    destination: string;
    delivered_at?: string;
    customer_id?: string;
    customers?: {
      name: string;
      phone: string;
    };
  };
}

// Types for hooks that query non-existent tables or columns
export interface PendingNotification {
  id: string;
  customer_id: string;
  package_id: string;
  message: string;
  status: string;
  created_at: string;
  sent_at?: string;
  customers: {
    name: string;
    phone: string;
    whatsapp_number?: string;
  };
  packages: {
    tracking_number: string;
    destination: string;
    amount_to_collect: number;
    currency: string;
  };
}

// Currency type for consistent usage across the app
export type Currency = 'COP' | 'AWG';
