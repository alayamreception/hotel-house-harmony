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
      cleaning_tasks: {
        Row: {
          arrival_time: string | null
          booking_id: string | null
          checkout_extended: boolean | null
          cleaning_end_time: string | null
          cleaning_start_time: string | null
          cleaning_type: string | null
          completed_date: string | null
          created_at: string
          departure_time: string | null
          id: string
          notes: string | null
          room_id: string | null
          scheduled_date: string
          status: string
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          arrival_time?: string | null
          booking_id?: string | null
          checkout_extended?: boolean | null
          cleaning_end_time?: string | null
          cleaning_start_time?: string | null
          cleaning_type?: string | null
          completed_date?: string | null
          created_at?: string
          departure_time?: string | null
          id?: string
          notes?: string | null
          room_id?: string | null
          scheduled_date: string
          status: string
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          arrival_time?: string | null
          booking_id?: string | null
          checkout_extended?: boolean | null
          cleaning_end_time?: string | null
          cleaning_start_time?: string | null
          cleaning_type?: string | null
          completed_date?: string | null
          created_at?: string
          departure_time?: string | null
          id?: string
          notes?: string | null
          room_id?: string | null
          scheduled_date?: string
          status?: string
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaning_tasks_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaning_tasks_archive: {
        Row: {
          arrival_time: string | null
          booking_id: string | null
          checkout_extended: boolean | null
          cleaning_end_time: string | null
          cleaning_start_time: string | null
          completed_date: string | null
          created_at: string | null
          departure_time: string | null
          id: string | null
          notes: string | null
          room_id: string | null
          scheduled_date: string | null
          status: string | null
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_time?: string | null
          booking_id?: string | null
          checkout_extended?: boolean | null
          cleaning_end_time?: string | null
          cleaning_start_time?: string | null
          completed_date?: string | null
          created_at?: string | null
          departure_time?: string | null
          id?: string | null
          notes?: string | null
          room_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_time?: string | null
          booking_id?: string | null
          checkout_extended?: boolean | null
          cleaning_end_time?: string | null
          cleaning_start_time?: string | null
          completed_date?: string | null
          created_at?: string | null
          departure_time?: string | null
          id?: string | null
          notes?: string | null
          room_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      import_log: {
        Row: {
          id: string
          import_timestamp: string
          records_imported: number
          user_id: string
        }
        Insert: {
          id?: string
          import_timestamp?: string
          records_imported: number
          user_id: string
        }
        Update: {
          id?: string
          import_timestamp?: string
          records_imported?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_cottage: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          assigned_cottage?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          assigned_cottage?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      room_log: {
        Row: {
          created_at: string
          id: string
          log_timestamp: string
          log_type: string
          notes: string | null
          room_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_timestamp?: string
          log_type: string
          notes?: string | null
          room_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          log_timestamp?: string
          log_type?: string
          notes?: string | null
          room_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          early_checkout: boolean | null
          id: string
          last_cleaned: string | null
          notes: string | null
          priority: number | null
          room_number: string
          status: string
          today_checkout: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          early_checkout?: boolean | null
          id?: string
          last_cleaned?: string | null
          notes?: string | null
          priority?: number | null
          room_number: string
          status: string
          today_checkout?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          early_checkout?: boolean | null
          id?: string
          last_cleaned?: string | null
          notes?: string | null
          priority?: number | null
          room_number?: string
          status?: string
          today_checkout?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          name: string
          role: string | null
          shift: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
          shift?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          shift?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          staff_id: string
          task_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          staff_id: string
          task_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          staff_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "cleaning_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_for_the_day: {
        Row: {
          arrival: string | null
          cleaning_type: string | null
          dep: string | null
          id: number
          remarks: string | null
          room_no: string | null
          supervisor: string | null
        }
        Insert: {
          arrival?: string | null
          cleaning_type?: string | null
          dep?: string | null
          id?: never
          remarks?: string | null
          room_no?: string | null
          supervisor?: string | null
        }
        Update: {
          arrival?: string | null
          cleaning_type?: string | null
          dep?: string | null
          id?: never
          remarks?: string | null
          room_no?: string | null
          supervisor?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      import_tasks: {
        Args: { data: Json }
        Returns: undefined
      }
      insert_cleaning_tasks: {
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
