/*
  # Add Reels and Social Sharing Schema

  1. New Tables
    - reels
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - listing_id (uuid, foreign key)
      - media_id (uuid, foreign key)
      - title (text)
      - caption (text)
      - hashtags (text[])
      - music (jsonb)
      - effects (jsonb)
      - status (text)
      - views (integer)
      - created_at (timestamp)
      - published_at (timestamp)
    
    - reel_engagements
      - id (uuid, primary key)
      - reel_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - type (text)
      - comment_text (text)
      - created_at (timestamp)
    
    - social_shares
      - id (uuid, primary key)
      - reel_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - platform (text)
      - status (text)
      - share_url (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create reels table
CREATE TABLE IF NOT EXISTS reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  media_id uuid REFERENCES media(id) ON DELETE SET NULL,
  title text,
  caption text,
  hashtags text[],
  music jsonb DEFAULT '{}',
  effects jsonb DEFAULT '{}',
  status text DEFAULT 'draft',
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create reel_engagements table
CREATE TABLE IF NOT EXISTS reel_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  comment_text text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('like', 'comment', 'share', 'save'))
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id uuid REFERENCES reels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  status text DEFAULT 'pending',
  share_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_platform CHECK (platform IN ('facebook', 'instagram', 'twitter', 'tiktok', 'linkedin')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'shared', 'failed'))
);

-- Enable RLS on all tables
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for reels
CREATE POLICY "Anyone can read published reels"
  ON reels
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Users can manage own reels"
  ON reels
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for reel_engagements
CREATE POLICY "Anyone can read reel engagements"
  ON reel_engagements
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own engagements"
  ON reel_engagements
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for social_shares
CREATE POLICY "Users can read own social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own social shares"
  ON social_shares
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS reels_user_id_idx ON reels(user_id);
CREATE INDEX IF NOT EXISTS reels_listing_id_idx ON reels(listing_id);
CREATE INDEX IF NOT EXISTS reel_engagements_reel_id_idx ON reel_engagements(reel_id);
CREATE INDEX IF NOT EXISTS reel_engagements_user_id_idx ON reel_engagements(user_id);
CREATE INDEX IF NOT EXISTS social_shares_reel_id_idx ON social_shares(reel_id);