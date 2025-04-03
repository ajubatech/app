/*
  # Create Automotive Metadata Table

  1. New Table
    - automotive_metadata
      - id (uuid, primary key)
      - listing_id (uuid, foreign key)
      - make (text)
      - model (text)
      - year (integer)
      - variant (text)
      - body_type (text)
      - transmission (text)
      - fuel_type (text)
      - engine (jsonb)
      - odometer (integer)
      - registration (jsonb)
      - features (text[])
      - history (jsonb)
      - created_at (timestamp)

  2. Constraints
    - Valid transmission types (automatic, manual)
    - Valid fuel types (petrol, diesel, hybrid, electric, lpg)
    - Valid body types (sedan, suv, hatchback, wagon, coupe, convertible, ute, van)

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'automotive_metadata') THEN
    CREATE TABLE automotive_metadata (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
      make text NOT NULL,
      model text NOT NULL,
      year integer NOT NULL,
      variant text,
      body_type text NOT NULL,
      transmission text NOT NULL,
      fuel_type text NOT NULL,
      engine jsonb DEFAULT '{}',
      odometer integer NOT NULL,
      registration jsonb NOT NULL,
      features text[],
      history jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      CONSTRAINT valid_transmission CHECK (transmission IN ('automatic', 'manual')),
      CONSTRAINT valid_fuel_type CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric', 'lpg')),
      CONSTRAINT valid_body_type CHECK (body_type IN ('sedan', 'suv', 'hatchback', 'wagon', 'coupe', 'convertible', 'ute', 'van'))
    );

    -- Enable RLS
    ALTER TABLE automotive_metadata ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can read automotive metadata"
      ON automotive_metadata
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = automotive_metadata.listing_id
          AND (listings.status = 'active' OR listings.user_id = auth.uid())
        )
      );

    CREATE POLICY "Users can manage own automotive metadata"
      ON automotive_metadata
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = automotive_metadata.listing_id
          AND listings.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = automotive_metadata.listing_id
          AND listings.user_id = auth.uid()
        )
      );
  END IF;
END $$;