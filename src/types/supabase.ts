export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          role: string
          subscription_type: string
          ai_credits: number
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          role?: string
          subscription_type?: string
          ai_credits?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          role?: string
          subscription_type?: string
          ai_credits?: number
        }
      }
      listings: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          price: number
          user_id: string
          created_at: string
          updated_at: string
          status: string
          metadata: Json
          views: number
          likes: number
          location: Json
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          price: number
          user_id: string
          created_at?: string
          updated_at?: string
          status?: string
          metadata?: Json
          views?: number
          likes?: number
          location?: Json
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          price?: number
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          metadata?: Json
          views?: number
          likes?: number
          location?: Json
        }
      }
      media: {
        Row: {
          id: string
          listing_id: string
          url: string
          type: string
          tag: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          type: string
          tag?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          url?: string
          type?: string
          tag?: string | null
          status?: string
          created_at?: string
        }
      }
    }
  }
}