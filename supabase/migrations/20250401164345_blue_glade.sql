/*
  # Create Service Metadata Table

  1. New Table
    - service_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - category (text)
      - hourly_rate (numeric)
      - add_ons (jsonb)
      - availability (jsonb)
      - area_served (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_metadata') THEN
    CREATE TABLE service_metadata (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
      category text NOT NULL,
      hourly_rate numeric,
      add_ons jsonb DEFAULT '[]',
      availability jsonb DEFAULT '{}',
      area_served jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE service_metadata ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
  END IF;
END $$;