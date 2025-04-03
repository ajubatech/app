/*
  # AI Features Schema Update

  1. New Tables
    - product_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - condition (text)
      - brand (text)
      - model (text)
      - specifications (jsonb)
      - shipping_info (jsonb)
    
    - pet_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - breed (text)
      - age (integer)
      - gender (text)
      - health_info (jsonb)
      - training (jsonb)
    
    - service_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - category (text)
      - hourly_rate (numeric)
      - add_ons (jsonb)
      - availability (jsonb)
      - area_served (jsonb)

    - user_skills
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - skill (text)
      - certification (text)
      - verified (boolean)
      - added_at (timestamp)

    - training_modules
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - url (text)
      - topic (text)
      - created_at (timestamp)

    - ai_recommendations
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - type (text)
      - content (jsonb)
      - created_at (timestamp)

    - pro_plus_subscriptions
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - active (boolean)
      - features (jsonb)
      - started_at (timestamp)
      - expires_at (timestamp)

    - call_agent_logs
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - type (text)
      - summary (text)
      - metadata (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Product Metadata Table
CREATE TABLE IF NOT EXISTS product_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  condition text NOT NULL,
  brand text,
  model text,
  specifications jsonb DEFAULT '{}',
  shipping_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_condition CHECK (condition IN ('new', 'used', 'refurbished'))
);

ALTER TABLE product_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read product metadata"
  ON product_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = product_metadata.listing_id
      AND (listings.status = 'active' OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own product metadata"
  ON product_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = product_metadata.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = product_metadata.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Pet Metadata Table
CREATE TABLE IF NOT EXISTS pet_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  breed text NOT NULL,
  age integer,
  gender text,
  health_info jsonb DEFAULT '{}',
  training jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female'))
);

ALTER TABLE pet_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read pet metadata"
  ON pet_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = pet_metadata.listing_id
      AND (listings.status = 'active' OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own pet metadata"
  ON pet_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = pet_metadata.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = pet_metadata.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Service Metadata Table
CREATE TABLE IF NOT EXISTS service_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  category text NOT NULL,
  hourly_rate numeric,
  add_ons jsonb DEFAULT '{}',
  availability jsonb DEFAULT '{}',
  area_served jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read service metadata"
  ON service_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = service_metadata.listing_id
      AND (listings.status = 'active' OR listings.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own service metadata"
  ON service_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = service_metadata.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = service_metadata.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- User Skills Table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  skill text NOT NULL,
  certification text,
  verified boolean DEFAULT false,
  added_at timestamptz DEFAULT now()
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own skills"
  ON user_skills
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own skills"
  ON user_skills
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Training Modules Table
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read training modules"
  ON training_modules
  FOR SELECT
  TO public
  USING (true);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('job', 'training', 'service', 'listing'))
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recommendations"
  ON ai_recommendations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own recommendations"
  ON ai_recommendations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Pro Plus Subscriptions Table
CREATE TABLE IF NOT EXISTS pro_plus_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  active boolean DEFAULT true,
  features jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE pro_plus_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON pro_plus_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Call Agent Logs Table
CREATE TABLE IF NOT EXISTS call_agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  summary text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('inbound', 'outbound'))
);

ALTER TABLE call_agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own call logs"
  ON call_agent_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own call logs"
  ON call_agent_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());