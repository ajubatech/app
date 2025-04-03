/*
  # Add Reels and Engagement Features

  1. New Tables
    - saved_listings
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - listing_id (uuid, foreign key)
      - created_at (timestamp)
    
    - reel_comments
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - reel_id (uuid, foreign key)
      - comment (text)
      - created_at (timestamp)

    - messages
      - id (uuid, primary key)
      - sender_id (uuid, foreign key)
      - receiver_id (uuid, foreign key)
      - listing_id (uuid, foreign key)
      - content (text)
      - created_at (timestamp)
      - read (boolean)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create saved_listings table
CREATE TABLE IF NOT EXISTS saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_listings
CREATE POLICY "Users can manage own saved listings"
  ON saved_listings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create reel_comments table
CREATE TABLE IF NOT EXISTS reel_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reel_id uuid REFERENCES media(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for reel_comments
CREATE POLICY "Anyone can read reel comments"
  ON reel_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage own comments"
  ON reel_comments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can manage own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR receiver_id = auth.uid());