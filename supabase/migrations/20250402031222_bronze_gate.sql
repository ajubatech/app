/*
  # Create Property Lookup Logs Table

  1. New Table
    - property_lookup_logs
      - id (uuid, primary key)
      - address (text)
      - country (text)
      - success (boolean)
      - data (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'property_lookup_logs') THEN
    CREATE TABLE property_lookup_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      address text NOT NULL,
      country text NOT NULL,
      success boolean NOT NULL,
      data jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      CONSTRAINT valid_country CHECK (country IN ('AU', 'NZ'))
    );

    -- Enable RLS
    ALTER TABLE property_lookup_logs ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can read property lookup logs"
      ON property_lookup_logs
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Users can create property lookup logs"
      ON property_lookup_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;