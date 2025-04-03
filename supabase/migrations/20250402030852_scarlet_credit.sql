/*
  # Create Lookup History Table

  1. New Table
    - lookup_history
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - rego_plate (text)
      - state (text)
      - country (text)
      - status (text)
      - data (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lookup_history') THEN
    CREATE TABLE lookup_history (
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

    -- Enable RLS
    ALTER TABLE lookup_history ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can read own lookup history"
      ON lookup_history
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());

    CREATE POLICY "Users can create lookup history"
      ON lookup_history
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;