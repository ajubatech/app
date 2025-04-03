/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - avatar_url (text)
      - created_at (timestamp)
      - role (text)
      - subscription_type (text)
      - ai_credits (integer)
    
    - listings
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - category (text)
      - price (numeric)
      - user_id (uuid, foreign key)
      - created_at (timestamp)
      - updated_at (timestamp)
      - status (text)
      - metadata (jsonb)
      - views (integer)
      - likes (integer)
      - location (jsonb)

    - media
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - url (text)
      - type (text)
      - tag (text)
      - status (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  role text DEFAULT 'user',
  subscription_type text DEFAULT 'free',
  ai_credits integer DEFAULT 10
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}',
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  location jsonb DEFAULT '{}',
  CONSTRAINT valid_category CHECK (category IN ('real_estate', 'products', 'services', 'automotive'))
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active listings"
  ON listings
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Users can CRUD own listings"
  ON listings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Media Table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL,
  tag text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('image', 'video'))
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active media"
  ON media
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Users can CRUD own media"
  ON media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = media.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = media.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();