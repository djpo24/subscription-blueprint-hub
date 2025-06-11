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
      app_secrets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      customer_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string
          id: string
          notes: string | null
          package_id: string | null
          payment_date: string
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_date?: string
          payment_method?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_date?: string
          payment_method?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          id_number: string | null
          name: string
          phone: string
          profile_image_url: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          id?: string
          id_number?: string | null
          name: string
          phone: string
          profile_image_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          id?: string
          id_number?: string | null
          name?: string
          phone?: string
          profile_image_url?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      destination_addresses: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dispatch_packages: {
        Row: {
          created_at: string | null
          dispatch_id: string | null
          id: string
          package_id: string | null
        }
        Insert: {
          created_at?: string | null
          dispatch_id?: string | null
          id?: string
          package_id?: string | null
        }
        Update: {
          created_at?: string | null
          dispatch_id?: string | null
          id?: string
          package_id?: string | null
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
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          dispatch_date: string
          id: string
          notes: string | null
          pending_count: number | null
          status: string | null
          total_amount_to_collect: number | null
          total_freight: number | null
          total_packages: number | null
          total_weight: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          dispatch_date: string
          id?: string
          notes?: string | null
          pending_count?: number | null
          status?: string | null
          total_amount_to_collect?: number | null
          total_freight?: number | null
          total_packages?: number | null
          total_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          dispatch_date?: string
          id?: string
          notes?: string | null
          pending_count?: number | null
          status?: string | null
          total_amount_to_collect?: number | null
          total_freight?: number | null
          total_packages?: number | null
          total_weight?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      incoming_messages: {
        Row: {
          customer_id: string | null
          from_phone: string
          id: string
          media_url: string | null
          message_content: string | null
          message_type: string | null
          raw_data: Json | null
          timestamp: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          customer_id?: string | null
          from_phone: string
          id?: string
          media_url?: string | null
          message_content?: string | null
          message_type?: string | null
          raw_data?: Json | null
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          customer_id?: string | null
          from_phone?: string
          id?: string
          media_url?: string | null
          message_content?: string | null
          message_type?: string | null
          raw_data?: Json | null
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incoming_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      message_delivery_status: {
        Row: {
          id: string
          notification_id: string | null
          recipient_phone: string
          status: string
          timestamp: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          id?: string
          notification_id?: string | null
          recipient_phone: string
          status: string
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          id?: string
          notification_id?: string | null
          recipient_phone?: string
          status?: string
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_delivery_status_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_log"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          created_at: string | null
          customer_id: string | null
          error_message: string | null
          id: string
          message: string
          notification_type: string | null
          package_id: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message: string
          notification_type?: string | null
          package_id?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          error_message?: string | null
          id?: string
          message?: string
          notification_type?: string | null
          package_id?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_log_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notification_log_package"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
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
          created_at: string | null
          enable_arrival_notifications: boolean | null
          id: string
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          enable_arrival_notifications?: boolean | null
          id?: string
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          enable_arrival_notifications?: boolean | null
          id?: string
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          amount_to_collect: number | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          delivered_at: string | null
          delivered_by: string | null
          description: string | null
          destination: string | null
          flight_number: string | null
          freight: number | null
          id: string
          origin: string | null
          status: string | null
          tracking_number: string | null
          trip_id: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          amount_to_collect?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivered_by?: string | null
          description?: string | null
          destination?: string | null
          flight_number?: string | null
          freight?: number | null
          id?: string
          origin?: string | null
          status?: string | null
          tracking_number?: string | null
          trip_id?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          amount_to_collect?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivered_by?: string | null
          description?: string | null
          destination?: string | null
          flight_number?: string | null
          freight?: number | null
          id?: string
          origin?: string | null
          status?: string | null
          tracking_number?: string | null
          trip_id?: string | null
          updated_at?: string | null
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
        ]
      }
      sent_messages: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          image_url: string | null
          message: string
          phone: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          image_url?: string | null
          message: string
          phone: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          image_url?: string | null
          message?: string
          phone?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string | null
          description: string
          event_type: string
          id: string
          location: string | null
          package_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          location?: string | null
          package_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          location?: string | null
          package_id?: string | null
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
      travelers: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          arrival_date: string | null
          created_at: string | null
          departure_date: string | null
          destination: string | null
          flight_number: string | null
          id: string
          origin: string | null
          status: string | null
          traveler_id: string | null
          trip_date: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_date?: string | null
          created_at?: string | null
          departure_date?: string | null
          destination?: string | null
          flight_number?: string | null
          id?: string
          origin?: string | null
          status?: string | null
          traveler_id?: string | null
          trip_date?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_date?: string | null
          created_at?: string | null
          departure_date?: string | null
          destination?: string | null
          flight_number?: string | null
          id?: string
          origin?: string | null
          status?: string | null
          traveler_id?: string | null
          trip_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "travelers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action_type: string
          can_revert: boolean | null
          created_at: string | null
          description: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          reverted_at: string | null
          reverted_by: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          can_revert?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          reverted_at?: string | null
          reverted_by?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          can_revert?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          reverted_at?: string | null
          reverted_by?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_actions_reverted_by_fkey"
            columns: ["reverted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_first_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          admin_first_name: string
          admin_last_name: string
          admin_phone?: string
        }
        Returns: {
          success: boolean
          message: string
          user_id: string
        }[]
      }
      get_app_secret: {
        Args: { secret_name: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_app_secret: {
        Args: { secret_name: string; secret_value: string }
        Returns: boolean
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
