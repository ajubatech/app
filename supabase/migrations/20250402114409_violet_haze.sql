/*
  # Add Lister and Agency Profiles

  1. New Tables
    - lister_profiles
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - full_name (text)
      - avatar_url (text)
      - bio (text)
      - position (text)
      - experience_years (integer)
      - specializations (text[])
      - languages (text[])
      - certifications (text[])
      - contact_info (jsonb)
      - social_links (jsonb)
      - agency_id (uuid)
      - verified (boolean)
      - featured (boolean)
      - stats (jsonb)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - agency_profiles
      - id (uuid, primary key)
      - name (text)
      - slug (text)
      - logo_url (text)
      - banner_url (text)
      - description (text)
      - established_year (integer)
      - locations (jsonb)
      - contact_info (jsonb)
      - social_links (jsonb)
      - team_members (text[])
      - specializations (text[])
      - awards (jsonb)
      - stats (jsonb)
      - verified (boolean)
      - featured (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - user_follows
      - id (uuid, primary key)
      - follower_id (uuid, foreign key)
      - following_id (uuid, foreign key)
      - created_at (timestamp)
    
    - saved_agents
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - agent_id (uuid, foreign key)
      - created_at (timestamp)
    
    - agency_follows
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - agency_id (uuid, foreign key)
      - created_at (timestamp)
    
    - saved_agencies
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - agency_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Add username column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username text;
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users (username);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'verified'
  ) THEN
    ALTER TABLE users ADD COLUMN verified boolean DEFAULT false;
  END IF;
END $$;

-- Create lister_profiles table
CREATE TABLE IF NOT EXISTS lister_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  position text,
  experience_years integer,
  specializations text[],
  languages text[],
  certifications text[],
  contact_info jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  agency_id uuid,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  stats jsonb DEFAULT '{"listings_count": 0, "sold_count": 0, "rented_count": 0, "rating": 0, "reviews_count": 0}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agency_profiles table
CREATE TABLE IF NOT EXISTS agency_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  banner_url text,
  description text,
  established_year integer,
  locations jsonb DEFAULT '[]',
  contact_info jsonb DEFAULT '{}',
  social_links jsonb DEFAULT '{}',
  team_members text[] DEFAULT '{}',
  specializations text[],
  awards jsonb DEFAULT '[]',
  stats jsonb DEFAULT '{"listings_count": 0, "sold_count": 0, "rented_count": 0, "rating": 0, "reviews_count": 0}',
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create saved_agents table
CREATE TABLE IF NOT EXISTS saved_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Create agency_follows table
CREATE TABLE IF NOT EXISTS agency_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES agency_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agency_id)
);

-- Create saved_agencies table
CREATE TABLE IF NOT EXISTS saved_agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES agency_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agency_id)
);

-- Enable RLS on all tables
ALTER TABLE lister_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_agencies ENABLE ROW LEVEL SECURITY;

-- Create policies for lister_profiles
CREATE POLICY "Anyone can read lister profiles"
  ON lister_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own lister profile"
  ON lister_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own lister profile"
  ON lister_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for agency_profiles
CREATE POLICY "Anyone can read agency profiles"
  ON agency_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Agency admins can update agency profile"
  ON agency_profiles
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT agency_id FROM lister_profiles
      WHERE user_id = auth.uid() AND position IN ('owner', 'admin', 'principal')
    )
  )
  WITH CHECK (
    id IN (
      SELECT agency_id FROM lister_profiles
      WHERE user_id = auth.uid() AND position IN ('owner', 'admin', 'principal')
    )
  );

-- Create policies for user_follows
CREATE POLICY "Users can manage own follows"
  ON user_follows
  FOR ALL
  TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can read who follows them"
  ON user_follows
  FOR SELECT
  TO authenticated
  USING (following_id = auth.uid());

-- Create policies for saved_agents
CREATE POLICY "Users can manage saved agents"
  ON saved_agents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for agency_follows
CREATE POLICY "Users can manage agency follows"
  ON agency_follows
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for saved_agencies
CREATE POLICY "Users can manage saved agencies"
  ON saved_agencies
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for lister_profiles
CREATE TRIGGER update_lister_profiles_updated_at
BEFORE UPDATE ON lister_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for agency_profiles
CREATE TRIGGER update_agency_profiles_updated_at
BEFORE UPDATE ON agency_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();