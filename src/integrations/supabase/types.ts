export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customer_accounts: {
        Row: {
          created_at: string
          id: string
          phone: string
          pin_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone: string
          pin_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string
          pin_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          created_at: string
          expires_at: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          pix_transaction_id: string | null
          quantity: number
          raffle_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          created_at?: string
          expires_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pix_transaction_id?: string | null
          quantity: number
          raffle_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string
          created_at?: string
          expires_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pix_transaction_id?: string | null
          quantity?: number
          raffle_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_numbers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          number: number
          purchase_id: string
          raffle_id: string
          reserved_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          number: number
          purchase_id: string
          raffle_id: string
          reserved_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          number?: number
          purchase_id?: string
          raffle_id?: string
          reserved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_numbers_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_numbers_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles: {
        Row: {
          created_at: string
          description: string | null
          draw_date: string | null
          id: string
          image_url: string | null
          pix_beneficiary_name: string | null
          pix_key: string | null
          pix_key_type: string | null
          price_per_number: number
          prize_description: string
          status: Database["public"]["Enums"]["raffle_status"]
          title: string
          total_numbers: number
          updated_at: string
          winner_name: string | null
          winner_number: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          draw_date?: string | null
          id?: string
          image_url?: string | null
          pix_beneficiary_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          price_per_number?: number
          prize_description: string
          status?: Database["public"]["Enums"]["raffle_status"]
          title: string
          total_numbers?: number
          updated_at?: string
          winner_name?: string | null
          winner_number?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          draw_date?: string | null
          id?: string
          image_url?: string | null
          pix_beneficiary_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          price_per_number?: number
          prize_description?: string
          status?: Database["public"]["Enums"]["raffle_status"]
          title?: string
          total_numbers?: number
          updated_at?: string
          winner_name?: string | null
          winner_number?: number | null
        }
        Relationships: []
      }
      spin_balance: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
          spins_available: number
          total_spins: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          spins_available?: number
          total_spins?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          spins_available?: number
          total_spins?: number
          updated_at?: string
        }
        Relationships: []
      }
      spin_history: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone: string | null
          prize_type: string
          prize_value: Json
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          prize_type: string
          prize_value: Json
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          prize_type?: string
          prize_value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      payment_status: "pending" | "approved" | "rejected" | "expired"
      raffle_status: "draft" | "active" | "completed" | "cancelled"
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
    Enums: {
      app_role: ["admin", "user"],
      payment_status: ["pending", "approved", "rejected", "expired"],
      raffle_status: ["draft", "active", "completed", "cancelled"],
    },
  },
} as const
