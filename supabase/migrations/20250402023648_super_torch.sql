/*
  # Fix Lookup History Migration
  
  1. Create lookup_history table if not exists
  2. Add RLS policies if they don't exist
  3. Add constraints for valid countries
*/

-- Create the table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS lookup_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    rego_plate text NOT NULL,
    state text NOT NULL,
    country text NOT NULL DEFAULT 'AU',
    status text NOT NULL,
    data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    CONSTRAINT valid_country CHECK (country IN ('AU', 'NZ'))
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE lookup_history ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lookup_history' 
    AND policyname = 'Users can read own lookup history'
  ) THEN
    CREATE POLICY "Users can read own lookup history"
      ON lookup_history
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'lookup_history' 
    AND policyname = 'Users can create lookup history'
  ) THEN
    CREATE POLICY "Users can create lookup history"
      ON lookup_history
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;