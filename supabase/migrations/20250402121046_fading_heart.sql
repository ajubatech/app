/*
  # Add Invoice System Tables

  1. New Tables
    - invoices
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - recipient_email (text)
      - listing_id (uuid, foreign key, nullable)
      - type (enum)
      - title (text)
      - description (text)
      - amount (numeric)
      - status (enum)
      - issue_date (timestamp)
      - due_date (timestamp)
      - pdf_url (text)
      - created_at (timestamp)
    
    - invoice_settings
      - user_id (uuid, primary key)
      - business_name (text)
      - logo_url (text)
      - address (text)
      - terms (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - invoice_items
      - id (uuid, primary key)
      - invoice_id (uuid, foreign key)
      - description (text)
      - quantity (numeric)
      - unit_price (numeric)
      - amount (numeric)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create invoice type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_type') THEN
    CREATE TYPE invoice_type AS ENUM ('sale', 'rent', 'service', 'product');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
  END IF;
END $$;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_name text,
  recipient_address text,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  amount numeric NOT NULL,
  tax_rate numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  issue_date timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL,
  pdf_url text,
  invoice_number text,
  reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('sale', 'rent', 'service', 'product')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled'))
);

-- Create invoice_settings table
CREATE TABLE IF NOT EXISTS invoice_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  tax_number text,
  bank_details jsonb DEFAULT '{}',
  terms text,
  notes text,
  invoice_prefix text DEFAULT 'INV-',
  next_invoice_number integer DEFAULT 1001,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  amount numeric NOT NULL,
  tax_rate numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can read own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for invoice_settings
CREATE POLICY "Users can read own invoice settings"
  ON invoice_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own invoice settings"
  ON invoice_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own invoice settings"
  ON invoice_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for invoice_items
CREATE POLICY "Users can read own invoice items"
  ON invoice_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own invoice items"
  ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items"
  ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items"
  ON invoice_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_settings_updated_at
BEFORE UPDATE ON invoice_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix text;
  next_number integer;
BEGIN
  -- Get the prefix and next number from invoice_settings
  SELECT invoice_prefix, next_invoice_number 
  INTO prefix, next_number
  FROM invoice_settings
  WHERE user_id = NEW.user_id;
  
  -- If no settings found, use defaults
  IF prefix IS NULL THEN
    prefix := 'INV-';
  END IF;
  
  IF next_number IS NULL THEN
    next_number := 1001;
  END IF;
  
  -- Set the invoice number
  NEW.invoice_number := prefix || next_number::text;
  
  -- Update the next invoice number in settings
  UPDATE invoice_settings
  SET next_invoice_number = next_number + 1
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate invoice number
CREATE TRIGGER generate_invoice_number_trigger
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_invoice_number();