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
      flight_data: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          airline: string
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
          created_at: string
          customer_id: string
          description: string
          destination: string
          dimensions: string | null
          estimated_arrival: string | null
          flight_number: string | null
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
          created_at?: string
          customer_id: string
          description: string
          destination: string
          dimensions?: string | null
          estimated_arrival?: string | null
          flight_number?: string | null
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
          created_at?: string
          customer_id?: string
          description?: string
          destination?: string
          dimensions?: string | null
          estimated_arrival?: string | null
          flight_number?: string | null
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
      process_arrival_notifications: {
        Args: Record<PropertyKey, never>
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
