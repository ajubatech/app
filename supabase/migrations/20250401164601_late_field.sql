/*
  # Create Pet Metadata Table

  1. New Table
    - pet_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - breed (text)
      - age (integer)
      - gender (text)
      - health_info (jsonb)
      - training (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pet_metadata') THEN
    CREATE TABLE pet_metadata (
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

    -- Enable RLS
    ALTER TABLE pet_metadata ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
  END IF;
END $$;