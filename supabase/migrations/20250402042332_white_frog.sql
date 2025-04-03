/*
  # Initial Admin Schema Setup

  1. New Tables
    - admin_roles
    - admin_settings
    - pricing_rules
    - business_audits
    - scheduled_posts

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create role type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin', 'content_admin', 'support_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id),
  UNIQUE(category, key)
);

-- Create pricing_rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category, name)
);

-- Create business_audits table
CREATE TABLE IF NOT EXISTS business_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES users(id) ON DELETE CASCADE,
  auditor_id uuid REFERENCES users(id),
  status text NOT NULL,
  notes text,
  flags jsonb DEFAULT '[]',
  audit_date timestamptz DEFAULT now()
);

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  platform text NOT NULL,
  content text NOT NULL,
  hashtags text[] DEFAULT '{}',
  scheduled_for timestamptz NOT NULL,
  posted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_platform CHECK (platform IN ('instagram', 'facebook', 'linkedin'))
);

-- Add RLS policies
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Admin roles policies
CREATE POLICY "Only super admins can manage roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Admin settings policies
CREATE POLICY "Admins can read settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Pricing rules policies
CREATE POLICY "Admins can read pricing rules"
  ON pricing_rules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage pricing rules"
  ON pricing_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Business audits policies
CREATE POLICY "Admins can manage audits"
  ON business_audits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Scheduled posts policies
CREATE POLICY "Content admins can manage posts"
  ON scheduled_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('content_admin', 'admin', 'super_admin')
    )
  );

-- Insert default pricing rules
INSERT INTO pricing_rules (category, name, rules) VALUES
  ('property', 'Standard', '{"rent": 50, "sale": 100, "full_management": 200}'),
  ('ai_credits', 'Default', '{"price_per_credit": 1, "bulk_discount": {"50": 0.9, "100": 0.8}}'),
  ('business_plans', 'Q2_2025', '{"free_trial_days": 90, "pro_monthly": 49, "pro_yearly": 490}')
ON CONFLICT (category, name) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (category, key, value) VALUES
  ('ai', 'usage_limits', '{"free": 10, "basic": 50, "pro": 100}'),
  ('listings', 'quotas', '{"free": 5, "basic": 20, "pro": "unlimited"}'),
  ('features', 'toggles', '{"ai_generation": true, "social_posting": true, "bulk_import": false}')
ON CONFLICT (category, key) DO NOTHING;