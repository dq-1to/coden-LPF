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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      base_nook_progress: {
        Row: {
          answered_at: string
          correct: boolean
          id: string
          question_id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          correct?: boolean
          id?: string
          question_id: string
          topic_id: string
          user_id: string
        }
        Update: {
          answered_at?: string
          correct?: boolean
          id?: string
          question_id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          code: string
          id: string
          is_passed: boolean
          matched_keywords: string[]
          step_id: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          is_passed?: boolean
          matched_keywords?: string[]
          step_id: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          is_passed?: boolean
          matched_keywords?: string[]
          step_id?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_stats: {
        Row: {
          current_streak: number
          id: string
          last_study_date: string | null
          max_streak: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_study_date?: string | null
          max_streak?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_study_date?: string | null
          max_streak?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      point_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_admin: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_admin?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_note: string | null
          category: string
          created_at: string
          id: string
          image_paths: Json
          message: string
          page_url: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          category: string
          created_at?: string
          id?: string
          image_paths?: Json
          message: string
          page_url?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          category?: string
          created_at?: string
          id?: string
          image_paths?: Json
          message?: string
          page_url?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          payload: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      daily_challenge_history: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          completed: boolean
          points_earned: number
          completed_at: string | null
          challenge_date: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          completed?: boolean
          points_earned?: number
          completed_at?: string | null
          challenge_date: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          completed?: boolean
          points_earned?: number
          completed_at?: string | null
          challenge_date?: string
        }
        Relationships: []
      }
      code_doctor_progress: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          category: string
          difficulty: string
          solved: boolean
          attempts: number
          solved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          problem_id: string
          category?: string
          difficulty: string
          solved?: boolean
          attempts?: number
          solved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          problem_id?: string
          category?: string
          difficulty?: string
          solved?: boolean
          attempts?: number
          solved_at?: string | null
        }
        Relationships: []
      }
      code_reading_progress: {
        Row: { id: string; user_id: string; problem_id: string; correct_count: number; total_count: number; completed: boolean; completed_at: string | null }
        Insert: { id?: string; user_id: string; problem_id: string; correct_count?: number; total_count?: number; completed?: boolean; completed_at?: string | null }
        Update: { id?: string; user_id?: string; problem_id?: string; correct_count?: number; total_count?: number; completed?: boolean; completed_at?: string | null }
        Relationships: []
      }
      mini_project_progress: {
        Row: { id: string; user_id: string; project_id: string; status: string; code: string | null; completed_at: string | null }
        Insert: { id?: string; user_id: string; project_id: string; status?: string; code?: string | null; completed_at?: string | null }
        Update: { id?: string; user_id?: string; project_id?: string; status?: string; code?: string | null; completed_at?: string | null }
        Relationships: []
      }
      step_progress: {
        Row: {
          challenge_done: boolean
          completed_at: string | null
          id: string
          practice_done: boolean
          read_done: boolean
          step_id: string
          test_done: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_done?: boolean
          completed_at?: string | null
          id?: string
          practice_done?: boolean
          read_done?: boolean
          step_id: string
          test_done?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_done?: boolean
          completed_at?: string | null
          id?: string
          practice_done?: boolean
          read_done?: boolean
          step_id?: string
          test_done?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points_tx: {
        Args: {
          p_amount: number
          p_reason: string
        }
        Returns: undefined
      }
      record_study_activity: {
        Args: Record<string, never>
        Returns: undefined
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_dau_last_30_days: {
        Args: Record<string, never>
        Returns: {
          activity_date: string
          active_users: number
        }[]
      }
      get_step_completion_rates: {
        Args: Record<string, never>
        Returns: {
          step_id: string
          total_users: number
          completed_users: number
          completion_rate: number
        }[]
      }
      get_top_missed_questions: {
        Args: {
          p_limit?: number
          p_min_attempts?: number
        }
        Returns: {
          step_id: string
          attempt_count: number
          failure_count: number
          failure_rate: number
        }[]
      }
      admin_list_users: {
        Args: Record<string, never>
        Returns: {
          user_id: string
          email: string | null
          display_name: string | null
          is_admin: boolean
          total_points: number
          current_streak: number
          max_streak: number
          last_study_date: string | null
          badge_count: number
          created_at: string
        }[]
      }
      admin_get_user_basic: {
        Args: {
          p_user_id: string
        }
        Returns: {
          user_id: string
          email: string | null
          display_name: string | null
          is_admin: boolean
          created_at: string
        }[]
      }
      admin_grant_points: {
        Args: {
          p_target_user_id: string
          p_amount: number
          p_reason: string
        }
        Returns: undefined
      }
      admin_grant_badge: {
        Args: {
          p_target_user_id: string
          p_badge_id: string
        }
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
