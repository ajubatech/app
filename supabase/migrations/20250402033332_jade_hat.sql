/*
  # Add Draft Support and Notifications

  1. New Tables
    - listing_drafts
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - category (text)
      - content (jsonb)
      - last_saved (timestamp)
      - created_at (timestamp)
    
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - type (text)
      - listing_id (uuid, foreign key)
      - message (text)
      - created_at (timestamp)
      - read (boolean)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create listing_drafts table
CREATE TABLE IF NOT EXISTS listing_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  last_saved timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('real_estate', 'products', 'services', 'automotive', 'pets'))
);

ALTER TABLE listing_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for listing_drafts
CREATE POLICY "Users can manage own drafts"
  ON listing_drafts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  CONSTRAINT valid_type CHECK (type IN ('listing_published', 'draft_saved', 'listing_viewed', 'listing_liked', 'message_received'))
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add status column to listings if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'status'
  ) THEN
    ALTER TABLE listings ADD COLUMN status text DEFAULT 'draft';
    ALTER TABLE listings ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived', 'deleted'));
  END IF;
END $$;