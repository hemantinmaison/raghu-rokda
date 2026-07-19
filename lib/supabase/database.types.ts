export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          monthly_salary: number;
          working_days_per_month: number;
          working_hours_per_day: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_salary?: number;
          working_days_per_month?: number;
          working_hours_per_day?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_salary?: number;
          working_days_per_month?: number;
          working_hours_per_day?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          color: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          color?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          color?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      budget_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          amount: number;
          category_id: string;
          details: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          amount: number;
          category_id: string;
          details?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          amount?: number;
          category_id?: string;
          details?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_items_category_user_fkey";
            columns: ["category_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "user_id"];
          }
        ];
      };
      debt_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          amount: number;
          interest_rate: number | null;
          tenure_months: number | null;
          monthly_emi: number | null;
          details: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          amount: number;
          interest_rate?: number | null;
          tenure_months?: number | null;
          monthly_emi?: number | null;
          details?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          amount?: number;
          interest_rate?: number | null;
          tenure_months?: number | null;
          monthly_emi?: number | null;
          details?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          amount: number;
          details: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          amount: number;
          details?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          amount?: number;
          details?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quote_likes: {
        Row: {
          user_id: string;
          quote_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          quote_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          quote_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_category: {
        Args: { p_category_id: string };
        Returns: undefined;
      };
      ensure_category: {
        Args: { p_name: string };
        Returns: string;
      };
      ensure_user_finances: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      reorder_categories: {
        Args: { p_ids: string[] };
        Returns: undefined;
      };
      reorder_items: {
        Args: { p_kind: string; p_ids: string[] };
        Returns: undefined;
      };
      quote_like_counts: {
        Args: Record<string, never>;
        Returns: { quote_id: string; like_count: number }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
