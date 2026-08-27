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
    PostgrestVersion: "14.17"
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
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
          asset_name: string | null
          asset_path: string | null
          capabilities: string[]
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string | null
          max_tokens: number
          model: string
          name: string
          price_cents: number | null
          scheduled_at: string | null
          seller_id: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          system_prompt: string | null
          tagline: string
          temperature: number
          tier: Database["public"]["Enums"]["agent_tier"]
          unlock_content: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          asset_name?: string | null
          asset_path?: string | null
          capabilities?: string[]
          category: string
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          image_url?: string | null
          max_tokens?: number
          model?: string
          name: string
          price_cents?: number | null
          scheduled_at?: string | null
          seller_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          system_prompt?: string | null
          tagline: string
          temperature?: number
          tier?: Database["public"]["Enums"]["agent_tier"]
          unlock_content?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          asset_name?: string | null
          asset_path?: string | null
          capabilities?: string[]
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          max_tokens?: number
          model?: string
          name?: string
          price_cents?: number | null
          scheduled_at?: string | null
          seller_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          system_prompt?: string | null
          tagline?: string
          temperature?: number
          tier?: Database["public"]["Enums"]["agent_tier"]
          unlock_content?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          seller_id: string | null
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
          seller_id?: string | null
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
          seller_id?: string | null
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
          {
            foreignKeyName: "articles_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
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
      builder_challenges: {
        Row: {
          created_at: string
          ends_at: string
          excerpt: string
          id: string
          prompt: string
          published: boolean
          related_category: string
          slug: string
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          excerpt: string
          id?: string
          prompt: string
          published?: boolean
          related_category: string
          slug: string
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          excerpt?: string
          id?: string
          prompt?: string
          published?: boolean
          related_category?: string
          slug?: string
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_invoices: {
        Row: {
          add_ons: Json | null
          client_email: string
          client_name: string
          client_organization: string | null
          created_at: string
          deposit_cents: number
          deposit_paid_at: string | null
          description: string | null
          discount_cents: number | null
          due_date: string | null
          final_cents: number
          final_paid_at: string | null
          id: string
          invoice_number: string
          line_items: Json
          notes: string | null
          original_total_cents: number | null
          public_access_token: string
          selected_add_ons: Json | null
          service_type: string
          status: string
          stripe_deposit_session_id: string | null
          stripe_final_session_id: string | null
          title: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          add_ons?: Json | null
          client_email: string
          client_name: string
          client_organization?: string | null
          created_at?: string
          deposit_cents: number
          deposit_paid_at?: string | null
          description?: string | null
          discount_cents?: number | null
          due_date?: string | null
          final_cents: number
          final_paid_at?: string | null
          id?: string
          invoice_number: string
          line_items?: Json
          notes?: string | null
          original_total_cents?: number | null
          public_access_token?: string
          selected_add_ons?: Json | null
          service_type: string
          status?: string
          stripe_deposit_session_id?: string | null
          stripe_final_session_id?: string | null
          title: string
          total_cents: number
          updated_at?: string
        }
        Update: {
          add_ons?: Json | null
          client_email?: string
          client_name?: string
          client_organization?: string | null
          created_at?: string
          deposit_cents?: number
          deposit_paid_at?: string | null
          description?: string | null
          discount_cents?: number | null
          due_date?: string | null
          final_cents?: number
          final_paid_at?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json
          notes?: string | null
          original_total_cents?: number | null
          public_access_token?: string
          selected_add_ons?: Json | null
          service_type?: string
          status?: string
          stripe_deposit_session_id?: string | null
          stripe_final_session_id?: string | null
          title?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          assigned_owner: string | null
          created_at: string
          email: string
          follow_up_at: string | null
          handled: boolean
          id: string
          inquiry_type: string
          ip_hash: string | null
          lead_status: string
          message: string
          name: string
          organization: string | null
          topic: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_owner?: string | null
          created_at?: string
          email: string
          follow_up_at?: string | null
          handled?: boolean
          id?: string
          inquiry_type?: string
          ip_hash?: string | null
          lead_status?: string
          message: string
          name: string
          organization?: string | null
          topic?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_owner?: string | null
          created_at?: string
          email?: string
          follow_up_at?: string | null
          handled?: boolean
          id?: string
          inquiry_type?: string
          ip_hash?: string | null
          lead_status?: string
          message?: string
          name?: string
          organization?: string | null
          topic?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      content_review_packet_events: {
        Row: {
          actor_id: string | null
          created_at: string
          details: Json
          event_type: string
          from_status: string | null
          id: number
          packet_id: string
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event_type: string
          from_status?: string | null
          id?: number
          packet_id: string
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: Json
          event_type?: string
          from_status?: string | null
          id?: number
          packet_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_review_packet_events_packet_id_fkey"
            columns: ["packet_id"]
            isOneToOne: false
            referencedRelation: "content_review_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_review_packets: {
        Row: {
          cluster: string | null
          created_at: string
          decision: string | null
          duration_ms: number | null
          failure_code: string | null
          failure_message: string | null
          finished_at: string | null
          id: string
          model_requested: string | null
          model_used: string | null
          packet: Json
          primary_query: string | null
          primary_url: string | null
          prompt_version: string
          provider: string
          provider_request_id: string | null
          reader_outcome: string | null
          requested_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          run_date: string
          run_key: string
          source_annotations: Json
          started_at: string | null
          status: string
          topic_hint: string | null
          updated_at: string
          usage: Json
          validation_errors: string[]
        }
        Insert: {
          cluster?: string | null
          created_at?: string
          decision?: string | null
          duration_ms?: number | null
          failure_code?: string | null
          failure_message?: string | null
          finished_at?: string | null
          id?: string
          model_requested?: string | null
          model_used?: string | null
          packet?: Json
          primary_query?: string | null
          primary_url?: string | null
          prompt_version?: string
          provider?: string
          provider_request_id?: string | null
          reader_outcome?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_date?: string
          run_key: string
          source_annotations?: Json
          started_at?: string | null
          status?: string
          topic_hint?: string | null
          updated_at?: string
          usage?: Json
          validation_errors?: string[]
        }
        Update: {
          cluster?: string | null
          created_at?: string
          decision?: string | null
          duration_ms?: number | null
          failure_code?: string | null
          failure_message?: string | null
          finished_at?: string | null
          id?: string
          model_requested?: string | null
          model_used?: string | null
          packet?: Json
          primary_query?: string | null
          primary_url?: string | null
          prompt_version?: string
          provider?: string
          provider_request_id?: string | null
          reader_outcome?: string | null
          requested_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_date?: string
          run_key?: string
          source_annotations?: Json
          started_at?: string | null
          status?: string
          topic_hint?: string | null
          updated_at?: string
          usage?: Json
          validation_errors?: string[]
        }
        Relationships: []
      }
      discussion_comments: {
        Row: {
          body: string
          created_at: string
          depth: number
          id: string
          parent_reply_id: string | null
          path: string
          post_id: string
          reaction_count: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          depth?: number
          id?: string
          parent_reply_id?: string | null
          path?: string
          post_id: string
          reaction_count?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          depth?: number
          id?: string
          parent_reply_id?: string | null
          path?: string
          post_id?: string
          reaction_count?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
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
          locked: boolean
          media_urls: string[]
          reaction_count: Json
          reply_count: number
          title: string | null
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
          locked?: boolean
          media_urls?: string[]
          reaction_count?: Json
          reply_count?: number
          title?: string | null
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
          locked?: boolean
          media_urls?: string[]
          reaction_count?: Json
          reply_count?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          suppressed: boolean
          tag: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          suppressed?: boolean
          tag: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          suppressed?: boolean
          tag?: string
          usage_count?: number
        }
        Relationships: []
      }
      learning_path_items: {
        Row: {
          created_at: string
          excerpt: string | null
          id: string
          item_slug: string
          item_type: string
          path_id: string
          sort_order: number
          title: string | null
        }
        Insert: {
          created_at?: string
          excerpt?: string | null
          id?: string
          item_slug: string
          item_type: string
          path_id: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          excerpt?: string | null
          id?: string
          item_slug?: string
          item_type?: string
          path_id?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_items_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          audience: string
          created_at: string
          difficulty: string
          excerpt: string
          id: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          audience: string
          created_at?: string
          difficulty: string
          excerpt: string
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          difficulty?: string
          excerpt?: string
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mcp_servers: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          is_public: boolean
          name: string
          provider: string
          submitted_by: string | null
          tags: string[]
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          is_public?: boolean
          name: string
          provider?: string
          submitted_by?: string | null
          tags?: string[]
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          is_public?: boolean
          name?: string
          provider?: string
          submitted_by?: string | null
          tags?: string[]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_servers_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          post_id: string | null
          read_at: string | null
          reply_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read_at?: string | null
          reply_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read_at?: string | null
          reply_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          note: string | null
          post_id: string
          reason: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          post_id: string
          reason?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          post_id?: string
          reason?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          channel: string
          created_at: string
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          asset_name: string | null
          asset_path: string | null
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string | null
          max_tokens: number
          model: string
          name: string
          price_cents: number | null
          scheduled_at: string | null
          seller_id: string | null
          slug: string
          status: string
          system_prompt: string | null
          tagline: string
          temperature: number
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
          featured?: boolean
          id?: string
          image_url?: string | null
          max_tokens?: number
          model?: string
          name: string
          price_cents?: number | null
          scheduled_at?: string | null
          seller_id?: string | null
          slug: string
          status?: string
          system_prompt?: string | null
          tagline: string
          temperature?: number
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
          featured?: boolean
          id?: string
          image_url?: string | null
          max_tokens?: number
          model?: string
          name?: string
          price_cents?: number | null
          scheduled_at?: string | null
          seller_id?: string | null
          slug?: string
          status?: string
          system_prompt?: string | null
          tagline?: string
          temperature?: number
          tier?: Database["public"]["Enums"]["agent_tier"]
          unlock_content?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_badges: {
        Row: {
          created_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_links: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          builder_focus_tags: string[]
          cover_url: string | null
          created_at: string
          display_name: string | null
          fit_finder_result: Json | null
          followers_count: number
          following_count: number
          id: string
          pinned_post_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          builder_focus_tags?: string[]
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          fit_finder_result?: Json | null
          followers_count?: number
          following_count?: number
          id: string
          pinned_post_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          builder_focus_tags?: string[]
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          fit_finder_result?: Json | null
          followers_count?: number
          following_count?: number
          id?: string
          pinned_post_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pinned_post_id_fkey"
            columns: ["pinned_post_id"]
            isOneToOne: false
            referencedRelation: "discussion_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_public: boolean
          tags: string[]
          title: string
          updated_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_public?: boolean
          tags?: string[]
          title: string
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: []
      }
      public_endpoint_rate_limits: {
        Row: {
          key_hash: string
          request_count: number
          updated_at: string
          window_started_at: string
        }
        Insert: {
          key_hash: string
          request_count?: number
          updated_at?: string
          window_started_at: string
        }
        Update: {
          key_hash?: string
          request_count?: number
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      reply_reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_reactions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
        ]
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
      seller_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          commission_rate: number
          created_at: string
          display_name: string
          id: string
          payout_enabled: boolean
          slug: string
          stripe_account_id: string | null
          stripe_account_status: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number
          created_at?: string
          display_name: string
          id?: string
          payout_enabled?: boolean
          slug: string
          stripe_account_id?: string | null
          stripe_account_status?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number
          created_at?: string
          display_name?: string
          id?: string
          payout_enabled?: boolean
          slug?: string
          stripe_account_id?: string | null
          stripe_account_status?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      service_system_lead_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          lead_id: string
          metadata: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          lead_id: string
          metadata?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          lead_id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "service_system_lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "service_system_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      service_system_leads: {
        Row: {
          admin_notes: string | null
          assigned_owner: string | null
          budget_range: string
          business_name: string
          campaign: string | null
          consent_at: string
          contact_name: string
          created_at: string
          current_tools: string | null
          desired_outcome: string
          email: string
          id: string
          industry: string
          invoice_number: string | null
          ip_hash: string | null
          landing_path: string | null
          locations: number
          monthly_volume: string
          phone: string
          primary_leak: string
          service_model: string
          source: string | null
          status: string
          team_size: string
          updated_at: string
          urgency: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_owner?: string | null
          budget_range: string
          business_name: string
          campaign?: string | null
          consent_at: string
          contact_name: string
          created_at?: string
          current_tools?: string | null
          desired_outcome: string
          email: string
          id?: string
          industry: string
          invoice_number?: string | null
          ip_hash?: string | null
          landing_path?: string | null
          locations?: number
          monthly_volume: string
          phone: string
          primary_leak: string
          service_model: string
          source?: string | null
          status?: string
          team_size: string
          updated_at?: string
          urgency: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_owner?: string | null
          budget_range?: string
          business_name?: string
          campaign?: string | null
          consent_at?: string
          contact_name?: string
          created_at?: string
          current_tools?: string | null
          desired_outcome?: string
          email?: string
          id?: string
          industry?: string
          invoice_number?: string | null
          ip_hash?: string | null
          landing_path?: string | null
          locations?: number
          monthly_volume?: string
          phone?: string
          primary_leak?: string
          service_model?: string
          source?: string | null
          status?: string
          team_size?: string
          updated_at?: string
          urgency?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_system_leads_invoice_number_fkey"
            columns: ["invoice_number"]
            isOneToOne: false
            referencedRelation: "client_invoices"
            referencedColumns: ["invoice_number"]
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
          seller_id: string | null
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
          seller_id?: string | null
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
          seller_id?: string | null
          slug?: string
          starting_price_cents?: number | null
          status?: Database["public"]["Enums"]["publish_status"]
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          commission_cents: number | null
          created_at: string
          environment: string
          granted_at: string
          id: string
          kind: string
          price_id: string | null
          seller_id: string | null
          seller_paid: boolean
          slug: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          commission_cents?: number | null
          created_at?: string
          environment?: string
          granted_at?: string
          id?: string
          kind: string
          price_id?: string | null
          seller_id?: string | null
          seller_paid?: boolean
          slug: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          commission_cents?: number | null
          created_at?: string
          environment?: string
          granted_at?: string
          id?: string
          kind?: string
          price_id?: string | null
          seller_id?: string | null
          seller_paid?: boolean
          slug?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entitlements_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
          id?: string
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
      user_learning_progress: {
        Row: {
          completed_at: string | null
          completed_item_ids: string[]
          created_at: string
          current_item_id: string | null
          id: string
          path_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_item_ids?: string[]
          created_at?: string
          current_item_id?: string | null
          id?: string
          path_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_item_ids?: string[]
          created_at?: string
          current_item_id?: string | null
          id?: string
          path_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_current_item_id_fkey"
            columns: ["current_item_id"]
            isOneToOne: false
            referencedRelation: "learning_path_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
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
          marketing_consent: boolean
          marketing_consent_at: string | null
          marketing_consent_source: string | null
          marketing_consent_version: string | null
          product_slug: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          ip_hash?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          marketing_consent_version?: string | null
          product_slug?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          ip_hash?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          marketing_consent_source?: string | null
          marketing_consent_version?: string | null
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
      consume_public_rate_limit: {
        Args: {
          p_key_hash: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
