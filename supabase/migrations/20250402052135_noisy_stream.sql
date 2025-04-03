/*
  # Stripe Integration Schema

  1. New Tables
    - stripe_customers
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - customer_id (text)
      - email (text)
      - created_at (timestamp)
    
    - user_subscriptions
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - stripe_subscription_id (text)
      - plan_id (text)
      - status (text)
      - current_period_start (timestamp)
      - current_period_end (timestamp)
      - cancel_at_period_end (boolean)
      - canceled_at (timestamp)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - payment_logs
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - session_id (text)
      - product_id (text)
      - amount (numeric)
      - currency (text)
      - status (text)
      - completed_at (timestamp)
      - created_at (timestamp)
    
    - credit_transactions
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - credit_type (text)
      - amount (integer)
      - source (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(customer_id)
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  plan_id text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stripe_subscription_id)
);

-- Create payment_logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text,
  product_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  credit_type text NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_credit_type CHECK (credit_type IN ('ai', 'listing')),
  CONSTRAINT valid_source CHECK (source IN ('purchase', 'subscription', 'admin', 'system'))
);

-- Add listing_credits column to users table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'listing_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN listing_credits integer DEFAULT 5;
  END IF;
END $$;

-- Create function to add listing_credits column if needed
CREATE OR REPLACE FUNCTION add_listing_credits_column()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'listing_credits'
  ) THEN
    ALTER TABLE users ADD COLUMN listing_credits integer DEFAULT 5;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_customers
CREATE POLICY "Users can read own stripe customer"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for payment_logs
CREATE POLICY "Users can read own payment logs"
  ON payment_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for credit_transactions
CREATE POLICY "Users can read own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for admins
CREATE POLICY "Admins can read all stripe customers"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can read all subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can read all payment logs"
  ON payment_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can read all credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );