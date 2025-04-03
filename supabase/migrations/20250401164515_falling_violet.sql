/*
  # Create Real Estate Metadata Table

  1. New Table
    - real_estate_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - property_type (text)
      - bedrooms (integer)
      - bathrooms (integer)
      - parking (integer)
      - land_size (integer)
      - floor_area (integer)
      - year_built (integer)
      - features (text[])
      - amenities (text[])
      - open_homes (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'real_estate_metadata') THEN
    CREATE TABLE real_estate_metadata (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
      property_type text NOT NULL,
      bedrooms integer NOT NULL,
      bathrooms integer NOT NULL,
      parking integer NOT NULL,
      land_size integer NOT NULL,
      floor_area integer NOT NULL,
      year_built integer,
      features text[],
      amenities text[],
      open_homes jsonb DEFAULT '[]',
      created_at timestamptz DEFAULT now(),
      CONSTRAINT valid_property_type CHECK (property_type IN ('house', 'apartment', 'townhouse', 'land'))
    );

    -- Enable RLS
    ALTER TABLE real_estate_metadata ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can read real estate metadata"
      ON real_estate_metadata
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = real_estate_metadata.listing_id
          AND (listings.status = 'active' OR listings.user_id = auth.uid())
        )
      );

    CREATE POLICY "Users can manage own real estate metadata"
      ON real_estate_metadata
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = real_estate_metadata.listing_id
          AND listings.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = real_estate_metadata.listing_id
          AND listings.user_id = auth.uid()
        )
      );
  END IF;
END $$;