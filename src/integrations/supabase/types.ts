export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_escalations: {
        Row: {
          admin_response: string | null
          answered_at: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          original_question: string
          status: string
        }
        Insert: {
          admin_response?: string | null
          answered_at?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          original_question: string
          status?: string
        }
        Update: {
          admin_response?: string | null
          answered_at?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          original_question?: string
          status?: string
        }
        Relationships: []
      }
      ai_chat_interactions: {
        Row: {
          ai_response: string
          context_info: Json | null
          created_at: string
          customer_id: string | null
          customer_phone: string
          id: string
          response_time_ms: number | null
          updated_at: string
          user_message: string
          was_fallback: boolean | null
        }
        Insert: {
          ai_response: string
          context_info?: Json | null
          created_at?: string
          customer_id?: string | null
          customer_phone: string
          id?: string
          response_time_ms?: number | null
          updated_at?: string
          user_message: string
          was_fallback?: boolean | null
        }
        Update: {
          ai_response?: string
          context_info?: Json | null
          created_at?: string
          customer_id?: string | null
          customer_phone?: string
          id?: string
          response_time_ms?: number | null
          updated_at?: string
          user_message?: string
          was_fallback?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_improvement_patterns: {
        Row: {
          example_interactions: string[] | null
          id: string
          identified_at: string
          pattern_description: string
          pattern_type: string
          priority_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_improvement: string | null
        }
        Insert: {
          example_interactions?: string[] | null
          id?: string
          identified_at?: string
          pattern_description: string
          pattern_type: string
          priority_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_improvement?: string | null
        }
        Update: {
          example_interactions?: string[] | null
          id?: string
          identified_at?: string
          pattern_description?: string
          pattern_type?: string
          priority_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_improvement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_improvement_patterns_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_response_feedback: {
        Row: {
          agent_notes: string | null
          created_at: string
          created_by: string | null
          feedback_details: Json | null
          feedback_source: string
          feedback_type: string
          id: string
          interaction_id: string | null
        }
        Insert: {
          agent_notes?: string | null
          created_at?: string
          created_by?: string | null
          feedback_details?: Json | null
          feedback_source: string
          feedback_type: string
          id?: string
          interaction_id?: string | null
        }
        Update: {
          agent_notes?: string | null
          created_at?: string
          created_by?: string | null
          feedback_details?: Json | null
          feedback_source?: string
          feedback_type?: string
          id?: string
          interaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_response_feedback_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_response_feedback_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_interactions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      marketing_campaigns: {
        Row: {
          campaign_name: string
          created_at: string
          created_by: string | null
          failed_count: number
          id: string
          sent_at: string
          success_count: number
          total_messages_sent: number
          trip_end_date: string
          trip_start_date: string
        }
        Insert: {
          campaign_name: string
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          sent_at?: string
          success_count?: number
          total_messages_sent?: number
          trip_end_date: string
          trip_start_date: string
        }
        Update: {
          campaign_name?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          sent_at?: string
          success_count?: number
          total_messages_sent?: number
          trip_end_date?: string
          trip_start_date?: string
        }
        Relationships: []
      }
      marketing_contacts: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          is_active: boolean
          last_message_sent_at: string | null
          notes: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          is_active?: boolean
          last_message_sent_at?: string | null
          notes?: string | null
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          is_active?: boolean
          last_message_sent_at?: string | null
          notes?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_message_log: {
        Row: {
          campaign_id: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string
          error_message: string | null
          id: string
          message_content: string
          sent_at: string | null
          status: string
          whatsapp_message_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          error_message?: string | null
          id?: string
          message_content: string
          sent_at?: string | null
          status?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          error_message?: string | null
          id?: string
          message_content?: string
          sent_at?: string | null
          status?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_message_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_settings: {
        Row: {
          auto_send_enabled: boolean
          created_at: string
          id: string
          last_campaign_sent_at: string | null
          message_frequency_days: number
          message_template: string
          trip_window_days: number
          updated_at: string
        }
        Insert: {
          auto_send_enabled?: boolean
          created_at?: string
          id?: string
          last_campaign_sent_at?: string | null
          message_frequency_days?: number
          message_template?: string
          trip_window_days?: number
          updated_at?: string
        }
        Update: {
          auto_send_enabled?: boolean
          created_at?: string
          id?: string
          last_campaign_sent_at?: string | null
          message_frequency_days?: number
          message_template?: string
          trip_window_days?: number
          updated_at?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "packages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      route_freight_rates: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          destination: string
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean
          notes: string | null
          origin: string
          price_per_kilo: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          destination: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          origin: string
          price_per_kilo: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          destination?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          origin?: string
          price_per_kilo?: number
          updated_at?: string
        }
        Relationships: []
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
      trip_notification_log: {
        Row: {
          created_at: string
          customer_id: string
          customer_name: string
          customer_phone: string
          error_message: string | null
          id: string
          personalized_message: string
          sent_at: string | null
          status: string
          template_language: string | null
          template_name: string | null
          trip_notification_id: string
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_name: string
          customer_phone: string
          error_message?: string | null
          id?: string
          personalized_message: string
          sent_at?: string | null
          status?: string
          template_language?: string | null
          template_name?: string | null
          trip_notification_id: string
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          error_message?: string | null
          id?: string
          personalized_message?: string
          sent_at?: string | null
          status?: string
          template_language?: string | null
          template_name?: string | null
          trip_notification_id?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_notification_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_notification_log_trip_notification_id_fkey"
            columns: ["trip_notification_id"]
            isOneToOne: false
            referencedRelation: "trip_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_notifications: {
        Row: {
          created_at: string
          created_by: string | null
          deadline_date: string
          deadline_time: string
          failed_count: number | null
          id: string
          message_template: string
          outbound_trip_id: string
          return_trip_id: string
          sent_at: string | null
          status: string
          success_count: number | null
          template_language: string | null
          template_name: string | null
          total_customers_sent: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline_date: string
          deadline_time?: string
          failed_count?: number | null
          id?: string
          message_template: string
          outbound_trip_id: string
          return_trip_id: string
          sent_at?: string | null
          status?: string
          success_count?: number | null
          template_language?: string | null
          template_name?: string | null
          total_customers_sent?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline_date?: string
          deadline_time?: string
          failed_count?: number | null
          id?: string
          message_template?: string
          outbound_trip_id?: string
          return_trip_id?: string
          sent_at?: string | null
          status?: string
          success_count?: number | null
          template_language?: string | null
          template_name?: string | null
          total_customers_sent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      generate_marketing_message: {
        Args: {
          customer_name_param: string
          template_param: string
          start_date: string
          end_date: string
        }
        Returns: string
      }
      generate_marketing_message_with_rates: {
        Args: {
          customer_name_param: string
          template_param: string
          start_date: string
          end_date: string
        }
        Returns: string
      }
      generate_trip_notification_message: {
        Args: {
          customer_name_param: string
          template_param: string
          outbound_date: string
          return_date: string
          deadline_date: string
        }
        Returns: string
      }
      get_app_secret: {
        Args: { secret_name: string }
        Returns: string
      }
      get_current_freight_rate: {
        Args: {
          origin_param: string
          destination_param: string
          reference_date?: string
        }
        Returns: {
          rate_id: string
          price_per_kilo: number
          currency: string
          notes: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_trips_for_marketing_period: {
        Args: { start_date: string; end_date: string }
        Returns: {
          trip_id: string
          trip_date: string
          origin: string
          destination: string
          flight_number: string
          status: string
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
