export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          id_number: string | null
          name: string
          phone: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          id_number?: string | null
          name: string
          phone: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          id_number?: string | null
          name?: string
          phone?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      dispatch_batches: {
        Row: {
          batch_id: string
          created_at: string
          dispatch_id: string
          id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          dispatch_id: string
          id?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          dispatch_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_batches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: true
            referencedRelation: "shipment_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_batches_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_relations"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_packages: {
        Row: {
          created_at: string
          dispatch_id: string
          id: string
          package_id: string
        }
        Insert: {
          created_at?: string
          dispatch_id: string
          id?: string
          package_id: string
        }
        Update: {
          created_at?: string
          dispatch_id?: string
          id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_packages_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_relations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_relations: {
        Row: {
          created_at: string
          created_by: string | null
          dispatch_date: string
          id: string
          notes: string | null
          status: string
          total_amount_to_collect: number | null
          total_freight: number | null
          total_packages: number
          total_weight: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dispatch_date: string
          id?: string
          notes?: string | null
          status?: string
          total_amount_to_collect?: number | null
          total_freight?: number | null
          total_packages?: number
          total_weight?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dispatch_date?: string
          id?: string
          notes?: string | null
          status?: string
          total_amount_to_collect?: number | null
          total_freight?: number | null
          total_packages?: number
          total_weight?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      flight_api_cache: {
        Row: {
          api_response: Json
          created_at: string
          flight_number: string
          id: string
          query_date: string
        }
        Insert: {
          api_response: Json
          created_at?: string
          flight_number: string
          id?: string
          query_date: string
        }
        Update: {
          api_response?: Json
          created_at?: string
          flight_number?: string
          id?: string
          query_date?: string
        }
        Relationships: []
      }
      flight_api_usage: {
        Row: {
          created_at: string
          flight_number: string
          id: string
          query_date: string
          query_time: string
        }
        Insert: {
          created_at?: string
          flight_number: string
          id?: string
          query_date: string
          query_time?: string
        }
        Update: {
          created_at?: string
          flight_number?: string
          id?: string
          query_date?: string
          query_time?: string
        }
        Relationships: []
      }
      flight_data: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          airline: string
          api_aircraft: string | null
          api_aircraft_iata: string | null
          api_aircraft_registration: string | null
          api_airline_iata: string | null
          api_airline_icao: string | null
          api_airline_name: string | null
          api_arrival_airport: string | null
          api_arrival_city: string | null
          api_arrival_gate: string | null
          api_arrival_iata: string | null
          api_arrival_icao: string | null
          api_arrival_terminal: string | null
          api_arrival_timezone: string | null
          api_departure_airport: string | null
          api_departure_city: string | null
          api_departure_gate: string | null
          api_departure_iata: string | null
          api_departure_icao: string | null
          api_departure_terminal: string | null
          api_departure_timezone: string | null
          api_flight_status: string | null
          api_raw_data: Json | null
          arrival_airport: string
          created_at: string
          departure_airport: string
          flight_number: string
          has_landed: boolean | null
          id: string
          last_updated: string
          notification_sent: boolean | null
          scheduled_arrival: string | null
          scheduled_departure: string | null
          status: string
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          airline?: string
          api_aircraft?: string | null
          api_aircraft_iata?: string | null
          api_aircraft_registration?: string | null
          api_airline_iata?: string | null
          api_airline_icao?: string | null
          api_airline_name?: string | null
          api_arrival_airport?: string | null
          api_arrival_city?: string | null
          api_arrival_gate?: string | null
          api_arrival_iata?: string | null
          api_arrival_icao?: string | null
          api_arrival_terminal?: string | null
          api_arrival_timezone?: string | null
          api_departure_airport?: string | null
          api_departure_city?: string | null
          api_departure_gate?: string | null
          api_departure_iata?: string | null
          api_departure_icao?: string | null
          api_departure_terminal?: string | null
          api_departure_timezone?: string | null
          api_flight_status?: string | null
          api_raw_data?: Json | null
          arrival_airport: string
          created_at?: string
          departure_airport: string
          flight_number: string
          has_landed?: boolean | null
          id?: string
          last_updated?: string
          notification_sent?: boolean | null
          scheduled_arrival?: string | null
          scheduled_departure?: string | null
          status?: string
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          airline?: string
          api_aircraft?: string | null
          api_aircraft_iata?: string | null
          api_aircraft_registration?: string | null
          api_airline_iata?: string | null
          api_airline_icao?: string | null
          api_airline_name?: string | null
          api_arrival_airport?: string | null
          api_arrival_city?: string | null
          api_arrival_gate?: string | null
          api_arrival_iata?: string | null
          api_arrival_icao?: string | null
          api_arrival_terminal?: string | null
          api_arrival_timezone?: string | null
          api_departure_airport?: string | null
          api_departure_city?: string | null
          api_departure_gate?: string | null
          api_departure_iata?: string | null
          api_departure_icao?: string | null
          api_departure_terminal?: string | null
          api_departure_timezone?: string | null
          api_flight_status?: string | null
          api_raw_data?: Json | null
          arrival_airport?: string
          created_at?: string
          departure_airport?: string
          flight_number?: string
          has_landed?: boolean | null
          id?: string
          last_updated?: string
          notification_sent?: boolean | null
          scheduled_arrival?: string | null
          scheduled_departure?: string | null
          status?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          created_at: string
          customer_id: string | null
          error_message: string | null
          id: string
          message: string
          notification_type: string
          package_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message: string
          notification_type?: string
          package_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string
          package_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          enable_arrival_notifications: boolean | null
          id: string
          trip_id: string | null
          updated_at: string
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          enable_arrival_notifications?: boolean | null
          id?: string
          trip_id?: string | null
          updated_at?: string
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          enable_arrival_notifications?: boolean | null
          id?: string
          trip_id?: string | null
          updated_at?: string
          whatsapp_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          message: string
          package_id: string
          sent_at: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          message: string
          package_id: string
          sent_at?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          message?: string
          package_id?: string
          sent_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          actual_arrival: string | null
          amount_to_collect: number | null
          batch_id: string | null
          created_at: string
          customer_id: string
          description: string
          destination: string
          dimensions: string | null
          estimated_arrival: string | null
          flight_number: string | null
          freight: number | null
          id: string
          origin: string
          status: string
          tracking_number: string
          trip_id: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          actual_arrival?: string | null
          amount_to_collect?: number | null
          batch_id?: string | null
          created_at?: string
          customer_id: string
          description: string
          destination: string
          dimensions?: string | null
          estimated_arrival?: string | null
          flight_number?: string | null
          freight?: number | null
          id?: string
          origin: string
          status?: string
          tracking_number: string
          trip_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          actual_arrival?: string | null
          amount_to_collect?: number | null
          batch_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string
          destination?: string
          dimensions?: string | null
          estimated_arrival?: string | null
          flight_number?: string | null
          freight?: number | null
          id?: string
          origin?: string
          status?: string
          tracking_number?: string
          trip_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "shipment_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_batches: {
        Row: {
          batch_label: string
          batch_number: string
          created_at: string
          destination: string
          id: string
          status: string
          total_amount_to_collect: number | null
          total_freight: number | null
          total_packages: number
          total_weight: number | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          batch_label: string
          batch_number: string
          created_at?: string
          destination: string
          id?: string
          status?: string
          total_amount_to_collect?: number | null
          total_freight?: number | null
          total_packages?: number
          total_weight?: number | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          batch_label?: string
          batch_number?: string
          created_at?: string
          destination?: string
          id?: string
          status?: string
          total_amount_to_collect?: number | null
          total_freight?: number | null
          total_packages?: number
          total_weight?: number | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_batches_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          location: string | null
          package_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          location?: string | null
          package_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          location?: string | null
          package_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          destination: string
          flight_number: string | null
          id: string
          origin: string
          status: string
          trip_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          flight_number?: string | null
          id?: string
          origin: string
          status?: string
          trip_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          flight_number?: string | null
          id?: string
          origin?: string
          status?: string
          trip_date?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_batch_label: {
        Args: { p_trip_id: string; p_batch_number: string }
        Returns: string
      }
      migrate_existing_dispatches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_arrival_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_batch_totals: {
        Args: { batch_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
