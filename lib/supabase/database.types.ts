export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          monthly_salary: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_salary?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_salary?: number;
          currency?: string;
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
          category: string;
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
          category: string;
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
          category?: string;
          details?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
