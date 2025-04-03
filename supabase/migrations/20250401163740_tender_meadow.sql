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
    - Valid transmission types
    - Valid fuel types
    - Valid body types
*/

-- Create table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS automotive_metadata (
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
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;