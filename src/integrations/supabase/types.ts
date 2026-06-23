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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_submissions: {
        Row: {
          capabilities: string[]
          category: string
          contact_email: string
          created_at: string
          demo_url: string | null
          description: string
          id: string
          name: string
          pricing_notes: string | null
          published_agent_id: string | null
          repo_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitter_id: string
          tagline: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          capabilities?: string[]
          category: string
          contact_email: string
          created_at?: string
          demo_url?: string | null
          description: string
          id?: string
          name: string
          pricing_notes?: string | null
          published_agent_id?: string | null
          repo_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitter_id: string
          tagline: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          capabilities?: string[]
          category?: string
          contact_email?: string
          created_at?: string
          demo_url?: string | null
          description?: string
          id?: string
          name?: string
          pricing_notes?: string | null
          published_agent_id?: string | null
          repo_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitter_id?: string
          tagline?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_submissions_published_agent_id_fkey"
            columns: ["published_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          active: boolean
          capabilities: string[]
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string | null
          name: string
          price_cents: number | null
          scheduled_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          tagline: string
          tier: Database["public"]["Enums"]["agent_tier"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          capabilities?: string[]
          category: string
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          price_cents?: number | null
          scheduled_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          tagline: string
          tier?: Database["public"]["Enums"]["agent_tier"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          capabilities?: string[]
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number | null
          scheduled_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          tagline?: string
          tier?: Database["public"]["Enums"]["agent_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          id: string
          name: string
          occurred_at: string
          props: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          occurred_at?: string
          props?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          occurred_at?: string
          props?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          body: string
          category: string
          created_at: string
          excerpt: string
          id: string
          published: boolean
          published_at: string
          read_minutes: number
          scheduled_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          category: string
          created_at?: string
          excerpt: string
          id?: string
          published?: boolean
          published_at?: string
          read_minutes?: number
          scheduled_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: string
          created_at?: string
          excerpt?: string
          id?: string
          published?: boolean
          published_at?: string
          read_minutes?: number
          scheduled_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          links: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          links?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          links?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          name: string
          organization: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          organization?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          organization?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      discussion_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_posts: {
        Row: {
          body: string
          category: string
          comment_count: number
          created_at: string
          id: string
          last_activity_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          comment_count?: number
          created_at?: string
          id?: string
          last_activity_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          comment_count?: number
          created_at?: string
          id?: string
          last_activity_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          asset_name: string | null
          asset_path: string | null
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          price_cents: number | null
          slug: string
          tagline: string
          tier: Database["public"]["Enums"]["agent_tier"]
          unlock_content: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          asset_name?: string | null
          asset_path?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          price_cents?: number | null
          slug: string
          tagline: string
          tier?: Database["public"]["Enums"]["agent_tier"]
          unlock_content?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          asset_name?: string | null
          asset_path?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number | null
          slug?: string
          tagline?: string
          tier?: Database["public"]["Enums"]["agent_tier"]
          unlock_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_agents: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_articles: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          name: string
          outcomes: string[]
          scheduled_at: string | null
          slug: string
          starting_price_cents: number | null
          status: Database["public"]["Enums"]["publish_status"]
          tagline: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          id?: string
          name: string
          outcomes?: string[]
          scheduled_at?: string | null
          slug: string
          starting_price_cents?: number | null
          status?: Database["public"]["Enums"]["publish_status"]
          tagline: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          name?: string
          outcomes?: string[]
          scheduled_at?: string | null
          slug?: string
          starting_price_cents?: number | null
          status?: Database["public"]["Enums"]["publish_status"]
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          created_at: string
          environment: string
          granted_at: string
          id: string
          kind: string
          price_id: string | null
          slug: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          environment?: string
          granted_at?: string
          id?: string
          kind: string
          price_id?: string | null
          slug: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          granted_at?: string
          id?: string
          kind?: string
          price_id?: string | null
          slug?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          categories: string[]
          content_types: string[]
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: string[]
          content_types?: string[]
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: string[]
          content_types?: string[]
          created_at?: string
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          interest: string | null
          ip_hash: string | null
          product_slug: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          ip_hash?: string | null
          product_slug?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          ip_hash?: string | null
          product_slug?: string | null
          source?: string | null
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
      agent_tier: "free" | "premium" | "custom"
      app_role: "admin" | "member"
      publish_status: "draft" | "scheduled" | "published"
      submission_status: "pending" | "approved" | "rejected"
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
      agent_tier: ["free", "premium", "custom"],
      app_role: ["admin", "member"],
      publish_status: ["draft", "scheduled", "published"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
