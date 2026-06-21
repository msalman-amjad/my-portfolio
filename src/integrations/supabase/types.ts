export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      academics: {
        Row: {
          achievements: string | null;
          created_at: string;
          degree: string;
          id: string;
          institution: string;
          sort_order: number;
          year: string;
        };
        Insert: {
          achievements?: string | null;
          created_at?: string;
          degree: string;
          id?: string;
          institution: string;
          sort_order?: number;
          year: string;
        };
        Update: {
          achievements?: string | null;
          created_at?: string;
          degree?: string;
          id?: string;
          institution?: string;
          sort_order?: number;
          year?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profile: {
        Row: {
          avatar_url: string | null;
          bio: string;
          cv_url: string | null;
          email: string | null;
          full_name: string;
          github_url: string | null;
          id: string;
          linkedin_url: string | null;
          phone: string | null;
          roles: string[];
          title: string;
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string;
          cv_url?: string | null;
          email?: string | null;
          full_name?: string;
          github_url?: string | null;
          id?: string;
          linkedin_url?: string | null;
          phone?: string | null;
          roles?: string[];
          title?: string;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string;
          cv_url?: string | null;
          email?: string | null;
          full_name?: string;
          github_url?: string | null;
          id?: string;
          linkedin_url?: string | null;
          phone?: string | null;
          roles?: string[];
          title?: string;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          category_id: string | null;
          cover_image: string | null;
          created_at: string;
          cv_description: string | null;
          description: string;
          document_url: string | null;
          github_url: string | null;
          id: string;
          images: string[];
          is_featured_cv: boolean;
          project_images: string[];
          linkedin_video_url: string | null;
          live_url: string | null;
          short_description: string;
          sort_order: number;
          technologies: string[];
          title: string;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          category_id?: string | null;
          cover_image?: string | null;
          created_at?: string;
          cv_description?: string | null;
          description?: string;
          document_url?: string | null;
          github_url?: string | null;
          id?: string;
          images?: string[];
          is_featured_cv?: boolean;
          project_images?: string[];
          linkedin_video_url?: string | null;
          live_url?: string | null;
          short_description?: string;
          sort_order?: number;
          technologies?: string[];
          title: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          category_id?: string | null;
          cover_image?: string | null;
          created_at?: string;
          cv_description?: string | null;
          description?: string;
          document_url?: string | null;
          github_url?: string | null;
          id?: string;
          images?: string[];
          is_featured_cv?: boolean;
          project_images?: string[];
          linkedin_video_url?: string | null;
          live_url?: string | null;
          short_description?: string;
          sort_order?: number;
          technologies?: string[];
          title?: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      work_experience: {
        Row: {
          company: string;
          created_at: string;
          cv_description: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          is_featured_cv: boolean;
          is_ongoing: boolean;
          job_title: string;
          sort_order: number;
          start_date: string;
        };
        Insert: {
          company: string;
          created_at?: string;
          cv_description?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_featured_cv?: boolean;
          is_ongoing?: boolean;
          job_title: string;
          sort_order?: number;
          start_date: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          cv_description?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_featured_cv?: boolean;
          is_ongoing?: boolean;
          job_title?: string;
          sort_order?: number;
          start_date?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          category: string;
          created_at: string;
          icon: string | null;
          id: string;
          level: number;
          name: string;
          sort_order: number;
        };
        Insert: {
          category?: string;
          created_at?: string;
          icon?: string | null;
          id?: string;
          level?: number;
          name: string;
          sort_order?: number;
        };
        Update: {
          category?: string;
          created_at?: string;
          icon?: string | null;
          id?: string;
          level?: number;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
